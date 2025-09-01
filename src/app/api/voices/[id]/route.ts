import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { isAdmin } from "@/lib/voices/admin";

const prisma = new PrismaClient();

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || null;
  if (!isAdmin(email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const action = body.action as "approve" | "reject";
  if (!action) return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  const status = action === "approve" ? "approved" : "rejected";
  const item = await prisma.testimonial.update({ where: { id: params.id }, data: { status } });
  return NextResponse.json({ ok: true, item });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || null;
  if (!isAdmin(email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await prisma.testimonial.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}


