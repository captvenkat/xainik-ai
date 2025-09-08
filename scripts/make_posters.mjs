/**
 * Xainik Phase-1 — Poster Composer
 * Spec: Add title at top, footer block at bottom.
 * Rebel line: "Experience. Not certificates."
 * Output: 1024x1024 poster + 1200x630 OG + 512x512 thumb
 * Do not deviate.
 */

import sharp from "sharp";
import slugify from "slugify";
import fs from "fs/promises";
import path from "path";

const OUT_POSTERS = "out/posters";
const OUT_OG = "out/og";
const OUT_THUMBS = "out/thumbs";
await fs.mkdir(OUT_POSTERS, { recursive: true });
await fs.mkdir(OUT_OG, { recursive: true });
await fs.mkdir(OUT_THUMBS, { recursive: true });

/**
 * --- INPUTS: EDIT TITLES + BACKGROUNDS ONLY ---
 * Titles must be ≤ 8 words, cinematic, achievement-style.
 * Replace bg paths if needed (keep 5 items).
 */
const ITEMS = [
  { bg: "assets/bg1.png", title: "Untamed Valor: Triumph Amidst Turmoil" },
  { bg: "assets/bg2.png", title: "Unbroken Chains: Valor Forged in Fire" },
  { bg: "assets/bg3.png", title: "Rising From Ashes: Rallying Against All Odds" },
  { bg: "assets/bg4.png", title: "Unyielding Valor: The Triumph of Disciplined Excellence" },
  { bg: "assets/bg5.png", title: "Forging Futures: The Crucible of Valor" }
];

// Global render config
const W = 1024, H = 1024;
const PADDING = Math.round(W * 0.06);            // ~6% padding
const TITLE_SIZE = 56;                            // ~poster-scale
const FOOTER_SIZE_MAIN = 28;
const FOOTER_LINE_GAP = 36;                       // line-to-line
const TITLE_MAX_CH = 22;                          // quick guard

// Guardrails
function assertTitle(t) {
  const words = t.trim().split(/\s+/);
  if (words.length > 8) throw new Error(`Title > 8 words: "${t}"`);
  if (t.length > 80) throw new Error(`Title too long: "${t}"`);
  if (!/^[A-Z0-9]/i.test(t)) throw new Error(`Title must start with a letter/number: "${t}"`);
}

// Make a safe slug
function toSlug(s) {
  return slugify(s, { lower: true, strict: true });
}

// Basic text wrap for title (SVG <text> doesn't auto-wrap)
function wrapTitle(t, maxChars = TITLE_MAX_CH) {
  const words = t.split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length <= maxChars) {
      cur = (cur ? cur + " " : "") + w;
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3); // max 3 lines safeguard
}

// SVG overlay generator
function makeSVGOverlay({ title }) {
  const titleLines = wrapTitle(title);
  const titleLineHeight = TITLE_SIZE * 1.05;
  const titleYStart = PADDING + TITLE_SIZE; // first line baseline

  const titleTSpans = titleLines.map((line, i) => {
    const y = titleYStart + i * titleLineHeight;
    return `<text x="${PADDING}" y="${y}" fill="#ffffff" font-size="${TITLE_SIZE}" font-weight="800" font-family="Inter, Arial, Helvetica, sans-serif" letter-spacing="0.5px">${escapeXml(line)}</text>`;
  }).join("");

  // Footer lines
  const footerBlock = [
    { text: "Natural Leaders", size: FOOTER_SIZE_MAIN, weight: 600 },
    { text: "Experience. Not certificates.", size: FOOTER_SIZE_MAIN, weight: 700 },
    { text: "Xainik", size: FOOTER_SIZE_MAIN, weight: 600 }
  ];

  const footerStartY = H - PADDING - FOOTER_LINE_GAP; // last line baseline
  const footerLines = footerBlock
    .map((l, idx) => {
      const y = footerStartY - (FOOTER_LINE_GAP * (footerBlock.length - 1 - idx));
      return `<text x="${PADDING}" y="${y}" fill="#ffffff" font-size="${l.size}" font-weight="${l.weight}" font-family="Inter, Arial, Helvetica, sans-serif" letter-spacing="0.25px">${escapeXml(l.text)}</text>`;
    })
    .join("");

  // Top/bottom gradient rectangles for readability
  // Using black→transparent linear gradients
  const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="black" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="black" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="bottomFade" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="black" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="black" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Top gradient -->
  <rect x="0" y="0" width="${W}" height="${Math.round(H*0.30)}" fill="url(#topFade)"/>

  <!-- Bottom gradient -->
  <rect x="0" y="${Math.round(H*0.70)}" width="${W}" height="${Math.round(H*0.30)}" fill="url(#bottomFade)"/>

  <!-- Title lines -->
  ${titleTSpans}

  <!-- Footer block -->
  ${footerLines}
</svg>`;
  return Buffer.from(svg);
}

function escapeXml(s) {
  return s.replace(/[<>&'"]/g, c => (
    c === "<" ? "&lt;" :
    c === ">" ? "&gt;" :
    c === "&" ? "&amp;" :
    c === "'" ? "&apos;" :
    "&quot;"
  ));
}

// Compose poster → og → thumb
async function processOne({ bg, title }) {
  assertTitle(title);
  const slug = toSlug(title);
  const outPoster = path.join(OUT_POSTERS, `${slug}.webp`);
  const outOg = path.join(OUT_OG, `${slug}.webp`);
  const outThumb = path.join(OUT_THUMBS, `${slug}.webp`);

  // Base background fit to 1024x1024 (cover)
  const base = sharp(bg).resize(W, H, { fit: "cover", position: "centre" });

  // Overlay SVG text + gradients
  const svg = makeSVGOverlay({ title });

  // Final poster (WebP)
  await base
    .composite([{ input: svg, top: 0, left: 0 }])
    .webp({ quality: 82 })
    .toFile(outPoster);

  // OG: 1200x630 (center-crop from poster)
  await sharp(outPoster)
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .webp({ quality: 82 })
    .toFile(outOg);

  // Thumb: 512x512
  await sharp(outPoster)
    .resize(512, 512, { fit: "cover", position: "centre" })
    .webp({ quality: 80 })
    .toFile(outThumb);

  return { slug, outPoster, outOg, outThumb };
}

(async () => {
  console.log("▶ Generating 5 posters…");
  for (const item of ITEMS) {
    console.log(`- ${item.title}`);
    const res = await processOne(item);
    console.log(`  → ${res.outPoster}`);
  }
  console.log("✅ Done. Files in out/posters, out/og, out/thumbs");
})().catch(err => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
