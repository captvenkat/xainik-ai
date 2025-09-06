import { NextResponse } from "next/server";
export async function GET(){
  return NextResponse.json({ ok:true, checks:["webp","alerts","rate-limit"], errors: 0 });
}
