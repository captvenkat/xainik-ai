"use client";
import { useState } from "react";

export default function BookingActions({ bookingId }: { bookingId: string }) {
  const [msg, setMsg] = useState("");

  async function confirm() {
    setMsg("Confirming...");
    const r = await fetch("/api/bookings/confirm", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bookingId })
    });
    const j = await r.json();
    setMsg(j.ok ? "Booking confirmed ✅" : "Failed to confirm");
  }

  async function payout() {
    setMsg("Queuing payout...");
    const r = await fetch("/api/payouts/queue", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bookingId })
    });
    const j = await r.json();
    setMsg(j.ok ? "Payout queued ✅" : "Failed to queue payout");
  }

  return (
    <div style={{display:"inline-flex", gap:8}}>
      <button onClick={confirm}>Confirm</button>
      <button onClick={payout}>Queue 90% Payout</button>
      {msg && <span style={{marginLeft:8, fontSize:12, opacity:.7}}>{msg}</span>}
    </div>
  );
}
