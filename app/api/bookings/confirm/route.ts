import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request){
  try {
    const b = await req.json(); // { bookingId }
    const booking = await prisma.booking.update({
      where: { id: b.bookingId },
      data: { status: "confirmed" }
    });
    // create invoice if absent
    const total = booking.amountINR;
    const tax = 0; // add tax logic later
    await prisma.invoice.upsert({
      where: { bookingId: booking.id },
      create: { bookingId: booking.id, amountINR: booking.amountINR, taxINR: tax, totalINR: total },
      update: { amountINR: booking.amountINR, taxINR: tax, totalINR: total }
    });
    return NextResponse.json({ ok:true, bookingId: booking.id, status: booking.status });
  } catch (error: any) {
    console.error("Booking confirm error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
