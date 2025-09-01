import "./globals.css";
import { Inter, Bebas_Neue, Sora } from "next/font/google";

const inter = Inter({ subsets:["latin"], variable:"--font-body" });
const bebas = Bebas_Neue({ weight:"400", subsets:["latin"], variable:"--font-headline-compact" });
const sora  = Sora({ subsets:["latin"], variable:"--font-headline-rounded" });

export const metadata = { title:"Xainik — Unlocking Veterans", description:"Impossible Is Routine." };

export default function RootLayout({ children }:{children:React.ReactNode}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${bebas.variable} ${sora.variable} min-h-screen bg-[#0B1220] text-white`}>
        {children}
      </body>
    </html>
  );
}
