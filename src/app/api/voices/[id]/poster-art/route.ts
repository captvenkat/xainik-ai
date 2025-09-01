import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "edge";

const prisma = new PrismaClient();

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    if (process.env.POSTER_AI !== "on") {
      return NextResponse.json({ ok: false, reason: "AI poster disabled" }, { status: 200 });
    }

    // Fetch testimonial by id (approved)
    const t = await prisma.testimonial.findUnique({ 
      where: { 
        id: params.id, 
        status: "approved" 
      } 
    });
    
    if (!t) {
      return NextResponse.json({ ok: false, reason: "testimonial-not-found" }, { status: 404 });
    }

    const THEME_HINTS = "service, dignity, future, support";
    const prompt = `
Create a premium, minimalist illustration for a print poster (A4 portrait) that respectfully reflects this quote:

QUOTE:
"${t.message.slice(0, 280)}"
— ${t.name}

THEME:
${THEME_HINTS}

TONE:
Formal but warm, dignified, inspirational. No aggression. No guns or battle scenes.

STYLE:
Minimalist, clean lines, soft gradients, subtle textures. Indian context implied without clichés.
Use a soldier SILHOUETTE or abstract symbol of service, not faces. 
Strictly avoid all official insignia or emblems.

PALETTE (brand):
- Military Gold: #D4AF37
- Premium Black: #0F0F0F
- Military Navy: #1B365D
- Military Green (accents): #059669

COMPOSITION:
- Large negative space for the text overlay area (leave uncluttered).
- Subtle tricolour-inspired undertone allowed, but keep it minimal.
- Place the focal shape off-center to balance the text block.

OUTPUT:
- High-resolution artwork suited to 2480 × 3508 px (A4 portrait). 
- No embedded text in the image; the app will overlay the quote separately.
`.trim();

    // Call OpenAI DALL-E API
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, reason: "no-api-key" }, { status: 200 });
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024", // DALL-E 3 supports 1024x1024, 1792x1024, 1024x1792
        quality: "hd",
        style: "natural"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return NextResponse.json({ ok: false, reason: "api-error", detail: errorText }, { status: 200 });
    }

    const data = await response.json();
    const url = data.data?.[0]?.url;
    
    if (!url) {
      return NextResponse.json({ ok: false, reason: "no-image" }, { status: 200 });
    }

    return NextResponse.json({ ok: true, url }, { status: 200 });
  } catch (e: any) {
    console.error("Poster generation error:", e);
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
