"use client";
import { useEffect, useRef, useState } from "react";

export default function VoiceWhisper({ onAppend }: { onAppend: (t: string) => void }) {
  const [supported, setSupported] = useState(false);
  const [state, setState] = useState<"idle" | "listening" | "transcribing">("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const maxMs = (Number(process.env.NEXT_PUBLIC_STT_MAX_SECONDS) || 45) * 1000;

  useEffect(() => {
    setSupported(!!navigator.mediaDevices && !!window.MediaRecorder);
  }, []);

  if (!supported) return null;

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = rec;
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = async () => {
        setState("transcribing");
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const fd = new FormData();
        fd.append("audio", blob, "voice.webm");
        const res = await fetch("/api/stt", { method: "POST", body: fd });
        const data = await res.json();
        if (data?.text) onAppend(data.text as string);
        setState("idle");
      };
      rec.start();
      setState("listening");
      setTimeout(() => rec.state === "recording" && rec.stop(), maxMs);
    } catch (_e) {
      setState("idle");
    }
  };

  const stop = () => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state === "recording") rec.stop();
  };

  return (
    <div className="mt-2">
      <p className="text-xs opacity-70">Audio is transcribed to text. Only your text is saved.</p>
      {state === "idle" && (
        <button onClick={start} className="mt-2 px-3 py-2 rounded bg-[#B91C1C] text-white" aria-label="Start recording">Voice</button>
      )}
      {state === "listening" && (
        <button onClick={stop} className="mt-2 px-3 py-2 rounded bg-[#111827] text-[#F9FAFB]" aria-label="Stop recording">Listening… Stop</button>
      )}
      {state === "transcribing" && <div className="mt-2 text-sm">Transcribing…</div>}
    </div>
  );
}


