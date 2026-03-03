"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
// DeadlineTimer-ийг импортлох (Замаа шалгаарай: ./deadlineTimer)
import DeadlineTimer from "./DeadlineTimer";

// Улсын далбааны жагсаалт
const COUNTRY_FLAGS: { [key: string]: string } = {
  "Australia": "🇦🇺",
  "Canada": "🇨🇦",
  "China": "🇨🇳",
  "France": "🇫🇷",
  "Germany": "🇩🇪",
  "Japan": "🇯🇵",
  "South Korea": "🇰🇷",
  "UK": "🇬🇧",
  "USA": "🇺🇸",
  "Global": "🌎",
  "Hungary": "🇭🇺",
  "Turkey": "🇹🇷",
  "Italy": "🇮🇹",
  "Taiwan": "🇹🇼",
  "Netherlands": "🇳🇱",
};

export interface Scholarship {
  id: string;
  title: string;
  country: string;
  image?: string;
  type?: string;
  deadline?: any; // Firebase Timestamp эсвэл String байж болно
}

interface Props {
  item: Scholarship;
}

const ScholarshipCard: React.FC<Props> = ({ item }) => {
  const { toggleSave, isSaved } = useAuth();
  const saved = isSaved(item.id);

  // Улсын нэрээр далбааг олох
  const flag = COUNTRY_FLAGS[item.country.trim()] || "🌎";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-[2.5rem] border border-emerald-100 overflow-hidden hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500 flex flex-col h-full"
    >
      {/* --- Image Section --- */}
      <div className="relative h-64 overflow-hidden bg-emerald-50 flex items-center justify-center">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          /* Зураггүй үед улсын далбааг томоор харуулах */
          <div className="text-[120px] transition-transform duration-700 group-hover:scale-125 select-none">
            {flag}
          </div>
        )}
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        
        {/* Save Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            toggleSave(item);
          }}
          className="absolute top-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-white hover:text-emerald-600 transition-all duration-300 z-10"
        >
          <Bookmark size={20} fill={saved ? "currentColor" : "none"} />
        </button>

        {/* Floating Info (Type & Title) */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
              {item.type || "Full Fund"}
            </span>
            <span className="text-xl drop-shadow-md">{flag}</span>
          </div>
          <h3 className="text-xl font-bold text-white leading-tight group-hover:text-emerald-400 transition-colors">
            {item.title}
          </h3>
        </div>
      </div>

      {/* --- Content Section --- */}
      <div className="p-8 flex flex-col flex-1">
        <div className="space-y-6 mb-8 flex-1">
          
          {/* Location Row */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
              <MapPin size={18} className="text-emerald-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest leading-none mb-1 text-left">Улс</span>
              <span className="text-sm font-semibold text-slate-700">{flag} {item.country}</span>
            </div>
          </div>

          {/* Deadline Row (Чиний бэлдсэн DeadlineTimer-ийг ашиглав) */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1 text-left">Дуусах хугацаа</p>
            {item.deadline ? (
              <DeadlineTimer deadline={item.deadline} />
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-dashed border-slate-200 w-fit">
                Хугацаа тодорхойгүй
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Link href={`/scholarships/${item.id}`} className="block mt-auto">
          <Button className="w-full h-14 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border-none rounded-2xl font-bold transition-all duration-300 group/btn shadow-sm">
            Дэлгэрэнгүй харах
            <ArrowRight size={18} className="ml-2 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default ScholarshipCard;