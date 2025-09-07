import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Test database connection with a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    return NextResponse.json({ 
      message: "Database connection successful!", 
      result: JSON.parse(JSON.stringify(result, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )),
      timestamp: new Date().toISOString() 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      message: "Database connection failed!", 
      error: error.message,
      timestamp: new Date().toISOString() 
    }, { status: 500 });
  }
}
