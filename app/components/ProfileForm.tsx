"use client";
import { useEffect, useState } from "react";

export default function ProfileForm(){
  const [form, setForm] = useState({ headline:"", bio:"", topics:"" });
  const [msg, setMsg] = useState("");

  useEffect(()=>{ (async ()=>{
    const r = await fetch("/api/speakers");
    const j = await r.json();
    if (j.me) {
      setForm({
        headline: j.me.headline || "",
        bio: j.me.bio || "",
        topics: (j.me.topics||[]).join(", ")
      });
    }
  })(); },[]);

  async function save(e:any){
    e.preventDefault();
    const payload = { ...form, topics: form.topics.split(",").map(s=>s.trim()).filter(Boolean) };
    const r = await fetch("/api/speakers", { method: "POST", body: JSON.stringify(payload) });
    const j = await r.json();
    setMsg("Saved: " + JSON.stringify(j));
  }

  return (
    <form onSubmit={save} className="card">
      <label>Headline</label>
      <input value={form.headline} onChange={e=>setForm({...form, headline:e.target.value})}/>
      <label>Bio</label>
      <textarea rows={4} value={form.bio} onChange={e=>setForm({...form, bio:e.target.value})}/>
      <label>Topics (comma separated)</label>
      <input value={form.topics} onChange={e=>setForm({...form, topics:e.target.value})}/>
      <button type="submit">Save</button>
      {msg && <pre style={{whiteSpace:"pre-wrap"}}>{msg}</pre>}
    </form>
  );
}
