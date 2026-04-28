import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { AuthProvider } from "@/context/AuthContext";
import ClientAnalytics from "@/components/ClientAnalytics";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://scholarshipmn.academy"),
  title: {
    default: "Scholarship MN Academy | Тэтгэлгийн гүүр",
    template: "%s | Scholarship MN Academy",
  },
  description: "Монгол залууст зориулсан гадаад, дотоодын тэтгэлэг болон менторшип хөтөлбөрүүд.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Scholarship MN Academy | Тэтгэлгийн гүүр",
    description: "Монгол залууст зориулсан гадаад, дотоодын тэтгэлэг болон менторшип хөтөлбөрүүд.",
    url: "/",
    siteName: "Scholarship MN Academy",
    locale: "mn_MN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scholarship MN Academy | Тэтгэлгийн гүүр",
    description: "Монгол залууст зориулсан гадаад, дотоодын тэтгэлэг болон менторшип хөтөлбөрүүд.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
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
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </div>
        </AuthProvider>
        <ClientAnalytics />
      </body>
    </html>
  );
}