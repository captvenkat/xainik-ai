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
  console.log("Seeded demo event.");
}

main().finally(() => prisma.$disconnect());
