"use client";
import { useEffect, useState } from "react";

type Slots = { [day:string]: string[] }; // { mon: ["10:00-12:00", ...], ... }

export default function Availability(){
  const [slots, setSlots] = useState<Slots>({ mon:[], tue:[], wed:[], thu:[], fri:[], sat:[], sun:[] });
  const [msg, setMsg] = useState("");

  useEffect(()=>{ (async ()=>{
    const r = await fetch("/api/speakers");
    const j = await r.json();
    if (j.me?.availability) setSlots(j.me.availability);
  })(); },[]);

  function add(day:string, value:string){
    if (!value) return;
    setSlots(prev => ({ ...prev, [day]: [...(prev[day]||[]), value] }));
  }

  async function save(){
    const r = await fetch("/api/speakers", { method:"POST", body: JSON.stringify({ availability: slots })});
    const j = await r.json();
    setMsg("Saved availability");
  }

  const days = ["mon","tue","wed","thu","fri","sat","sun"];
  return (
    <div>
      <h1>My Availability</h1>
      <p>Add time ranges like <code>10:00-12:00</code></p>
      <div className="card">
        {days.map(d => (
          <div key={d} style={{marginBottom:8}}>
            <b style={{textTransform:"uppercase"}}>{d}</b>
            <input placeholder="10:00-12:00" onKeyDown={(e:any)=>{ if(e.key==="Enter"){ add(d, e.currentTarget.value); e.currentTarget.value=""; }}}/>
            <div>{(slots[d]||[]).map((s,i)=><span key={i} style={{marginRight:8}}>{s}</span>)}</div>
          </div>
        ))}
        <button onClick={save}>Save Availability</button>
        {msg && <p>{msg}</p>}
      </div>
    </div>
  );
}
