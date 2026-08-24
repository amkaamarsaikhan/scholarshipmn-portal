"use client";

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import Image from "next/image";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp // 🔥 1. Энийг нэмсэн: Цагийг серверээс авахад хэрэгтэй
} from "firebase/firestore";
import { sendTelegramNotification } from "@/lib/telegram";
import { useAuth } from "@/context/AuthContext";
import { useParams } from 'next/navigation';
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Clock,
  GraduationCap,
  Award,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { flagForCountry } from "@/components/scholarships/scholarshipCard";

export default function ScholarshipDetailsPage() {
  const { id } = useParams();
  const { user, checklistProgress, setChecklist } = useAuth();
  const [data, setData] = useState<any>(null);
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [guestChecked, setGuestChecked] = useState<number[]>([]);
  const scholarshipId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
  const checkedItems = user
    ? (checklistProgress[scholarshipId] ?? [])
    : guestChecked;

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        // 1. Тэтгэлгийн мэдээллийг татах
        const docRef = doc(db, "scholarships", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const scholarshipData = docSnap.data();
          setData(scholarshipData);

          // 🔥 2. ШИНЭ ЛОГИК: Хүн орж үзэх болгонд 'lastViewedAt' талбарыг шинэчилнэ
          // Ингэснээр Home хуудас дээрх orderBy("lastViewedAt", "desc") зөв ажиллана
          await updateDoc(docRef, {
            lastViewedAt: serverTimestamp()
          });

          // 3. Улсаар нь шүүж зуучлагч компаниудыг татах
          if (scholarshipData.country) {
            const partnersRef = collection(db, "partners");
            const q = query(
              partnersRef,
              where("targetCountries", "array-contains", scholarshipData.country)
            );
            const pSnap = await getDocs(q);
            const pList = pSnap.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter((p: any) => p.approved === true);
            setPartners(pList);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!scholarshipId || user) return;
    try {
      const raw = localStorage.getItem(`checklist:${scholarshipId}:guest`);
      const parsed = raw ? JSON.parse(raw) : [];
      setGuestChecked(Array.isArray(parsed) ? parsed.filter((n: unknown) => typeof n === "number") : []);
    } catch {
      setGuestChecked([]);
    }
  }, [scholarshipId, user]);

  const toggleCheck = async (index: number) => {
    if (!data || !scholarshipId) return;

    const checklistItems = Array.isArray(data.checklist) ? data.checklist : [];
    if (checklistItems.length === 0) return;

    const wasComplete = checkedItems.length === checklistItems.length;
    const newCheckedItems = checkedItems.includes(index)
      ? checkedItems.filter(i => i !== index)
      : [...checkedItems, index];
    const isComplete = newCheckedItems.length === checklistItems.length;

    if (user) {
      await setChecklist(
        scholarshipId,
        newCheckedItems,
        isComplete
          ? {
              status: "completed",
              lastUpdatedScholarship: data.title || "Unknown",
              updatedAt: new Date().toISOString(),
            }
          : undefined
      );
    } else {
      setGuestChecked(newCheckedItems);
      try {
        localStorage.setItem(`checklist:${scholarshipId}:guest`, JSON.stringify(newCheckedItems));
      } catch {
        // ignore quota / private mode
      }
    }

    if (isComplete && !wasComplete && user && data) {
      try {
        const tgMessage = `✅ <b>CHECKLIST ДУУСЛАА!</b>\n\n` +
          `👤 <b>Хэрэглэгч:</b> ${user.displayName || user.email}\n` +
          `🎓 <b>Тэтгэлэг:</b> ${data.title}\n` +
          `🚀 <b>Төлөв:</b> Бүх материалаа бүрдүүлж дууслаа.`;

        await sendTelegramNotification(tgMessage);

        await fetch('/api/admin-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: user.email,
            userName: user.displayName || user.email,
            scholarshipTitle: data.title
          }),
        });
      } catch (error) {
        console.error("Notification process failed:", error);
      }
    }
  };

  if (loading) return <div className="py-20 text-center animate-pulse text-emerald-600 font-bold text-xl">Уншиж байна...</div>;
  if (!data) return (
    <div className="py-20 text-center text-slate-500">
      Тэтгэлэг олдсонгүй.{" "}
      <Link href="/" className="text-emerald-600 font-bold hover:underline">Жагсаалт руу буцах</Link>
    </div>
  );

  const currentChecklist = Array.isArray(data.checklist) ? data.checklist.filter(Boolean) : [];

  const eligibilityScores: { label: string; value: number }[] = [];
  const n = (v: unknown) => (typeof v === "number" && !Number.isNaN(v) ? v : null);
  const pushIfPositive = (label: string, raw: unknown) => {
    const v = n(raw);
    if (v !== null && v > 0) eligibilityScores.push({ label, value: v });
  };
  pushIfPositive("IELTS (доод)", data.minIelts);
  pushIfPositive("GPA (доод)", data.minGpa);
  pushIfPositive("TestDaF / Герман", data.minGerman);
  pushIfPositive("HSK", data.minHsk);
  pushIfPositive("TOPIK", data.minTopik);
  pushIfPositive("JLPT", data.minJlpt);

  const countryFlag = flagForCountry(data.country);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-12 font-medium group w-fit"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Жагсаалт руу буцах
        </Link>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start gap-6 mb-10">
              <div className="w-20 h-20 bg-white rounded-2xl border border-emerald-100 flex items-center justify-center text-5xl shadow-sm shadow-emerald-100 select-none" aria-hidden>
                {countryFlag}
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold px-3 py-1 rounded-lg flex gap-1.5 items-center">
                    <span className="text-base leading-none">{countryFlag}</span>
                    <span>{data.country}</span>
                  </Badge>
                  {(data.degree || data.level) && (
                    <Badge className="bg-blue-50 text-blue-600 border-none font-bold px-3 py-1 rounded-lg flex gap-1 items-center">
                      <GraduationCap size={12} /> {data.degree || data.level}
                    </Badge>
                  )}
                  {(data.category || data.type) && (
                    <Badge className="bg-amber-50 text-amber-800 border-none font-bold px-3 py-1 rounded-lg flex gap-1 items-center">
                      <Award size={12} /> {data.category || data.type}
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  {data.title}
                </h1>
                {data.organization ? (
                  <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
                    <Building2 size={16} className="text-emerald-600 shrink-0" />
                    {data.organization}
                  </p>
                ) : null}
              </div>
              <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-black border border-emerald-100">
                <Clock size={14} />
                {data.deadline?.toDate ? data.deadline.toDate().toLocaleDateString() : String(data.deadline || "Хугацаагүй")}
              </div>
            </div>

            <div className="mb-12">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Тойм</h3>
              <p className="text-slate-500 text-lg leading-relaxed italic whitespace-pre-wrap">
                "{data.description}"
              </p>
            </div>

            {(eligibilityScores.length > 0) && (
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm mb-12">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Оноо, хэлний шаардлага</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {eligibilityScores.map(({ label, value }) => (
                    <div
                      key={label}
                      className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3"
                    >
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">{label}</p>
                      <p className="text-lg font-black text-emerald-700 tabular-nums">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements Section */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm mb-12">
              <h3 className="text-xl font-bold text-slate-900 mb-8">Шаардлага</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                {data.requirements?.length ? data.requirements.map((req: string, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-slate-600 font-medium">{req}</span>
                  </div>
                )) : (
                  <p className="text-slate-400 text-sm">Шаардлага бичигдээгүй байна.</p>
                )}
              </div>
            </div>

            {/* Partners Section */}
            {partners.length > 0 && (
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-[2.5rem] p-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Building2 className="text-emerald-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Мэргэжлийн тусламж авах</h3>
                    <p className="text-sm text-emerald-600 font-medium">{data.country} улс руу зуучлах албан ёсны байгууллагууд</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {partners.map((partner) => (
                    <div key={partner.id} className="bg-white p-6 rounded-3xl border border-emerald-100/50 hover:shadow-xl hover:shadow-emerald-900/5 transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center">
                          {partner.logo ? (
                          <Image
                            src={partner.logo}
                            alt={`${partner.name} лого`}
                            width={48}
                            height={48}
                            sizes="48px"
                            className="w-full h-full object-cover"
                          />
                          ) : (
                            <Building2 size={20} className="text-emerald-600" />
                          )}
                        </div>
                        <Badge className="bg-emerald-500 text-white border-none text-[10px] font-bold">Партнер</Badge>
                      </div>
                      <h4 className="font-bold text-slate-900 mb-1">{partner.name}</h4>
                      <p className="text-xs text-slate-500 mb-6 line-clamp-2 leading-relaxed">
                        {partner.description || `${data.country} улсын тэтгэлэгт зуучлах, визний зөвлөгөө өгөх мэргэжлийн хамт олон.`}
                      </p>
                      <Link href={`/partners/${partner.id}`}>
                        <Button variant="outline" className="w-full h-12 rounded-xl border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-600 hover:text-white transition-all">
                          Зөвлөгөө авах
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Tracker */}
          <div className="w-full lg:w-[400px] space-y-6">
            <div className="bg-[#111827] rounded-[2.5rem] p-8 text-white shadow-2xl sticky top-24">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold">Өргөдлийн явц</h3>
                <span className="text-[10px] bg-white/10 px-2 py-1 rounded-md text-emerald-400 font-black">
                  {checkedItems.length} / {currentChecklist.length}
                </span>
              </div>

              <div className="space-y-3 mb-10">
                {currentChecklist.length === 0 ? (
                  <p className="text-slate-400 text-sm">Чеклист байхгүй байна.</p>
                ) : currentChecklist.map((item: string, index: number) => (
                  <div
                    key={index}
                    onClick={() => toggleCheck(index)}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer border ${checkedItems.includes(index)
                        ? 'bg-emerald-500/10 border-emerald-500/50'
                        : 'bg-white/5 border-transparent hover:bg-white/10'
                      }`}
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${checkedItems.includes(index) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'
                      }`}>
                      {checkedItems.includes(index) && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                    <span className={`font-medium ${checkedItems.includes(index) ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {data.link ? (
              <a href={data.link} target="_blank" rel="noopener noreferrer">
                <Button className="w-full h-16 bg-[#00E676] hover:bg-[#00C853] text-slate-900 font-black text-lg rounded-2xl flex gap-2">
                  Албан ёсны хуудас
                  <ExternalLink size={20} />
                </Button>
              </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}