import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function SpeakersPage(){
  const session = await auth();
  const me = session?.user;

  const speakers = await prisma.speaker.findMany({
    include: { user: true }
  });

  return (
    <div>
      <h1>Speakers</h1>
      {!me ? (
        <p>Login to manage your profile → <Link href="/api/auth/signin">Sign in with Google</Link></p>
      ) : (
        <p>Logged in as <b>{me.name}</b> — <Link href="/api/auth/signout">Sign out</Link></p>
      )}

      <div className="card">
        <h3>Your Profile</h3>
        <p><Link href="/speakers/profile">Open profile editor</Link></p>
      </div>

      <div className="card">
        <h3>All Speakers</h3>
        {speakers.length === 0 && <p>No speakers yet.</p>}
        {speakers.map(s => (
          <div key={s.id} style={{marginBottom:12}}>
            <b>{s.user?.name ?? "Unnamed"}</b><br/>
            <small>{s.headline ?? ""}</small><br/>
            <small>Topics: {(s.topics||[]).join(", ")}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
