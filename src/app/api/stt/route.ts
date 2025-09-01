import { NextRequest, NextResponse } from "next/server";

const MAX_SECONDS = Number(process.env.STT_MAX_SECONDS || 45);
const MAX_BYTES = Number(process.env.STT_MAX_BYTES || 6000000);

const ipMap = new Map<string, number>();

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.warn("[Voices] Missing items:", ["OPENAI_API_KEY"]);
    return NextResponse.json(
      { error: "Speech-to-text unavailable. Please try typing your message." },
      { status: 501 }
    );
  }

  const ip = req.headers.get("x-forwarded-for") || "local";
  const now = Date.now();
  const last = ipMap.get(ip) || 0;
  if (now - last < 5000) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const form = await req.formData();
  const file = form.get("audio");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No audio provided" }, { status: 400 });
  }

  const type = file.type || "";
  const allowed = ["audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg", "audio/wav"];
  if (!allowed.includes(type)) {
    return NextResponse.json({ error: "Unsupported audio type" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Audio too large" }, { status: 400 });
  }

  // Duration check: best-effort via metadata is non-trivial server-side here; rely on client cap

  const transcribe = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: (() => {
      const fd = new FormData();
      fd.append("file", new Blob([buf], { type }), "audio.webm");
      fd.append("model", "whisper-1");
      return fd;
    })(),
  });

  if (!transcribe.ok) {
    const text = await transcribe.text();
    return NextResponse.json({ error: "Transcription failed", detail: text }, { status: 502 });
  }

  const data = await transcribe.json();
  ipMap.set(ip, now);
  return NextResponse.json({ text: data.text || "" });
}


