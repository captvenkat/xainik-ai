import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    message: "API routes are working in production!"
  });
}
