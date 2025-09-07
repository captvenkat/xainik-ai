import "./globals.css";

export const metadata = { 
  title: "Xainik", 
  description: "Experience. Not certificates." 
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{fontFamily:"Inter, system-ui, -apple-system, Segoe UI"}}>
        {children}
        {/* Footer with legal links */}
        <footer className="bg-black border-t border-white/10 py-4">
          <div className="max-w-4xl mx-auto px-4 text-center text-sm text-white/60">
            <div className="flex justify-center gap-6">
              <a href="/about" className="hover:text-white">About</a>
              <a href="/terms" className="hover:text-white">Terms</a>
              <a href="/privacy" className="hover:text-white">Privacy</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}