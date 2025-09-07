import "./globals.css";

export const metadata = { 
  title: "Xainik - Natural leaders", 
  description: "Natural leaders in action - AI-powered platform for unlocking potential" 
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{fontFamily:"Inter, system-ui, -apple-system, Segoe UI"}}>
        {children}
      </body>
    </html>
  );
}