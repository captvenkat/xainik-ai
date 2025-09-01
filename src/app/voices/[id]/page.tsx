import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import TestimonialCard from "@/components/voices/TestimonialCard";
import ShareMenu from "@/components/voices/ShareMenu";

export const dynamic = "force-dynamic";

function formatDate(date: string | Date): string {
  const d = new Date(date);
  // Use consistent UTC-based formatting to avoid server/client mismatch
  return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
}

export default async function TestimonialPage({ params }: { params: { id: string } }) {
  let testimonial: {
    id: string;
    name: string;
    message: string;
    createdAt: string | Date;
  } | null = null;
  
  try {
    testimonial = await prisma.testimonial.findUnique({
      where: { 
        id: params.id,
        status: "approved"
      },
    });
  } catch (error) {
    console.error("Failed to fetch testimonial:", error);
    // Fallback to null, will show notFound()
  }

  if (!testimonial) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Voice for Xainik</h1>
        <TestimonialCard 
          name={testimonial.name}
          date={formatDate(testimonial.createdAt)}
          message={testimonial.message}
        />
      </div>

      <div className="bg-[#111827] text-[#F9FAFB] rounded-lg p-6 ring-1 ring-[#D4AF37]">
        <h2 className="text-xl font-semibold mb-4">Download & Share</h2>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
                         <a
               href={`/api/voices/${params.id}/poster`}
               download={`xainik-voice-${params.id}.png`}
               className="px-4 py-2 bg-[#D4AF37] text-[#111827] rounded hover:bg-[#B8941F] transition-colors"
             >
               Download A4 Poster
             </a>
             
             <a
               href={`/api/voices/${params.id}/og`}
               download={`xainik-share-${params.id}.png`}
               className="px-4 py-2 bg-[#1B365D] text-[#F9FAFB] rounded hover:bg-[#152A4A] transition-colors"
             >
               Download Share Image
             </a>
          </div>
          
          <div className="pt-4 border-t border-[#374151]">
            <h3 className="font-medium mb-3">Share this voice:</h3>
            <ShareMenu />
          </div>
        </div>
      </div>
    </main>
  );
}
