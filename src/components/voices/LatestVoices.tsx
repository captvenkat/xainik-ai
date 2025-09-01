import { PrismaClient } from "@prisma/client";
// import VoicesList from "./VoicesList";
import Link from "next/link";

export default async function LatestVoices({ viewAllHref }: { viewAllHref: string }) {
  const prisma = new PrismaClient();
  const items = await prisma.testimonial.findMany({
    where: { status: "approved" },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  // Fallback samples if no approved testimonials exist yet
  const samples = [
    {
      id: "sample-1",
      name: "Col. Arjun Singh (Retd.)",
      message: "Xainik is building the bridge every veteran deserves—dignity, purpose, and opportunity.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "sample-2",
      name: "Lt. Cdr. Meera Nair (Veteran)",
      message: "Proud to support a mission that turns service into lifelong success.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "sample-3",
      name: "Capt. Rajat Verma (Veteran)",
      message: "This is the future veterans deserve—simple, human, and effective.",
      createdAt: new Date().toISOString(),
    },
  ];

  const list = items.length > 0 ? items : samples;

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
        
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {list.map((t) => {
            const isSample = String(t.id).startsWith("sample-");
            const card = (
              <article className="block hover:scale-[1.02] transition-transform">
                {/* Reuse TestimonialCard styles inline to avoid imports churn */}
                <div className="rounded-lg bg-[#111827] text-[#F9FAFB] ring-1 ring-[#D4AF37] shadow-md p-4">
                  <header className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{t.name}</h3>
                      <p className="text-xs opacity-80" aria-label="posted on">{formatDate(t.createdAt)}</p>
                    </div>
                  </header>
                  <p className="mt-3 whitespace-pre-wrap leading-relaxed">{t.message}</p>
                </div>

                {/* Actions: Poster + Share Image */}
                <div className="mt-2 flex gap-3">
                  {isSample ? (
                    <>
                      <Link href="/voices" className="text-sm text-[#111827] underline">View Voices</Link>
                      <Link href="/voices/new" className="text-sm text-[#111827] underline">Add Your Voice</Link>
                    </>
                  ) : (
                    <>
                      <Link href={`/voices/${t.id}/poster`} className="text-sm text-[#111827] underline">Download Poster</Link>
                      <Link href={`/voices/${t.id}/og`} className="text-sm text-[#111827] underline">Share Image</Link>
                    </>
                  )}
                </div>
              </article>
            );

            return (
              <div key={t.id}>
                {String(t.id).startsWith("sample-") ? (
                  card
                ) : (
                  <Link href={`/voices/${t.id}`} className="block">
                    {card}
                  </Link>
                )}
              </div>
            );
          })}
        </section>
        
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


