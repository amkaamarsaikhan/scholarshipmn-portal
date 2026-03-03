"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Globe, X, Bookmark } from "lucide-react";
import { Input } from "@/components/ui/input";
import ScholarshipCard from "@/components/scholarships/scholarshipCard";
import { getScholarships } from "@/lib/actions/getScholarships";
import { useAuth } from "@/context/AuthContext";

const HERO_SLIDES = [
  { id: 1, title: "Ирээдүйнхээ гүүрийг", subtitle: "ӨНӨӨДӨР БҮТЭЭ.", image: "/hero1.png" },
  { id: 2, title: "Дэлхийн боловсролыг", subtitle: "ЭНДЭЭС ОЛ.", image: "/hero2.png" },
];

const COUNTRIES = [
  { name: 'Australia', flag: '🇦🇺' }, { name: 'Belgium', flag: '🇧🇪' }, { name: 'Brunei', flag: '🇧🇳' },
  { name: 'Canada', flag: '🇨🇦' }, { name: 'China', flag: '🇨🇳' }, { name: 'EU', flag: '🇪🇺' },
  { name: 'France', flag: '🇫🇷' }, { name: 'Germany', flag: '🇩🇪' }, { name: 'Global', flag: '🌎' },
  { name: 'Hong Kong', flag: '🇭🇰' }, { name: 'Hungary', flag: '🇭🇺' }, { name: 'Indonesia', flag: '🇮🇩' },
  { name: 'Italy', flag: '🇮🇹' }, { name: 'Japan', flag: '🇯🇵' }, { name: 'Netherlands', flag: '🇳🇱' },
  { name: 'New Zealand', flag: '🇳🇿' }, { name: 'Singapore', flag: '🇸🇬' }, { name: 'South Korea', flag: '🇰🇷' },
  { name: 'Sweden', flag: '🇸🇪' }, { name: 'Switzerland', flag: '🇨🇭' }, { name: 'Taiwan', flag: '🇹🇼' },
  { name: 'Turkey', flag: '🇹🇷' }, { name: 'UAE', flag: '🇦🇪' }, { name: 'UK', flag: '🇬🇧' }, { name: 'USA', flag: '🇺🇸' }
];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { savedItems, isSaved } = useAuth();
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        const data = await getScholarships();
        setScholarships(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchScholarships();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const filteredScholarships = scholarships.filter((item) => {
    const matchesSaved = showSavedOnly ? isSaved(item.id) : true;
    const matchesCountry = selectedCountry ? item.country === selectedCountry : true;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSaved && matchesCountry && matchesSearch;
  });

  const clearFilters = () => {
    setSelectedCountry(null);
    setShowSavedOnly(false);
    setSearchQuery("");
  };

  return (
    <main className="min-h-screen bg-[#f8faf8]">
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden bg-emerald-950 pt-20">
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="absolute inset-0 z-0">
            <img src={HERO_SLIDES[current].image} alt="Background" className="w-full h-full object-cover" />
          </motion.div>
        </AnimatePresence>
        <div className="container mx-auto px-6 text-center relative z-10 text-white">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-5xl font-serif italic mb-4">{HERO_SLIDES[current].title}</h1>
            <h2 className="text-3xl md:text-4xl font-sans font-black mb-8 text-emerald-400">{HERO_SLIDES[current].subtitle}</h2>
            <div className="max-w-xl mx-auto flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-lg">
              <Input
                placeholder="Тэтгэлэг хайх..."
                className="border-none bg-transparent text-white placeholder:text-emerald-100/50 focus-visible:ring-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button className="bg-emerald-600 hover:bg-emerald-500 rounded-md px-6 uppercase text-[10px] tracking-widest font-bold">Хайх</Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16 flex flex-col lg:flex-row gap-10">
        <aside className="w-full lg:w-1/4">
          <div className="sticky top-32 space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                <LayoutGrid size={14} /> Main Menu
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => { setSelectedCountry(null); setShowSavedOnly(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${(!selectedCountry && !showSavedOnly) ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-900 hover:bg-emerald-50'}`}
                >
                  <Globe size={18} /> Бүх тэтгэлгүүд
                </button>
                <button
                  onClick={() => { setShowSavedOnly(true); setSelectedCountry(null); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${showSavedOnly ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-900 hover:bg-emerald-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <Bookmark size={18} fill={showSavedOnly ? "white" : "none"} />
                    Хадгалсан
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${showSavedOnly ? 'bg-white text-emerald-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {savedItems?.length || 0}
                  </span>
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm max-h-[500px] flex flex-col">
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-4">Popular Countries</p>
              <div className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                {COUNTRIES.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => { setSelectedCountry(c.name); setShowSavedOnly(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all group ${selectedCountry === c.name ? 'bg-emerald-50 text-emerald-600 font-bold' : 'text-emerald-900 hover:bg-emerald-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg group-hover:scale-110 transition-transform">{c.flag}</span>
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="w-full lg:w-3/4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.3em] mb-2">
                {showSavedOnly ? "Таны хадгалсан" : selectedCountry ? `Шүүлтүүр: ${selectedCountry}` : "Шинээр нэмэгдсэн"}
              </p>
              <h2 className="text-3xl font-serif italic text-emerald-950">
                {showSavedOnly ? "Хадгалсан тэтгэлгүүд" : selectedCountry ? `${selectedCountry}-ийн тэтгэлгүүд` : "Сүүлийн тэтгэлгүүд"}
              </h2>
            </div>
            {(selectedCountry || showSavedOnly) && (
              <button onClick={clearFilters} className="text-xs text-emerald-600 flex items-center gap-1 hover:underline font-bold uppercase tracking-tighter">
                <X size={14} /> Арилгах
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredScholarships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredScholarships.map((item) => (
                <ScholarshipCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-dashed border-emerald-200 rounded-3xl">
              <p className="text-gray-500">{showSavedOnly ? "Танд хадгалсан тэтгэлэг алга." : "Уучлаарай, тэтгэлэг олдсонгүй."}</p>
              <Button variant="link" onClick={clearFilters} className="text-emerald-600">Бүх тэтгэлгийг харах</Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}