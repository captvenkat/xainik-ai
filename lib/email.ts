import { Resend } from "resend";
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendMail(opts: { to: string; subject: string; html: string; from?: string }) {
  if (!resend) {
    console.warn("Resend API key not configured - email not sent");
    return { ok: false, error: "Email service not configured" };
  }
  
  const from = opts.from || (process.env.RESEND_FROM || "hello@xainik.com");
  try {
    const { error } = await resend.emails.send({
      from, to: opts.to, subject: opts.subject, html: opts.html
    });
    if (error) throw error;
    return { ok: true };
  } catch (e:any) {
    console.error("Resend send error:", e?.message || e);
    return { ok: false, error: String(e?.message || e) };
  }
}
