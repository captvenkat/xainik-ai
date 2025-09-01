export function isAdmin(email: string | null | undefined): boolean {
  const allow = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!email) return false;
  return allow.includes(email);
}


