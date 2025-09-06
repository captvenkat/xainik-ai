import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request){
  const b = await req.json(); // { bookingId }
  const booking = await prisma.booking.findUnique({ where: { id: b.bookingId }, include: { speaker: { include: { user: true }}}});
  if (!booking) return NextResponse.json({ ok:false, error:"Booking not found" }, { status:404 });

  const speakerCut = Math.round(booking.amountINR * 0.9);
  const payout = await prisma.payout.create({
    data: {
      bookingId: booking.id,
      speakerId: booking.speakerId,
      amountINR: speakerCut,
      payoutToEmail: booking.speaker.user?.email || null,
      status: "queued"
    }
  });
  return NextResponse.json({ ok:true, payout });
}
