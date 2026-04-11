import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { AuthProvider } from "@/context/AuthContext";
import { Analytics } from "@vercel/analytics/next";
import AIChatBot from "@/components/AIChatBot";

// Font тохиргоо
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif"
});

// Энэ хэсэг ганцхан удаа байх ёстой:
export const metadata: Metadata = {
  title: "Scholarship MN Academy | Тэтгэлгийн гүүр",
  description: "Монгол залууст зориулсан гадаад, дотоодын тэтгэлэг болон менторшип хөтөлбөрүүд.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-[#F9FAFB] text-slate-900 antialiased">
        <AuthProvider>
          <div className="flex min-h-screen">
            <div className="flex-1 flex flex-col min-w-0">
              <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
                <Navbar />
              </header>
              <AIChatBot />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </div>
        </AuthProvider>
        <Analytics /> 
      </body>
    </html>
  );
}