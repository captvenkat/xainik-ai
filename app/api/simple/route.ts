import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    message: "Simple API route working!",
    timestamp: new Date().toISOString(),
    status: "success"
  });
}

export async function POST() {
  return NextResponse.json({ 
    message: "POST method working!",
    timestamp: new Date().toISOString(),
    status: "success"
  });
}
