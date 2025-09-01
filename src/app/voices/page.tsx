import { prisma } from "@/lib/db";
import VoicesList from "@/components/voices/VoicesList";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function VoicesPage() {
  let items: Array<{
    id: string;
    name: string;
    message: string;
    createdAt: string | Date;
  }> = [];
  
  try {
    items = await prisma.testimonial.findMany({
      where: { status: "approved" },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
    // Fallback to empty array if database fails
  }

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-[#111827]">Voices for Xainik</h1>
        <p className="text-lg text-gray-600 mb-6">
          Real stories from people who believe in supporting military veterans.
        </p>
        <Link 
          href="/voices/new"
          className="inline-block px-6 py-3 bg-[#D4AF37] text-[#111827] rounded-lg font-semibold hover:bg-[#B8941F] transition-colors"
        >
          Add Your Voice
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎤</div>
          <h2 className="text-xl font-semibold mb-2 text-gray-700">No voices yet</h2>
          <p className="text-gray-500 mb-6">Be the first to share why supporting veterans matters to you.</p>
          <Link 
            href="/voices/new"
            className="inline-block px-6 py-3 bg-[#D4AF37] text-[#111827] rounded-lg font-semibold hover:bg-[#B8941F] transition-colors"
          >
            Share Your Voice
          </Link>
        </div>
      ) : (
        <VoicesList testimonials={items} />
      )}
    </main>
  );
}


