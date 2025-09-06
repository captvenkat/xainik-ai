import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(){
  const events = await prisma.event.findMany({ orderBy: { date: "asc" }});
  return NextResponse.json({ ok:true, events });
}
export async function POST(req: Request){
  const body = await req.json();
  const event = await prisma.event.create({
    data: {
      title: body.title,
      description: body.description ?? "",
      date: new Date(body.date || Date.now()),
      budgetINR: Number(body.budgetINR || 0)
    }
  });
  return NextResponse.json({ ok:true, event });
}
