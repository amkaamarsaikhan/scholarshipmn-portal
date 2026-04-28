"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Globe, X, Bookmark, Info, BookOpen, MessageSquare, CalendarCheck } from "lucide-react";
import SearchSection from "@/components/SearchSection"; 
import ScholarshipCard, { flagForCountry } from "@/components/scholarships/scholarshipCard";
import { getScholarships } from "@/lib/actions/getScholarships";
import { useAuth } from "@/context/AuthContext";
import { isScholarshipDeadlineOpen } from "@/lib/scholarshipDeadline";

const HERO_SLIDES = [
  { id: 1, title: "Ирээдүйнхээ гүүрийг", subtitle: "ӨНӨӨДӨР БҮТЭЭ.", image: "/hero1.png" },
  { id: 2, title: "Дэлхийн боловсролыг", subtitle: "ЭНДЭЭС ОЛ.", image: "/hero2.png" },
];

const FEATURED_COUNTRIES = ["Ireland", "Italy", "France", "Poland"] as const;

function uniqueCountriesFromScholarships(items: { country?: string }[]): string[] {
  const seen = new Set<string>();
  for (const item of items) {
    const c = typeof item.country === "string" ? item.country.trim() : "";
    if (c) seen.add(c);
  }
  return [...seen].sort((a, b) => a.localeCompare(b));
}

/** Олон улсыг нэгтгэж, Ирланд, Итали, Франц, Польш-ийг дээр нь үргэлж харуулна */
function countryFilterListFromData(items: { country?: string }[]): string[] {
  const fromData = uniqueCountriesFromScholarships(items);
  const rest = fromData.filter((c) => !FEATURED_COUNTRIES.includes(c as (typeof FEATURED_COUNTRIES)[number]));
  return [...FEATURED_COUNTRIES, ...rest];
}

type HomeCategoryFilter = "bachelor" | "master" | "doctor" | "partial" | "full";

function matchesHomeCategoryFilter(
  item: { degree?: string; level?: string; category?: string; type?: string },
  filter: HomeCategoryFilter | null
): boolean {
  if (!filter) return true;
  const degree = `${item.degree ?? ""} ${item.level ?? ""}`.toLowerCase();
  const funding = `${item.category ?? ""} ${item.type ?? ""}`.toLowerCase();
  switch (filter) {
    case "bachelor":
      return degree.includes("bachelor");
    case "master":
      return degree.includes("master");
    case "doctor":
      return degree.includes("phd") || degree.includes("doctor") || degree.includes("doctoral");
    case "partial":
      return funding.includes("partial");
    case "full":
      return funding.includes("full");
    default:
      return true;
  }
}

