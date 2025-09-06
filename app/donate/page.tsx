"use client";
import { useState } from "react";

const tiers = [1000, 2500, 5000, 7500, 10000];

export default function Donate(){
  const [amount, setAmount] = useState<number>(tiers[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resp, setResp] = useState("");

  async function donate(e:any){
    e.preventDefault();
    const orderRes = await fetch("/api/donations/create-order", {
      method: "POST",
      body: JSON.stringify({ amountINR: amount, donorName: name, donorEmail: email })
    });
    const order = await orderRes.json();
    setResp("Order Created: " + JSON.stringify(order));

    // Simulate payment → verify immediately (for MVP)
    const verify = await fetch("/api/donations/verify", { method: "POST", body: JSON.stringify({ orderId: order.orderId }) });
    const v = await verify.json();

    const receipt = await fetch(`/api/donations/receipt?donorEmail=${encodeURIComponent(email)}&amountINR=${amount}&name=${encodeURIComponent(name)}`);
    const blob = await receipt.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "Xainik-Donation-Receipt.pdf"; a.click();
  }

  return (
    <div>
      <h1>Support Xainik</h1>
      <form onSubmit={donate} className="card">
        <label>Donor Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your Name"/>
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
        <label>Amount (₹)</label>
        <select value={amount} onChange={e=>setAmount(Number(e.target.value))}>
          {tiers.map(t => <option key={t} value={t}>₹ {t.toLocaleString()}</option>)}
        </select>
        <button type="submit">Donate & Download Receipt</button>
      </form>
      {resp && <pre className="card" style={{whiteSpace:"pre-wrap"}}>{resp}</pre>}
    </div>
  );
}