"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, ArrowRight, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

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
      className="group bg-white rounded-3xl border border-emerald-100 overflow-hidden flex flex-col"
    >
      <div className="relative h-60">
        <img
          src={item.image ?? "/placeholder.jpg"}
          alt={item.title}
          className="w-full h-full object-cover"
        />

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleSave(item);
          }}
          className="absolute top-4 right-4 bg-white p-2 rounded-lg"
        >
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-bold text-lg mb-4">{item.title}</h3>

        <div className="space-y-2 text-sm text-gray-500 flex-1">
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            {item.country}
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            {item.deadline ?? "TBA"}
          </div>
        </div>

        <Link href={`/scholarships/${item.id}`} className="mt-6">
          <Button className="w-full">
            Дэлгэрэнгүй
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default ScholarshipCard;