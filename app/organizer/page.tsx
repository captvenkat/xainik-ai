"use client";
import { useState } from "react";

export default function Organizer() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [budget, setBudget] = useState(25000);
  const [msg, setMsg] = useState("");

  async function createEvent(e:any){
    e.preventDefault();
    const r = await fetch("/api/events", { method:"POST", body: JSON.stringify({ title, date, budgetINR: Number(budget) }) });
    const j = await r.json();
    setMsg(JSON.stringify(j));
  }

  return (
    <div>
      <h1>Organizer — Create Event</h1>
      <form onSubmit={createEvent} className="card">
        <label>Title</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Event title"/>
        <label>Date</label>
        <input value={date} onChange={e=>setDate(e.target.value)} placeholder="2025-09-30T10:00:00Z"/>
        <label>Budget (₹)</label>
        <input type="number" value={budget} onChange={e=>setBudget(Number(e.target.value))}/>
        <button type="submit">Create Event</button>
      </form>
      {msg && <pre className="card" style={{whiteSpace:"pre-wrap"}}>{msg}</pre>}
    </div>
  );
}
