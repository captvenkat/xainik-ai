import "./globals.css";
import Link from "next/link";

export const metadata = { title: "Xainik - Natural leaders", description: "Natural leaders in action" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body style={{fontFamily:"Inter, system-ui, -apple-system, Segoe UI"}}>
      <nav style={{display:"flex", gap:16, padding:12, borderBottom:"1px solid #eee"}}>
        <Link href="/">Home</Link>
        <Link href="/organizer">Organizer</Link>
        <Link href="/organizer/dashboard">Organizer Dashboard</Link>
        <Link href="/speakers">Speakers</Link>
        <Link href="/donate">Donate</Link>
        <Link href="/admin/media">Admin</Link>
      </nav>
      <main style={{maxWidth:900, margin:"20px auto", padding:"0 12px"}}>{children}</main>
    </body></html>
  );
}