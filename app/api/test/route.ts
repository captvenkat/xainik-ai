import { NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  return NextResponse.json({ message: "API is working!", timestamp: new Date().toISOString() });
}

export async function POST() {
  return NextResponse.json({ message: "POST is working!", timestamp: new Date().toISOString() });
}
