import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(){
  const session = await auth();
  const meUser = session?.user?.email ? await prisma.user.findUnique({ where: { email: session.user.email }}) : null;
  const me = meUser ? await prisma.speaker.findUnique({ where: { userId: meUser.id }}) : null;
  const speakers = await prisma.speaker.findMany({ include: { user: true } });
  return NextResponse.json({ ok:true, speakers, me });
}

export async function POST(req: Request){
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ ok:false, error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const user = await prisma.user.findUnique({ where: { email: session.user.email }});
  if (!user) return NextResponse.json({ ok:false, error: "User not found" }, { status: 404 });

  const speaker = await prisma.speaker.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      headline: body.headline || "",
      bio: body.bio || "",
      topics: Array.isArray(body.topics) ? body.topics : []
    },
    update: {
      headline: body.headline || "",
      bio: body.bio || "",
      topics: Array.isArray(body.topics) ? body.topics : []
    }
  });

  return NextResponse.json({ ok:true, speaker });
}
