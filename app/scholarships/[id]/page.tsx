"use client";

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { sendTelegramNotification } from "@/lib/telegram"; // Салгаж үүсгэсэн файлаас импортлоно
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
        console.error("Error fetching scholarship:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  const toggleCheck = async (index: number) => {
    const checklistItems = data?.checklist || ["OASIS Application", "Employer Support Letter", "Relevance Statement", "Transcripts"];
    
    const newCheckedItems = checkedItems.includes(index) 
      ? checkedItems.filter(i => i !== index) 
      : [...checkedItems, index];

    setCheckedItems(newCheckedItems);

    // Хэрэв БҮХ зүйл чагтлагдсан бол (Checklist бүрэн дуусах үед)
    if (newCheckedItems.length === checklistItems.length && user) {
      try {
        // 1. Firestore-д хэрэглэгчийн статусыг шинэчлэх
        await updateDoc(doc(db, "users", user.uid), {
          status: "completed",
          lastUpdatedScholarship: data.title,
          updatedAt: new Date().toISOString()
        });

        // 2. Telegram руу мэдэгдэл илгээх
        const tgMessage = `✅ <b>CHECKLIST ДУУСЛАА!</b>\n\n` +
                          `👤 <b>Хэрэглэгч:</b> ${user.displayName || user.email}\n` +
                          `🎓 <b>Тэтгэлэг:</b> ${data.title}\n` +
                          `🚀 <b>Төлөв:</b> Бүх материалаа бүрдүүлж дууслаа.`;
        
        await sendTelegramNotification(tgMessage);

        // 3. Админ руу Имэйл илгээх (Zoho-оор дамжуулж)
        await fetch('/api/admin-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: user.email,
            userName: user.displayName || user.email,
            scholarshipTitle: data.title
          }),
        });

        console.log("Telegram and Email notifications sent successfully!");
      } catch (error) {
        console.error("Notification process failed:", error);
      }
    }
  };

  if (loading) return <div className="pt-32 text-center animate-pulse text-emerald-600 font-bold text-xl">Уншиж байна...</div>;
  if (!data) return <div className="pt-32 text-center text-slate-500">Тэтгэлэг олдсонгүй.</div>;

  const currentChecklist = data.checklist || [
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
          Жагсаалт руу буцах
        </button>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Зүүн тал: Мэдээлэл */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row items-start gap-6 mb-10">
              <div className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-emerald-100 uppercase">
                {data.country?.substring(0, 2)}
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold px-3 py-1 rounded-lg flex gap-1 items-center shadow-sm">
                    <Globe2 size={12} /> {data.country}
                  </Badge>
                  <Badge className="bg-blue-50 text-blue-600 border-none font-bold px-3 py-1 rounded-lg flex gap-1 items-center shadow-sm">
                    <GraduationCap size={12} /> {data.level || data.category}
                  </Badge>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  {data.title}
                </h1>
              </div>
              <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-black border border-emerald-100">
                <Clock size={14} />
                {data.deadline?.toDate ? data.deadline.toDate().toLocaleDateString() : data.deadline}
              </div>
            </div>

            <div className="mb-12">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Overview</h3>
              <p className="text-slate-500 text-lg leading-relaxed italic whitespace-pre-wrap">
                "{data.description}"
              </p>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-slate-900 mb-8">Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                {data.requirements?.map((req: string, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-slate-600 font-medium">{req}</span>
                  </div>
                )) || <p className="text-slate-400 italic">Мэдээлэл байхгүй</p>}
              </div>
            </div>
          </div>

          {/* Баруун тал: Tracker */}
          <div className="w-full lg:w-[400px] space-y-6">
            <div className="bg-[#111827] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200 sticky top-32">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold">Application Tracker</h3>
                <span className="text-[10px] bg-white/10 px-2 py-1 rounded-md text-emerald-400 font-black tracking-widest uppercase">
                  {checkedItems.length} / {currentChecklist.length}
                </span>
              </div>

              <div className="space-y-3 mb-10">
                {currentChecklist.map((item: string, index: number) => (
                  <div 
                    key={index} 
                    onClick={() => toggleCheck(index)}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer border ${
                      checkedItems.includes(index) 
                        ? 'bg-emerald-500/10 border-emerald-500/50' 
                        : 'bg-white/5 border-transparent hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      checkedItems.includes(index) ? 'bg-emerald-500 border-emerald-500 scale-110' : 'border-slate-600'
                    }`}>
                      {checkedItems.includes(index) && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                    <span className={`font-medium transition-colors ${checkedItems.includes(index) ? 'text-emerald-400 line-through opacity-70' : 'text-slate-300'}`}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <a href={data.link} target="_blank" rel="noopener noreferrer">
                <Button className="w-full h-16 bg-[#00E676] hover:bg-[#00C853] text-slate-900 font-black text-lg rounded-2xl flex gap-2 transition-transform active:scale-95 shadow-xl shadow-[#00E676]/20">
                  Visit Official Website
                  <ExternalLink size={20} />
                </Button>
              </a>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex gap-4">
              <div className="text-amber-400 shrink-0">
                <Lightbulb size={24} fill="currentColor" />
              </div>
              <p className="text-amber-900/70 text-sm font-bold leading-relaxed italic">
                Зөвлөгөө: Өөрийн Personal Statement-ийг дуусах хугацаанаас дор хаяж 2 сарын өмнө бэлдэж эхлээрэй!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}