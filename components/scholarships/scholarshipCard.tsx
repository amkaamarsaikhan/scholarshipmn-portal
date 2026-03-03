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
  CheckCircle2 
} from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function ScholarshipDetails() {
  const params = useParams();
  const id = params?.id as string; // URL-аас ID-г аюулгүй авах
  const router = useRouter();
  const { user } = useAuth(); 
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  useEffect(() => {
    const fetchDoc = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "scholarships", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() });
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
    
    // 1. Шинэ төлөвийг тодорхойлох
    const isAlreadyChecked = checkedItems.includes(index);
    const newCheckedItems = isAlreadyChecked 
      ? checkedItems.filter(i => i !== index) 
      : [...checkedItems, index];

    setCheckedItems(newCheckedItems);

    // 2. Хэрэв БҮХ item чагтлагдсан бол мэдэгдэх
    if (newCheckedItems.length === checklistItems.length && user) {
      try {
        // Хэрэглэгчийн явцыг Firestore-д хадгалах
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          status: "completed",
          lastCompletedScholarship: data?.title || "Unknown",
          updatedAt: new Date().toISOString()
        });

        // Telegram мэдэгдэл илгээх
        const message = `✅ <b>CHECKLIST БҮРЭН ДУУСЛАА!</b>\n\n` +
                        `👤 <b>Хэрэглэгч:</b> ${user.displayName || user.email}\n` +
                        `🎓 <b>Тэтгэлэг:</b> ${data?.title || "Тодорхойгүй"}\n` +
                        `📝 <b>Явц:</b> ${newCheckedItems.length}/${checklistItems.length} (100%)`;
        
        await sendTelegramNotification(message);
      } catch (error) {
        console.error("Update or Notification error:", error);
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="animate-pulse text-emerald-600 font-bold text-xl">Уншиж байна...</div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <p className="text-slate-500 mb-4">Тэтгэлэг олдсонгүй.</p>
      <Button onClick={() => router.push('/')}>Буцах</Button>
    </div>
  );

  const checklist = data.checklist || ["OASIS Application", "Employer Support Letter", "Relevance Statement", "Transcripts"];

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
          {/* Зүүн тал: Мэдээлэл */}
          <div className="flex-1">
             <div className="flex flex-col md:flex-row items-start gap-6 mb-10">
                <div className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg uppercase shrink-0">
                  {data.country ? data.country.substring(0, 2) : "🌎"}
                </div>
                <div className="flex-1 space-y-3">
                  <h1 className="text-4xl font-black text-slate-900 leading-tight">{data.title}</h1>
                  <p className="text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    {data.country}
                  </p>
                </div>
             </div>
             <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 text-lg leading-relaxed mb-10">
                  {data.description}
                </p>
             </div>
          </div>

          {/* Баруун тал: Checklist Tracker */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-[#111827] rounded-[2.5rem] p-8 text-white shadow-2xl sticky top-32">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold">Application Tracker</h3>
                  <p className="text-slate-400 text-xs mt-1">Бүрдүүлэх материалын жагсаалт</p>
                </div>
                <span className="text-[10px] bg-emerald-500/20 px-3 py-1 rounded-full text-emerald-400 font-black border border-emerald-500/30">
                  {checkedItems.length} / {checklist.length}
                </span>
              </div>

              <div className="space-y-3 mb-10">
                {checklist.map((item: string, index: number) => (
                  <div 
                    key={index} 
                    onClick={() => toggleCheck(index)}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer border select-none ${
                      checkedItems.includes(index) 
                        ? 'bg-emerald-500/10 border-emerald-500/50' 
                        : 'bg-white/5 border-transparent hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      checkedItems.includes(index) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'
                    }`}>
                      {checkedItems.includes(index) && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                    <span className={`font-medium text-sm transition-colors ${checkedItems.includes(index) ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <a 
                href={data.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full h-16 bg-[#00E676] hover:bg-[#00C853] text-slate-900 font-black rounded-2xl transition-all transform active:scale-95 shadow-xl shadow-emerald-500/20 group">
                  Одоо бүртгүүлэх 
                  <ExternalLink size={20} className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}