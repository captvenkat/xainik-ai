import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Optional seed: create a demo event
  await prisma.event.create({
    data: {
      title: "Guidance+ Kickoff",
      description: "Xainik expert-led session",
      date: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      budgetINR: 25000
    }
  });
  // Optional demo speaker (if user already created via Google sign-in this may be skipped)
  const u = await prisma.user.upsert({
    where: { email: "demo.speaker@xainik.com" },
    create: { email: "demo.speaker@xainik.com", name: "Demo Speaker" },
    update: {}
  });
  await prisma.speaker.upsert({
    where: { userId: u.id },
    create: { userId: u.id, headline: "Veteran Leadership", bio: "Talks on resilience", topics: JSON.stringify(["Leadership","Teamwork"]) },
    update: {}
  });
  console.log("Seeded demo event and speaker.");
}

main().finally(() => prisma.$disconnect());
