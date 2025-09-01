"use client";
import { signIn, useSession } from "next-auth/react";
import ComposeForm from "@/components/voices/ComposeForm";

export default function NewVoicePage() {
  const { data: session, status } = useSession();
  const email = session?.user?.email || "";
  if (status === "loading") return null;
  if (!email) {
    return (
      <main className="mx-auto max-w-xl p-4">
        <h1 className="text-2xl font-bold mb-4">Add your voice</h1>
        <button
          onClick={() => signIn("google")}
          className="px-4 py-2 rounded bg-[#111827] text-[#F9FAFB]"
          aria-label="Sign in with Google"
        >
          Continue with Google
        </button>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-xl p-4">
      <h1 className="text-2xl font-bold mb-4">Add your voice</h1>
      <ComposeForm defaultName={session.user?.name || ""} />
    </main>
  );
}


