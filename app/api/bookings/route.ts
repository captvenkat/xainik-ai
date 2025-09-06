import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
  const booking = await prisma.booking.create({
    data: {
      eventId: b.eventId,
      speakerId: b.speakerId,
      amountINR: Number(b.amountINR || 0),
      status: "pending"
    }
  });
  return NextResponse.json({ ok:true, booking });
}
