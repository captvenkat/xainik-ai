import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request){
  const body = await req.json();
  const amountINR = Number(body.amountINR || 0);

  const donation = await prisma.donation.create({
    data: {
      donorName: body.donorName || "Anonymous",
      donorEmail: body.donorEmail || "unknown@example.com",
      amountINR,
      status: "created",
      orderId: "order_" + Date.now()
    }
  });
  return NextResponse.json({ ok:true, orderId: donation.orderId, amountINR });
}