import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET ?eventId=...&speakerId=...
export async function GET(req: Request){
  const u = new URL(req.url);
  const eventId = u.searchParams.get("eventId");
  const speakerId = u.searchParams.get("speakerId");
  if (!eventId || !speakerId) return NextResponse.json({ ok:false, error:"Missing eventId/speakerId" }, { status:400 });
  const t = await prisma.quoteThread.findFirst({ where: { eventId, speakerId }});
  const log = t?.log ? JSON.parse(t.log) : [];
  return NextResponse.json({ ok:true, thread: t, log });
}

// POST { eventId, speakerId, by, text }
export async function POST(req: Request){
  const b = await req.json();
  const t = await prisma.quoteThread.upsert({
    where: { eventId_speakerId: undefined as any }, // no composite in MVP; we find manually
    create: { eventId: b.eventId, speakerId: b.speakerId, log: JSON.stringify([{ by: b.by, text: b.text, ts: Date.now() }]) },
    update: {}
  });
  // If exists, append
  if (t && t.id) {
    const cur = t.log ? JSON.parse(t.log) : [];
    cur.push({ by: b.by, text: b.text, ts: Date.now() });
    const up = await prisma.quoteThread.update({ where: { id: t.id }, data: { log: JSON.stringify(cur) } });
    return NextResponse.json({ ok:true, thread: up });
  }
  return NextResponse.json({ ok:true, thread: t });
}
