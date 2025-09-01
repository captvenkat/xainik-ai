"use client";
import { useState } from "react";
import { z } from "zod";
import VoiceWhisper from "./VoiceWhisper";

const Schema = z.object({ name: z.string().min(2).max(80), message: z.string().min(10).max(600) });

export default function ComposeForm({ defaultName }: { defaultName: string }) {
  const [name, setName] = useState(defaultName || "");
  const [message, setMessage] = useState("");
  const [count, setCount] = useState(0);
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerMsg(null);
    setError(null);
    const parsed = Schema.safeParse({ name, message });
    if (!parsed.success) {
      setError("Please check your input.");
      return;
    }
    const res = await fetch("/api/voices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error || "Something went wrong.");
      return;
    }
    setServerMsg("Thanks—pending review.");
    setMessage("");
    setCount(0);
  };

  return (
    <form onSubmit={submit} className="space-y-4" aria-label="Compose testimonial form">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">Name</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium">Message</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => { setMessage(e.target.value.slice(0, 600)); setCount(e.target.value.slice(0, 600).length); }}
          className="mt-1 w-full rounded border p-3"
          rows={6}
          aria-describedby="message-help"
        />
        <div id="message-help" className="flex items-center justify-between text-xs mt-1">
          <span>By posting, you allow us to publish your name & message.</span>
          <span>{count}/600</span>
        </div>
        <VoiceWhisper onAppend={(t) => { const next = (message + (message ? " " : "") + t).slice(0, 600); setMessage(next); setCount(next.length); }} />
      </div>
      {error && <div className="text-red-700" role="alert">{error}</div>}
      {serverMsg && <div className="text-green-700" role="status">{serverMsg}</div>}
      <button className="px-4 py-2 rounded bg-[#111827] text-[#F9FAFB]" type="submit">Submit</button>
    </form>
  );
}


