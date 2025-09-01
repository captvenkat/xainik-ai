import { ImageResponse } from "@vercel/og";
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";

export const runtime = "edge";

const prisma = new PrismaClient();

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  try {
    const testimonial = await prisma.testimonial.findUnique({
      where: { 
        id: params.slug,
        status: "approved"
      },
    });

    if (!testimonial) {
      notFound();
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #0F0F0F 0%, #1B365D 50%, #059669 100%)",
            position: "relative",
          }}
        >
          {/* Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "60px 40px",
              maxWidth: "800px",
            }}
          >
            {/* Quote */}
            <div
              style={{
                fontSize: 36,
                fontWeight: 600,
                color: "#F9FAFB",
                lineHeight: 1.3,
                marginBottom: 30,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              "{testimonial.message.slice(0, 200)}"
            </div>
            
            {/* Attribution */}
            <div
              style={{
                fontSize: 24,
                fontWeight: 500,
                color: "#D4AF37",
                marginBottom: 40,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              — {testimonial.name}
            </div>
            
            {/* Brand */}
            <div
              style={{
                fontSize: 20,
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
              border: "6px solid #D4AF37",
              pointerEvents: "none",
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
        format: "png",
      }
    );
  } catch (e: any) {
    console.error("OG generation error:", e);
    return new Response("Error generating image", { status: 500 });
  }
}
