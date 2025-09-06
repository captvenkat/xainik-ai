import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET ?eventId=...
export async function GET(req: Request){
  const u = new URL(req.url);
  const eventId = u.searchParams.get("eventId") || undefined;
  const where = eventId ? { eventId } : {};
  const rows = await prisma.shortlist.findMany({ where, include: { speaker: { include: { user: true }}, event: true }, orderBy: { createdAt: "desc" }});
  return NextResponse.json({ ok:true, shortlists: rows });
}

// POST { eventId, speakerId } -> pending
export async function POST(req: Request){
  const ct = req.headers.get("content-type") || "";
  let b: any = {};
  if (ct.includes("application/json")) b = await req.json();
  else {
    const form = await req.formData();
    if (form.get("__json")) {
      b = Object.fromEntries(Array.from(form.entries()).map(([k,v])=>[k,String(v)]));
    }
  }
  const row = await prisma.shortlist.create({ data: { eventId: b.eventId, speakerId: b.speakerId }});
  return NextResponse.json({ ok:true, shortlist: row });
}

// PATCH { id, status } -> selected|rejected
export async function PATCH(req: Request){
  const b = await req.json();
  const row = await prisma.shortlist.update({ where: { id: b.id }, data: { status: b.status }});
  return NextResponse.json({ ok:true, shortlist: row });
}
