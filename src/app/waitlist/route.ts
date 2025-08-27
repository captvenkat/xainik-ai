import { NextResponse } from 'next/server'
export function GET() {
  return NextResponse.redirect(new URL('/contact', process.env.NEXT_PUBLIC_SITE_URL), { status: 301 })
}
