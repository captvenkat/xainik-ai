import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET(req: Request){
  const url = new URL(req.url);
  const name = url.searchParams.get("name") || "Donor";
  const email = url.searchParams.get("donorEmail") || "unknown@example.com";
  const amount = Number(url.searchParams.get("amountINR") || 0);

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]); // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  page.drawText("Xainik — Official Donation Receipt", { x: 50, y: 780, size: 20, font, color: rgb(0,0,0) });
  page.drawText(`Donor: ${name}`, { x: 50, y: 740, size: 12, font });
  page.drawText(`Email: ${email}`, { x: 50, y: 720, size: 12, font });
  page.drawText(`Amount: ₹ ${amount.toLocaleString("en-IN")}`, { x: 50, y: 700, size: 12, font });
  page.drawText(`Date: ${new Date().toLocaleString("en-IN")}`, { x: 50, y: 680, size: 12, font });
  page.drawText("Thank you for supporting veterans and families.", { x: 50, y: 650, size: 12, font });

  const bytes = await pdf.save();
  return new NextResponse(bytes, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="Xainik-Donation-Receipt.pdf"`
    }
  });
}
