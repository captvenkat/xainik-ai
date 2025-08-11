export function toCSV<T extends Record<string, unknown>>(rows: T[]): string {
  if (!rows || rows.length === 0) return '';
  const headers = Object.keys(rows[0] as object);
  const esc = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    const s = typeof val === 'string' ? val : JSON.stringify(val);
    const needsQuote = /[",\n]/.test(s);
    return needsQuote ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(headers.map(h => esc((r as any)[h])).join(','));
  }
  return lines.join('\n');
}
