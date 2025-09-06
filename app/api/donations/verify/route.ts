import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request){
  const { orderId } = await req.json();
  if (!orderId) return NextResponse.json({ ok:false, error: "Missing orderId" }, { status: 400 });

  await prisma.donation.updateMany({ where: { orderId }, data: { status: "paid" }});
  return NextResponse.json({ ok:true, verified: true });
}