"use client";

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import {
    Star,
    Clock,
    ArrowRight,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import Link from 'next/link';

// Бүртгэлийн хуудсан дээр байдаг бүх боломжит сургалтын төрлүүд
const COURSE_TAGS = [
    "IELTS", "TOPIK", "HSK", "JLPT", "German", "French", 
    "Математик", "Физик", "Нийгэм", "Эссэ бичих"
];

export default function CoursesPage() {
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("Бүгд");

    useEffect(() => {
        const fetchCoursePartners = async () => {
            try {
                const partnersRef = collection(db, "partners");
                // Зөвхөн админ зөвшөөрсөн партнеруудыг татах
                const q = query(
                    partnersRef, 
                    where("approved", "==", true),
                    orderBy("createdAt", "desc")
                );
                
                const querySnapshot = await getDocs(q);
                const allPartners = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // targetCountries дотор нь COURSE_TAGS-д багтсан ямар нэг курс байгаа партнеруудыг шүүнэ
                const courseOnlyPartners = allPartners.filter((p: any) => 
                    p.targetCountries?.some((tag: string) => COURSE_TAGS.includes(tag))
                );

                setPartners(courseOnlyPartners);
            } catch (error) {
                console.error("Error fetching partners:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCoursePartners();
    }, []);

    // Бүх курсуудыг шүүлтүүр дээр харуулах (Бүгд + Жагсаалт)
    const filterButtons = ["Бүгд", ...COURSE_TAGS];

    // Сонгосон төрлөөр датаг шүүх
    const filteredData = activeFilter === "Бүгд" 
        ? partners 
        : partners.filter(p => p.targetCountries?.includes(activeFilter));

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-emerald-600" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Hero Section */}
            <section className="bg-[#022c22] py-24 text-white text-center">
                <div className="container mx-auto px-6">
                    <span className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-[10px] font-black mb-6 inline-block border border-emerald-500/20 uppercase tracking-widest">
                        Мэргэжлийн сургалтын төвүүд
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 italic uppercase tracking-tighter">
                        Ур чадвараа ахиулж, <br />
                        <span className="text-emerald-400">Тэтгэлэгт ойрт</span>
                    </h1>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-[#022c22] mb-2 uppercase italic tracking-tighter">Идэвхтэй сургалтууд</h2>
                        <p className="text-gray-500 font-bold italic text-sm text-emerald-900/40">Бүртгүүлсэн партнеруудын мэдээлэл</p>
                    </div>

                    {/* Фильтр товчлуурууд - Одоо бүгд харагдана */}
                    <div className="flex flex-wrap gap-2 max-w-2xl justify-end">
                        {filterButtons.map((cat) => (
                            <button 
                                key={cat} 
                                onClick={() => setActiveFilter(cat)}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all border uppercase italic tracking-widest ${
                                    activeFilter === cat 
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20" 
                                    : "bg-white text-gray-400 border-gray-200 hover:border-emerald-500 hover:text-emerald-600"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredData.map((partner) => (
                        <div key={partner.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                            {/* Banner Image */}
                            <div className="relative h-56 overflow-hidden">
                                <img 
                                    src={partner.featuredImage} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                    alt={partner.name}
                                />
                                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                    {partner.targetCountries?.filter((tag: string) => COURSE_TAGS.includes(tag)).map((tag: string) => (
                                        <span key={tag} className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black text-[#022c22] uppercase tracking-tighter border border-white/50">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8">
                                {/* Logo & Title */}
                                <div className="flex items-center gap-4 mb-6">
                                    <img src={partner.logo} className="w-12 h-12 rounded-2xl object-cover shadow-sm border border-gray-100" alt="logo" />
                                    <div>
                                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1 italic">Бүртгэлтэй партнер</h4>
                                        <span className="text-xl font-black text-slate-900 leading-none tracking-tighter uppercase italic">{partner.name}</span>
                                    </div>
                                </div>

                                <p className="text-gray-500 text-sm font-medium line-clamp-3 mb-6 h-15 leading-relaxed">
                                    {partner.description}
                                </p>

                                <div className="flex items-center justify-between py-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                        <Clock size={14} />
                                        <span>Бүртгэл нээлттэй</span>
                                    </div>
                                    <div className="flex items-center text-amber-400 gap-1 italic">
                                        <Star size={14} fill="currentColor" /> 
                                        <span className="text-slate-900 text-xs font-black">5.0</span>
                                    </div>
                                </div>

                                <a href={partner.link} target="_blank" rel="noopener noreferrer">
                                    <button className="w-full mt-4 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase italic text-xs tracking-widest shadow-sm">
                                        Дэлгэрэнгүй үзэх <ArrowRight size={18} />
                                    </button>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Хоосон үед харагдах хэсэг */}
                {filteredData.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                        <p className="text-gray-300 font-black uppercase italic tracking-[0.2em] text-sm">Одоогоор энэ чиглэлээр сургалт бүртгэгдээгүй байна.</p>
                    </div>
                )}
            </section>

            {/* Footer / CTA */}
            <section className="pb-24 container mx-auto px-6">
                <div className="bg-emerald-600 rounded-[3rem] p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl shadow-emerald-900/10">
                    <div className="max-w-xl text-center lg:text-left">
                        <h2 className="text-4xl font-black mb-6 italic uppercase tracking-tighter leading-none">Сургалтын төвөө энд <br />байршуулах уу?</h2>
                        <p className="text-emerald-100 font-bold mb-8 italic opacity-80 text-sm">Бид тэтгэлэг горилогч залууст танай үйлчилгээг шууд хүргэх болно.</p>
                        <div className="flex flex-col gap-4">
                            {["IELTS / TOEFL сургалтууд", "ЭЕШ-ын бэлтгэл курсууд", "Эссэ зөвлөх үйлчилгээ"].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle2 className="text-emerald-300 shadow-sm" size={20} />
                                    <span className="text-[10px] font-black uppercase italic tracking-widest">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white/10 p-10 rounded-[2.5rem] border border-white/20 backdrop-blur-md text-center w-full lg:w-auto">
                        <Link href="/partners/register" className="bg-white text-emerald-950 px-12 py-5 rounded-2xl font-black hover:bg-emerald-50 transition-all inline-block w-full text-lg uppercase italic tracking-tighter shadow-xl">
                            ПАРТНЕР БОЛОХ
                        </Link>
                        <p className="text-[10px] mt-4 text-emerald-200 font-black uppercase tracking-[0.3em] opacity-60">Холбогдох: 99198805</p>
                    </div>
                </div>
            </section>
        </div>
    );
}