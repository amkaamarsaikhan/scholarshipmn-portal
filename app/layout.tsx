import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif"
});

export const metadata: Metadata = {
  title: "ProjectA+ | Scholarship Portal",
  description: "Монгол залууст зориулсан дэлхийн боловсролын гүүр",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-[#F9FAFB] text-slate-900 antialiased">
        <AuthProvider>
          {/* Dashboard-ийн үндсэн бүтэц */}
          <div className="flex min-h-screen">


            {/* 2. Баруун талын үндсэн агуулга */}
            <div className="flex-1 flex flex-col min-w-0">
              
              {/* Дээд талын Navbar (Search & Profile) */}
              <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
                <Navbar />
              </header>

              {/* Хуудасны агуулга */}
              <main className="flex-1">
                {children}
              </main>

            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}