import { PrismaClient } from "@prisma/client";
import VoicesList from "@/components/voices/VoicesList";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export default async function VoicesPage() {
  const items = await prisma.testimonial.findMany({
    where: { status: "approved" },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">Voices for Xainik</h1>
      <VoicesList testimonials={items} />
    </main>
  );
}


