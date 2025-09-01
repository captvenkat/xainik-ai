import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { isAdmin } from "@/lib/voices/admin";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || null;
  if (!isAdmin(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const items = await prisma.testimonial.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items });
}


