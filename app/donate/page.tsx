"use client";
import { useEffect, useState } from "react";

declare global {
  interface Window { Razorpay?: any }
}

const tiers = [1000, 2500, 5000, 7500, 10000];

async function loadRazorpayScript() {
  if (window.Razorpay) return true;
  return new Promise<boolean>((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function Donate(){
  const [amount, setAmount] = useState<number>(tiers[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resp, setResp] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(()=>{ loadRazorpayScript(); },[]);

  async function donate(e:any){
    e.preventDefault();
    setBusy(true);
    try {
      const orderRes = await fetch("/api/donations/create-order", {
        method: "POST",
        body: JSON.stringify({ amountINR: amount, donorName: name, donorEmail: email })
      });
      const order = await orderRes.json();
      setResp("Order Created: " + order.orderId);

      const ok = await loadRazorpayScript();
      if (!ok || !window.Razorpay) {
        alert("Could not load Razorpay. Please try again.");
        return;
      }

      const rz = new window.Razorpay({
        key: order.keyId,
        amount: order.amountINR * 100,
        currency: "INR",
        name: "Xainik",
        description: "Donation",
        order_id: order.orderId,
        prefill: { name, email },
        handler: async function (response:any) {
          // Verify on server
          const verify = await fetch("/api/donations/verify", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });
          const v = await verify.json();
          if (v.ok) {
            // Download receipt
            const receipt = await fetch(`/api/donations/receipt?donorEmail=${encodeURIComponent(email)}&amountINR=${amount}&name=${encodeURIComponent(name)}&orderId=${response.razorpay_order_id}&paymentId=${response.razorpay_payment_id}`);
            const blob = await receipt.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = "Xainik-Donation-Receipt.pdf"; a.click();
            setResp("Donation successful ✅");
          } else {
            setResp("Verification failed");
          }
        }
      });
      rz.open();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1>Support Xainik</h1>
      <form onSubmit={donate} className="card">
        <label>Donor Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your Name" required/>
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/>
        <label>Amount (₹)</label>
        <select value={amount} onChange={e=>setAmount(Number(e.target.value))}>
          {tiers.map(t => <option key={t} value={t}>₹ {t.toLocaleString()}</option>)}
        </select>
        <button type="submit" disabled={busy}>{busy ? "Processing..." : "Donate securely"}</button>
      </form>
      {resp && <pre className="card" style={{whiteSpace:"pre-wrap"}}>{resp}</pre>}
    </div>
  );
}