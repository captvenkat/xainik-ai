import { PrismaClient } from "@prisma/client";
import VoicesList from "./VoicesList";

export default async function LatestVoices({ viewAllHref }: { viewAllHref: string }) {
  const prisma = new PrismaClient();
  const items = await prisma.testimonial.findMany({
    where: { status: "approved" },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
  return (
    <section className="p-4">
      <h2 className="text-xl font-semibold mb-3">Latest Voices</h2>
      <VoicesList testimonials={items} />
      <a className="mt-4 inline-block underline" href={viewAllHref} aria-label="View all voices">View all</a>
    </section>
  );
}


