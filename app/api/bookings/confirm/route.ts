import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/db";
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ConfirmBookingSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required')
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { bookingId } = ConfirmBookingSchema.parse(body);
    
    const booking = await prisma.booking.update({
      where: { id: bookingId },
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
    
    return NextResponse.json({ 
      ok: true, 
      bookingId: booking.id, 
      status: booking.status 
    });
  } catch (error: any) {
    console.error("Booking confirm error:", error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json({ 
        error: 'VALIDATION_FAILED', 
        message: error.errors[0]?.message ?? 'Invalid request data' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'CONFIRM_FAILED', 
      message: error?.message ?? 'unknown' 
    }, { status: 500 });
  }
}
