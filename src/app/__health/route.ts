import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  return NextResponse.json({
    ok: true,
    ts: Date.now(),
    runtime: 'edge',
  })
}
