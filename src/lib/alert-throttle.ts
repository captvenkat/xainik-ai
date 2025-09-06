import { Resend } from 'resend';

type WindowSpec = { windowMs: number; maxErrors: number; cooldownMs: number; };
type AlertSpec = { service: string; route: string; window: WindowSpec; emailTo: string; };

const mem: Record<string, { errors: number[]; lastAlertAt?: number }> = {};

function now(){ return Date.now(); }

export async function recordFailureAndMaybeAlert(spec: AlertSpec, errorSummary: string) {
  const { service, route, window, emailTo } = spec;
  const key = `${service}:${route}`;
  const bucket = mem[key] ?? { errors: [] };
  const t = now();

  // drop old timestamps
  const since = t - window.windowMs;
  bucket.errors = bucket.errors.filter(ts => ts >= since);

  // add new error timestamp
  bucket.errors.push(t);

  const enoughErrors = bucket.errors.length >= window.maxErrors;
  const cooledDown = !bucket.lastAlertAt || (t - bucket.lastAlertAt) >= window.cooldownMs;

  mem[key] = bucket;

  if (!enoughErrors || !cooledDown) return { alerted:false, count: bucket.errors.length, reason: enoughErrors ? 'cooldown' : 'threshold' };

  // send alert
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const TO = process.env.ADMIN_ALERTS_EMAIL || emailTo;
  if (!RESEND_API_KEY || !TO) return { alerted:false, reason:'missing_env', count: bucket.errors.length };

  const resend = new Resend(RESEND_API_KEY);
  const subject = `Xainik ALERT: Failures on ${service} ${route}`;
  const html = `
    <h2>Repeated failures detected</h2>
    <p><b>Service:</b> ${service}</p>
    <p><b>Route:</b> ${route}</p>
    <p><b>Window:</b> last ${Math.round(window.windowMs/60000)} min</p>
    <p><b>Error Count:</b> ${bucket.errors.length}</p>
    <pre style="background:#f6f6f6;padding:12px;border-radius:8px">${escapeHtml(errorSummary).slice(0,4000)}</pre>
    <p>Cooldown in effect for ${Math.round(window.cooldownMs/60000)} min.</p>
  `;

  try {
    await resend.emails.send({ from: 'Xainik Alerts <alerts@xainik.com>', to: TO, subject, html });
    bucket.lastAlertAt = t;
    mem[key] = bucket;
    return { alerted:true, count: bucket.errors.length };
  } catch {
    return { alerted:false, reason:'email_send_failed', count: bucket.errors.length };
  }
}

function escapeHtml(s:string){ return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] as string)); }

export function _resetAlertState() { for (const k of Object.keys(mem)) delete mem[k]; }
export type { WindowSpec, AlertSpec };
