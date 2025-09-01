import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import TestimonialCard from "@/components/voices/TestimonialCard";
import ShareMenu from "@/components/voices/ShareMenu";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export default async function TestimonialPage({ params }: { params: { id: string } }) {
  const testimonial = await prisma.testimonial.findUnique({
    where: { 
      id: params.id,
      status: "approved"
    },
  });

  if (!testimonial) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Voice for Xainik</h1>
        <TestimonialCard 
          name={testimonial.name}
          date={new Date(testimonial.createdAt).toLocaleDateString()}
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
