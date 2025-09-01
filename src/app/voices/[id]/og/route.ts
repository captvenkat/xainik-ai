import { ImageResponse } from "@vercel/og";
import { createElement as h } from "react";

export const runtime = "edge";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // Fetch testimonial via API
    const baseUrl = new URL(req.url).origin;
    const testimonialsResponse = await fetch(`${baseUrl}/api/voices`);
    const { items } = await testimonialsResponse.json();
    const testimonial = items.find((item: any) => item.id === params.id);

    if (!testimonial) {
      return new Response("Not found", { status: 404 });
    }

    return new ImageResponse(
      h("div", {
        style: {
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0F0F0F 0%, #1B365D 50%, #059669 100%)",
          position: "relative",
        }
      }, [
        // Content
        h("div", {
          style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "60px 40px",
            maxWidth: "800px",
          }
        }, [
          // Quote
          h("div", {
            style: {
              fontSize: 36,
              fontWeight: 600,
              color: "#F9FAFB",
              lineHeight: 1.3,
              marginBottom: 30,
              fontFamily: "system-ui, sans-serif",
            }
          }, `"${testimonial.message.slice(0, 200)}"`),
          
          // Attribution
          h("div", {
            style: {
              fontSize: 24,
              fontWeight: 500,
              color: "#D4AF37",
              marginBottom: 40,
              fontFamily: "system-ui, sans-serif",
            }
          }, `— ${testimonial.name}`),
          
          // Brand
          h("div", {
            style: {
              fontSize: 20,
              fontWeight: 400,
              color: "#D4AF37",
              fontFamily: "system-ui, sans-serif",
            }
          }, "Voices for Xainik")
        ]),
        
        // Military Gold accent border
        h("div", {
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: "6px solid #D4AF37",
            pointerEvents: "none",
          }
        })
      ]),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error("OG generation error:", e);
    return new Response("Error generating image", { status: 500 });
  }
}
