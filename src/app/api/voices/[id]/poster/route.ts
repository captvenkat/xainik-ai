import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

const prisma = new PrismaClient();

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    // Fetch testimonial
    const t = await prisma.testimonial.findUnique({ 
      where: { 
        id: params.id, 
        status: "approved" 
      } 
    });
    
    if (!t) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    // Try to get AI background first
    let backgroundImage = null;
    if (process.env.POSTER_AI === "on") {
      try {
                 const aiResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/voices/${params.id}/poster-art`);
        const aiData = await aiResponse.json();
        if (aiData.ok && aiData.url) {
          backgroundImage = aiData.url;
        }
      } catch (e) {
        console.log("AI background fetch failed, using fallback");
      }
    }

    // Create poster with or without AI background
    const poster = new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: backgroundImage 
              ? `url(${backgroundImage})` 
              : "linear-gradient(135deg, #0F0F0F 0%, #1B365D 50%, #059669 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
          }}
        >
          {/* Overlay for better text readability */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 15, 15, 0.7)",
            }}
          />
          
          {/* Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "80px 60px",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Quote */}
            <div
              style={{
                fontSize: 48,
                fontWeight: 600,
                color: "#F9FAFB",
                lineHeight: 1.2,
                marginBottom: 40,
                maxWidth: "800px",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              "{t.message.slice(0, 280)}"
            </div>
            
            {/* Attribution */}
            <div
              style={{
                fontSize: 32,
                fontWeight: 500,
                color: "#D4AF37",
                marginBottom: 60,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              — {t.name}
            </div>
            
            {/* Brand */}
            <div
              style={{
                fontSize: 24,
                fontWeight: 400,
                color: "#D4AF37",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Voices for Xainik
            </div>
          </div>
          
          {/* Military Gold accent border */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: "8px solid #D4AF37",
              pointerEvents: "none",
            }}
          />
        </div>
      ),
      {
        width: 2480,
        height: 3508,
        format: "png",
      }
    );

    return poster;
  } catch (e: any) {
    console.error("Poster generation error:", e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
