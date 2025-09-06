import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request){
  const b = await req.json();
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
