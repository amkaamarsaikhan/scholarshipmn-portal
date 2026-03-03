"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, ArrowRight, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

// Таны getScholarships-д ашиглаж байгаа интерфэйс
export interface Scholarship {
  id: string;
  title: string;
  country: string;
  image?: string;
  type?: string;
  deadline?: string;
}

interface Props {
  item: Scholarship;
}

const ScholarshipCard: React.FC<Props> = ({ item }) => {
  const { toggleSave, isSaved } = useAuth();
  const saved = isSaved(item.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-[2.5rem] border border-emerald-100 overflow-hidden hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500 flex flex-col h-full"
    >
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={item.image || "/api/placeholder/400/320"}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
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

        {/* Floating Badges */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
              {item.type || "Full Fund"}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white leading-tight group-hover:text-emerald-400 transition-colors">
            {item.title}
          </h3>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8 flex flex-col flex-1">
        <div className="space-y-4 mb-8 flex-1 text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
              <MapPin size={16} className="text-emerald-600" />
            </div>
            <span className="text-sm font-medium">{item.country}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
              <Calendar size={16} className="text-emerald-600" />
            </div>
            <span className="text-sm font-medium">Deadline: {item.deadline || "TBA"}</span>
          </div>
        </div>

        {/* Action Button */}
        <Link href={`/scholarships/${item.id}`} className="block mt-auto">
          <Button className="w-full h-14 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border-none rounded-2xl font-bold transition-all duration-300 group/btn">
            Дэлгэрэнгүй харах
            <ArrowRight size={18} className="ml-2 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default ScholarshipCard;