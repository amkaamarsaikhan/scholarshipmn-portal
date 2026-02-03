"use client";

import { Badge } from "@/components/ui/badge";
import { MapPin, GraduationCap, Bookmark, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import DeadlineTimer from "./DeadlineTimer"; 
import { Scholarship } from "@/lib/types";

const COUNTRY_FLAGS: Record<string, string> = {
  "Australia": "🇦🇺", "Belgium": "🇧🇪", "Brunei": "🇧🇳", "Canada": "🇨🇦",
  "China": "🇨🇳", "EU": "🇪🇺", "France": "🇫🇷", "Germany": "🇩🇪",
  "Global": "🌎", "Hong Kong": "🇭🇰", "Hungary": "🇭🇺", "Indonesia": "🇮🇩",
  "Italy": "🇮🇹", "Japan": "🇯🇵", "Netherlands": "🇳🇱", "New Zealand": "🇳🇿",
  "Singapore": "🇸🇬", "South Korea": "🇰🇷", "Sweden": "🇸🇪", "Switzerland": "🇨🇭",
  "Taiwan": "🇹🇼", "Turkey": "🇹🇷", "UAE": "🇦🇪", "UK": "🇬🇧", "USA": "🇺🇸"
};

export default function ScholarshipCard({ item }: { item: Scholarship }) {
    const { toggleSave, savedItems } = useAuth();
    
    // Хадгалагдсан эсэхийг шалгах
    const isSaved = savedItems?.some((saved: Scholarship) => saved.id === item.id) || false;

    const handleToggleSave = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSave(item);
    };

    // ШИНЭЧЛЭГДСЭН ЛОГИК: image талбар байхгүй байсан ч ажиллана
    // @ts-ignore - image талбар types дээр байхгүй байсан ч аюулгүй шалгана
    const imageUrl = item.image;
    const hasImage = imageUrl && imageUrl !== "";
    const flag = COUNTRY_FLAGS[item.country] || "🌎";

    return (
        <div className="group relative bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 flex flex-col h-full overflow-hidden">
            
            {/* 1. Хадгалах товчлуур */}
            <button 
                onClick={handleToggleSave}
                className={`absolute top-6 right-6 z-20 p-3 rounded-2xl transition-all active:scale-90 ${
                    isSaved 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                    : 'bg-white/80 backdrop-blur-md text-slate-400 hover:text-emerald-500 shadow-sm'
                }`}
            >
                <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
            </button>

            <Link href={`/scholarships/${item.id}`} className="flex flex-col h-full">
                {/* Image Section - Зураг байхгүй бол туг харуулна */}
                <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-emerald-50 to-slate-100">
                    {hasImage ? (
                        <img
                            src={imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                            <span className="text-8xl group-hover:scale-110 transition-transform duration-500 select-none drop-shadow-2xl">
                                {flag}
                            </span>
                        </div>
                    )}
                    
                    <div className="absolute top-6 left-6">
                        <Badge className="bg-emerald-500 text-white border-none text-[10px] font-black uppercase tracking-[0.15em] px-4 py-1.5 rounded-xl shadow-lg shadow-emerald-500/20">
                            {item.category || "Full"}
                        </Badge>
                    </div>

                    <div className="absolute bottom-4 right-4 left-4">
                        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 border border-white/50 shadow-xl">
                            <DeadlineTimer deadline={item.deadline} />
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 text-emerald-600 text-[11px] uppercase tracking-[0.2em] font-black mb-3">
                        <MapPin size={14} strokeWidth={3} />
                        {item.country}
                    </div>

                    <h3 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-emerald-600 transition-colors leading-[1.2] line-clamp-2">
                        {item.title}
                    </h3>

                    <p className="text-slate-500 text-[13px] line-clamp-2 mb-6 italic leading-relaxed">
                        "{item.description}"
                    </p>

                    {/* Requirements Tags */}
                    {item.requirements && item.requirements.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {item.requirements.slice(0, 2).map((req, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 bg-slate-50 text-slate-600 py-1.5 px-3 rounded-lg text-[10px] font-bold border border-slate-100">
                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                    {req}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-auto pt-6 border-t border-slate-50 space-y-4">
                        <div className="flex items-center gap-3 text-slate-600 font-bold text-sm">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
                                <GraduationCap size={18} />
                            </div>
                            <span className="truncate">{item.organization}</span>
                        </div>

                        <div className="flex items-center justify-center gap-2 w-full py-4 bg-slate-50 text-slate-700 font-black text-xs uppercase tracking-widest rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            Дэлгэрэнгүй үзэх
                            <ChevronRight size={18} />
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}