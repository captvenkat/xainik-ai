// tests/e2e/utils/links.ts
export type CrawlResult = { url: string; status: number; referer?: string };

export function isInternal(href: string, base: URL) {
  try {
    const u = new URL(href, base);
    return u.origin === base.origin;
  } catch {
    return false;
  }
}

export function normalize(url: string, base: URL) {
  return new URL(url, base).toString().replace(/#.*$/, ''); // strip hash
}
