import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET(_: Request, { params }: { params: { bookingId: string } }){
  const bId = params.bookingId;
  const booking = await prisma.booking.findUnique({ where: { id: bId }, include: { speaker: { include: { user: true } }, event: true }});
  if (!booking) return NextResponse.json({ ok:false, error: "Booking not found" }, { status:404 });

  const inv = await prisma.invoice.findUnique({ where: { bookingId: bId }});
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595,842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  page.drawText("Xainik — Invoice", { x:50, y:780, size:20, font, color: rgb(0,0,0) });
  page.drawText(`Booking ID: ${bId}`, { x:50, y:750, size:12, font });
  page.drawText(`Event: ${booking.event.title}`, { x:50, y:730, size:12, font });
  page.drawText(`Speaker: ${booking.speaker.user?.name || booking.speakerId}`, { x:50, y:710, size:12, font });
  page.drawText(`Amount: ₹ ${booking.amountINR.toLocaleString("en-IN")}`, { x:50, y:690, size:12, font });
  if (inv) {
    page.drawText(`Total: ₹ ${inv.totalINR.toLocaleString("en-IN")}`, { x:50, y:670, size:12, font });
    page.drawText(`Status: ${inv.status}`, { x:50, y:650, size:12, font });
  }
  const bytes = await pdf.save();
  return new NextResponse(bytes as any, { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="Xainik-Invoice-${bId}.pdf"` }});
}
