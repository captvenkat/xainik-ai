import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
const BadWords = require("bad-words");
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

const prisma = new PrismaClient();
const filter = new BadWords();

const CreateSchema = z.object({
  name: z.string().min(2).max(80),
  message: z.string().min(10).max(600),
});

function sanitize(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

const rateMap = new Map<string, number>();

export async function GET() {
  const testimonials = await prisma.testimonial.findMany({
    where: { status: "approved" },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ items: testimonials });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const last = rateMap.get(session.user.email) || 0;
  if (now - last < 60 * 60 * 1000) {
    return NextResponse.json({ error: "Please wait before submitting again." }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse({
    name: sanitize(String(body.name || "")),
    message: sanitize(String(body.message || "")),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { name, message } = parsed.data;

  const cleanMessage = filter.clean(message);

  const created = await prisma.testimonial.create({
    data: {
      userId: session.user.email,
      name,
      email: session.user.email,
      message: cleanMessage,
      status: "pending",
    },
  });

  rateMap.set(session.user.email, now);

  return NextResponse.json({ ok: true, id: created.id, status: created.status });
}


