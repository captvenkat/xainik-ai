import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import ComposeForm from "@/components/voices/ComposeForm";

export const dynamic = "force-dynamic";

export default async function NewVoicePage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || "";
  if (!email) {
    return (
      <main className="mx-auto max-w-xl p-4">
        <h1 className="text-2xl font-bold mb-4">Add your voice</h1>
        <a
          href="/api/auth/signin/google"
          className="inline-block px-4 py-2 rounded bg-[#111827] text-[#F9FAFB]"
          aria-label="Sign in with Google"
        >
          Continue with Google
        </a>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-xl p-4">
      <h1 className="text-2xl font-bold mb-4">Add your voice</h1>
      <ComposeForm defaultName={session?.user?.name || ""} />
    </main>
  );
}


