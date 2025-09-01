import { PrismaClient } from "@prisma/client";
import VoicesList from "./VoicesList";
import Link from "next/link";

export default async function LatestVoices({ viewAllHref }: { viewAllHref: string }) {
  const prisma = new PrismaClient();
  const items = await prisma.testimonial.findMany({
    where: { status: "approved" },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  // Don't render the section if there are no voices yet
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="app-section bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="premium-heading text-3xl md:text-4xl mb-4 text-[#111827]">
            Voices for <span className="military-heading text-[#D4AF37]">Xainik</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Real people sharing why supporting our veterans' future matters. Add your voice to the movement.
          </p>
        </div>
        
        <VoicesList testimonials={items} />
        
        <div className="text-center mt-8">
          <Link 
            href={viewAllHref}
            className="inline-block px-6 py-3 bg-[#111827] text-[#F9FAFB] rounded-lg font-semibold hover:bg-[#374151] transition-colors mr-4"
          >
            View All Voices
          </Link>
          <Link 
            href="/voices/new"
            className="inline-block px-6 py-3 bg-[#D4AF37] text-[#111827] rounded-lg font-semibold hover:bg-[#B8941F] transition-colors"
          >
            Add Your Voice
          </Link>
        </div>
      </div>
    </section>
  );
}


