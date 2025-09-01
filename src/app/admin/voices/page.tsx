import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { isAdmin } from "@/lib/voices/admin";
import Link from "next/link";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  // Use consistent UTC-based formatting to avoid server/client mismatch
  return d.toISOString().replace('T', ' ').slice(0, 19); // Returns YYYY-MM-DD HH:mm:ss format
}

export default async function AdminVoicesPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || null;
  if (!isAdmin(email)) {
    return (
      <main className="mx-auto max-w-2xl p-4">
        <p>Forbidden</p>
      </main>
    );
  }

  const items = await prisma.testimonial.findMany({ where: { status: { in: ["pending", "rejected"] } }, orderBy: { createdAt: "desc" } });

  async function act(id: string, action: "approve" | "reject" | "delete") {
    "use server";
    if (action === "delete") {
      await fetch(`/api/voices/${id}`, { method: "DELETE" });
    } else {
      await fetch(`/api/voices/${id}`, { method: "PATCH", body: JSON.stringify({ action }) });
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="text-2xl font-bold mb-4">Moderation</h1>
      <div className="space-y-4">
        {items.map((t) => (
          <div key={t.id} className="rounded border p-4">
            <div className="font-semibold">{t.name}</div>
            <div className="text-sm opacity-70">{formatDateTime(t.createdAt)}</div>
            <p className="mt-2 whitespace-pre-wrap">{t.message}</p>
            <div className="mt-3 flex gap-2">
              <form action={act.bind(null, t.id, "approve")}>
                <button className="px-3 py-1 rounded bg-green-600 text-white">Approve</button>
              </form>
              <form action={act.bind(null, t.id, "reject")}>
                <button className="px-3 py-1 rounded bg-yellow-600 text-white">Reject</button>
              </form>
              <form action={act.bind(null, t.id, "delete")}>
                <button className="px-3 py-1 rounded bg-red-700 text-white">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Link className="underline" href="/voices">View public voices</Link>
      </div>
    </main>
  );
}


