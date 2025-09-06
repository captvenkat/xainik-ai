import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rz } from "@/lib/razorpay";
import { inrToPaise } from "@/lib/money";

export async function POST(req: Request){
  const body = await req.json();
  const amountINR = Number(body.amountINR || 0);
  const donorName = (body.donorName || "Anonymous").toString();
  const donorEmail = (body.donorEmail || "").toString();

  // 1) Create DB record in 'created'
  const donation = await prisma.donation.create({
    data: { donorName, donorEmail, amountINR, status: "created" }
  });

  // 2) Create Razorpay order (test mode if test keys)
  const order = await rz.orders.create({
    amount: inrToPaise(amountINR),
    currency: "INR",
    receipt: donation.id,
    notes: { donorEmail, donorName }
  });

  // 3) Save orderId
  await prisma.donation.update({ where: { id: donation.id }, data: { orderId: order.id } });

  return NextResponse.json({
    ok:true,
    orderId: order.id,
    amountINR,
    currency: order.currency,
    donationId: donation.id,
    keyId: process.env.RAZORPAY_KEY_ID // to mount on client if you embed Checkout
  });
}