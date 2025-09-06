import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

function verify(body: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  const h = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return h === signature;
}

export async function POST(req: Request){
  const raw = await req.text();
  const sig = (req.headers.get("x-razorpay-signature") || "").toString();
  if (!verify(raw, sig)) return NextResponse.json({ ok:false }, { status: 400 });

  const evt = JSON.parse(raw);
  if (evt?.event === "payment.captured") {
    const orderId = evt?.payload?.payment?.entity?.order_id;
    if (orderId) {
      await prisma.donation.updateMany({ where: { orderId }, data: { status: "paid" }});
    }
  }
  return NextResponse.json({ ok:true });
}
