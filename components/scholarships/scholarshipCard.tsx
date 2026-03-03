"use client";

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore"; 
import { sendTelegramNotification } from "@/lib/utils"; 
import { useAuth } from "@/context/AuthContext"; 
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ExternalLink, 
  Clock, 
  Globe2, 
  GraduationCap, 
  Lightbulb, 
  CheckCircle2 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ScholarshipDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth(); 
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  useEffect(() => {
    const fetchDoc = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "scholarships", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(docSnap.data());
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  // Checklist чагтлах ба Мэдэгдэл илгээх үндсэн функц
  const toggleCheck = async (index: number) => {
    const checklistItems = data?.checklist || ["OASIS Application", "Employer Support Letter", "Relevance Statement", "Transcripts"];
    
    // 1. Сонгосон item-ыг нэмэх эсвэл хасах
    const newCheckedItems = checkedItems.includes(index) 
      ? checkedItems.filter(i => i !== index) 
      : [...checkedItems, index];

    setCheckedItems(newCheckedItems);

    // 2. Хэрэв БҮХ item чагтлагдсан бол (Fully Checked)
    if (newCheckedItems.length === checklistItems.length && user) {
      try {
        // Firestore дээр хэрэглэгчийн статусыг 'completed' болгох
        await updateDoc(doc(db, "users", user.uid), {
          status: "completed",
          lastUpdatedScholarship: data.title,
          updatedAt: new Date().toISOString()
        });

        // Telegram мэдэгдэл бэлдэх
        const message = `✅ <b>CHECKLIST БҮРЭН ДУУСЛАА!</b>\n\n` +
                        `👤 <b>Хэрэглэгч:</b> ${user.displayName || user.email}\n` +
                        `🎓 <b>Тэтгэлэг:</b> ${data.title}\n` +
                        `📝 <b>Явц:</b> ${newCheckedItems.length}/${checklistItems.length} (100%)`;
        
        await sendTelegramNotification(message);
      } catch (error) {
        console.error("Update or Notification error:", error);
      }
    }
  };

  if (loading) return <div className="pt-32 text-center animate-pulse text-emerald-600 font-bold">Уншиж байна...</div>;
  if (!data) return <div className="pt-32 text-center">Тэтгэлэг олдсонгүй.</div>;

  const checklist = data.checklist || [
    "OASIS Application",
    "Employer Support Letter",
    "Relevance Statement",
    "Transcripts"
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-24">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-12 font-medium group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Буцах
        </button>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Зүүн тал: Тэтгэлгийн мэдээлэл */}
          <div className="flex-1">
             {/* ... (Тэтгэлгийн гарчиг, тайлбар хэсэг хэвээрээ) ... */}
             <div className="flex flex-col md:flex-row items-start gap-6 mb-10">
                <div className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg uppercase">
                  {data.country?.substring(0, 2)}
                </div>
                <div className="flex-1 space-y-3">
                  <h1 className="text-4xl font-black text-slate-900">{data.title}</h1>
                </div>
             </div>
             <p className="text-slate-500 italic mb-10">"{data.description}"</p>
          </div>

          {/* Баруун тал: Application Tracker */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-[#111827] rounded-[2.5rem] p-8 text-white shadow-2xl sticky top-32">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold">Application Tracker</h3>
                <span className="text-[10px] bg-emerald-500/20 px-2 py-1 rounded-md text-emerald-400 font-black">
                  {checkedItems.length} / {checklist.length}
                </span>
              </div>

              <div className="space-y-3 mb-10">
                {checklist.map((item: string, index: number) => (
                  <div 
                    key={index} 
                    onClick={() => toggleCheck(index)}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer border ${
                      checkedItems.includes(index) 
                        ? 'bg-emerald-500/10 border-emerald-500/50' 
                        : 'bg-white/5 border-transparent hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${
                      checkedItems.includes(index) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'
                    }`}>
                      {checkedItems.includes(index) && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                    <span className={`font-medium ${checkedItems.includes(index) ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <a href={data.link} target="_blank" rel="noopener noreferrer">
                <Button className="w-full h-16 bg-[#00E676] hover:bg-[#00C853] text-slate-900 font-black rounded-2xl">
                  Visit Official Website <ExternalLink size={20} className="ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}