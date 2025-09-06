import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/email";

function verifySignature(orderId:string, paymentId:string, signature:string) {
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  const h = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return h === signature;
}

export async function POST(req: Request){
  const body = await req.json();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ ok:false, error: "Missing verification fields" }, { status: 400 });
  }

  const valid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!valid) return NextResponse.json({ ok:false, error: "Invalid signature" }, { status: 400 });

  // Mark donation paid
  const updated = await prisma.donation.updateMany({
    where: { orderId: razorpay_order_id },
    data: { status: "paid" }
  });

  // Fetch details to email receipt link
  const donation = await prisma.donation.findFirst({ where: { orderId: razorpay_order_id }});
  if (donation?.donorEmail) {
    await sendMail({
      to: donation.donorEmail,
      subject: "Xainik — Donation Receipt",
      html: `<p>Dear ${donation.donorName || "Donor"},</p>
        <p>Thank you for your contribution of ₹ ${donation.amountINR.toLocaleString("en-IN")}.</p>
        <p>You can download your receipt here:</p>
        <p><a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/donations/receipt?donorEmail=${encodeURIComponent(donation.donorEmail)}&amountINR=${donation.amountINR}&name=${encodeURIComponent(donation.donorName || "Donor")}">Download Receipt (PDF)</a></p>
        <p>— Team Xainik</p>`
    });
  }

  return NextResponse.json({ ok:true, updated: updated.count });
}