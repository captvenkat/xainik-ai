export const runtime = 'nodejs';
export async function GET() {
  return new Response(JSON.stringify({ ok: true, service: 'xainik', ts: Date.now() }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
}