const CATEGORY_FILTER_BUTTONS: { id: HomeCategoryFilter; label: string }[] = [
  { id: "bachelor", label: "Bachelor" },
  { id: "master", label: "Master" },
  { id: "doctor", label: "Doctor" },
  { id: "partial", label: "Partial" },
  { id: "full", label: "Full" },
];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [countryFilterOptions, setCountryFilterOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { savedItems, isSaved } = useAuth();
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<HomeCategoryFilter | null>(null);
  /** Зөвхөн дуусах хугацаа нь ирээдүйд байгаа (эсвэл хугацаа бичигдээгүй) тэтгэлгүүд */
  const [openDeadlineOnly, setOpenDeadlineOnly] = useState(false);

  // Анхны өгөгдлөө татах
  useEffect(() => {
    const fetchScholarships = async () => {
      setLoading(true);
      try {
        const data = await getScholarships();
        setScholarships(data || []);
        setCountryFilterOptions(countryFilterListFromData(data || []));
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchScholarships();
  }, []);

  // Слайдер солигдох хугацаа
  useEffect(() => {
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  // Шүүлтүүрийн логик
  const filteredScholarships = scholarships.filter((item) => {
    const matchesSaved = showSavedOnly ? isSaved(item.id) : true;
    const matchesCountry = selectedCountry ? item.country === selectedCountry : true;
    const matchesCat = matchesHomeCategoryFilter(item, selectedCategory);
    const matchesDeadline = !openDeadlineOnly || isScholarshipDeadlineOpen(item.deadline);
    return matchesSaved && matchesCountry && matchesCat && matchesDeadline;
  });

  const clearFilters = async () => {
    setSelectedCountry(null);
    setSelectedCategory(null);
    setOpenDeadlineOnly(false);
    setShowSavedOnly(false);
    setLoading(true);
    try {
      const data = await getScholarships();
      setScholarships(data || []);
      setCountryFilterOptions(countryFilterListFromData(data || []));
    } finally {
      setLoading(false);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[#f8faf8]">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-emerald-950 pt-20">
        <AnimatePresence mode="wait">
          <motion.div 
            key={current} 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 0.4 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 1.5 }} 
            className="absolute inset-0 z-0"
          >
            <Image
              src={HERO_SLIDES[current].image}
              alt={HERO_SLIDES[current].title}
              fill
              priority={current === 0}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
        
        <div className="container mx-auto px-6 text-center relative z-10 text-white w-full">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-5xl font-serif italic mb-4">{HERO_SLIDES[current].title}</h1>
            <h2 className="text-3xl md:text-4xl font-sans font-black mb-8 text-emerald-400">{HERO_SLIDES[current].subtitle}</h2>
            
            {/* Ухаалаг хайлтын хэсэг */}
            <div className="w-full min-w-0 max-w-3xl mx-auto">
              <SearchSection 
                onSearchResults={(data) => setScholarships(data)} 
                setLoadingState={(val) => setLoading(val)} 
              />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16 flex flex-col lg:flex-row gap-10">
        {/* Sidebar */}
        <aside className="w-full lg:w-1/4">
          <div className="sticky top-32 space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                <LayoutGrid size={14} /> Main Menu
              </p>
              <div className="space-y-1">
                <Link
                  href="/"
                  scroll={false}
                  onClick={() => void clearFilters()}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${(!selectedCountry && !showSavedOnly && !selectedCategory && !openDeadlineOnly) ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-900 hover:bg-emerald-50'}`}
                >
                  <Globe size={18} /> Бүх тэтгэлгүүд
                </Link>

                <button
                  onClick={() => { setShowSavedOnly(true); setSelectedCountry(null); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${showSavedOnly ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-900 hover:bg-emerald-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <Bookmark size={18} fill={showSavedOnly ? "white" : "none"} /> Хадгалсан
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${showSavedOnly ? 'bg-white text-emerald-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {savedItems?.length || 0}
                  </span>
                </button>

                <button onClick={() => window.location.href = '/courses'} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-emerald-900 hover:bg-emerald-50 transition-all">
                   <BookOpen size={18} /> Сургалтууд
                </button>
                <button onClick={() => window.location.href = '/forum'} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-emerald-900 hover:bg-emerald-50 transition-all">
                   <MessageSquare size={18} /> Форум
                </button>
                <button onClick={() => window.location.href = '/about'} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-emerald-900 hover:bg-emerald-50 transition-all">
                   <Info size={18} /> Бидний тухай
                </button>
              </div>
            </div>

            {/* Countries */}
            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm max-h-[500px] flex flex-col">
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-1">Popular Countries</p>
              <div className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                {countryFilterOptions.length === 0 ? (
                  <p className="text-xs text-slate-400 px-2 py-2">Улсын жагсаалт ачааллаагүй байна.</p>
                ) : (
                  countryFilterOptions.map((name) => (
                    <button
                      key={name}
                      onClick={() => { setSelectedCountry(name); setShowSavedOnly(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all group ${selectedCountry === name ? 'bg-emerald-50 text-emerald-600 font-bold' : 'text-emerald-900 hover:bg-emerald-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg group-hover:scale-110 transition-transform">{flagForCountry(name)}</span>
                        <span className="font-medium">{name}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Results Area */}
        <div className="w-full lg:w-3/4">
          <div className="flex justify-between items-end gap-4 mb-6">
            <div>
              <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.3em] mb-2">
                {showSavedOnly
                  ? "Таны хадгалсан"
                  : selectedCountry || selectedCategory || openDeadlineOnly
                    ? `Шүүлтүүр: ${[
                        selectedCountry,
                        selectedCategory ? CATEGORY_FILTER_BUTTONS.find((b) => b.id === selectedCategory)?.label : null,
                        openDeadlineOnly ? "Идэвхтэй (Active)" : null,
                      ].filter(Boolean).join(" · ")}`
                    : "Нийт"}
              </p>
              <h2 className="text-3xl font-serif italic text-emerald-950">
                {showSavedOnly
                  ? "Хадгалсан тэтгэлгүүд"
                  : selectedCountry && selectedCategory
                    ? `${selectedCountry} · ${CATEGORY_FILTER_BUTTONS.find((b) => b.id === selectedCategory)?.label}`
                    : selectedCountry
                      ? `${selectedCountry}-ийн тэтгэлгүүд`
                      : selectedCategory
                        ? `${CATEGORY_FILTER_BUTTONS.find((b) => b.id === selectedCategory)?.label} — тэтгэлгүүд`
                        : "Тэтгэлгүүд"}
              </h2>
            </div>
            {(selectedCountry || showSavedOnly || selectedCategory || openDeadlineOnly) && (
              <button onClick={clearFilters} className="text-xs text-emerald-600 flex items-center gap-1 hover:underline font-bold uppercase tracking-tighter shrink-0">
                <X size={14} /> Арилгах
              </button>
            )}
          </div>

          <div className="mb-10 flex flex-wrap gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-full mb-1">Category</span>
            {CATEGORY_FILTER_BUTTONS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setShowSavedOnly(false);
                  setSelectedCategory((prev) => (prev === id ? null : id));
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                  selectedCategory === id
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                    : "bg-white text-emerald-900 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/80"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mb-10 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-full sm:w-auto sm:mr-2">Статус</span>
            <button
              type="button"
              title="Зөвхөн дуусах хугацаа нь өнөөдрөөс хойш (эсвэл хугацаа заагаагүй) тэтгэлэг — идэвхтэй нээлттэй тэтгэлэг"
              onClick={() => {
                setShowSavedOnly(false);
                setOpenDeadlineOnly((v) => !v);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                openDeadlineOnly
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                  : "bg-white text-emerald-900 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/80"
              }`}
            >
              <CalendarCheck size={14} />
              <span>Идэвхтэй · Active</span>
            </button>
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
              <p className="text-gray-500">Уучлаарай, тэтгэлэг олдсонгүй.</p>
              <Button variant="link" onClick={clearFilters} className="text-emerald-600 font-bold">БҮХ ТЭТГЭЛГИЙГ ХАРАХ</Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}