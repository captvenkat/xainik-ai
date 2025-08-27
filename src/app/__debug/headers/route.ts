import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: Request) {
  const headers: Record<string, string> = {}
  req.headers.forEach((v, k) => { headers[k] = v })
  return NextResponse.json({
    ok: true,
    ts: Date.now(),
    seenHeaders: headers,
    note: 'If this 401s or never shows, your app is not being reached (likely Vercel Protection).',
  })
}
