"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, ArrowUpRight, CheckCircle2, Loader2 } from 'lucide-react';
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { sendTelegramNotification } from '@/lib/utils';

const Footer = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            // 1. Firestore-д 'subscribers' цуглуулгад хадгалах
            await addDoc(collection(db, "subscribers"), {
                email: email,
                subscribedAt: serverTimestamp(),
                status: "active"
            });

            // 2. Telegram-д мэдэгдэх (Чамд шинэ хүн бүртгүүллээ гэж ирнэ)
            await sendTelegramNotification(`📧 <b>ШИНЭ SUBSCRIBE!</b>\n\nИмэйл: ${email}\nОдоо шинэ тэтгэлэг гарах бүрт энэ хүнд мэдээлэл очих боломжтой.`);

            setSubscribed(true);
            setEmail("");
        } catch (error) {
            console.error("Subscription error:", error);
            alert("Алдаа гарлаа. Дахин оролдоно уу.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer className="relative bg-[#022c22] text-white pt-24 pb-12 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -z-10" />
            
            <div className="container mx-auto px-6 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">

                    {/* 1. Logo & About */}
                    <div className="space-y-8">
                        <div>
                            <Link href="/" className="text-2xl font-black tracking-tighter flex items-center group">
                                SCHOLARSHIP<span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform">MN</span>
                            </Link>
                            <div className="h-1 w-8 bg-emerald-500 mt-1 rounded-full" />
                        </div>
                        <p className="text-emerald-100/60 text-[13px] leading-relaxed font-medium max-w-xs">
                            Бид Монгол залууст дэлхийн шилдэг боловсрол эзэмшихэд нь тусалж, баталгаат тэтгэлгийн мэдээллээр хангахыг зорьж байна.
                        </p>
                        <div className="flex space-x-3">
                            {[Facebook, Instagram, Twitter].map((Icon, idx) => (
                                <a key={idx} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all duration-300 border border-white/10">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* 2. Quick Links */}
                    <div>
                        <h4 className="text-[11px] uppercase tracking-[0.25em] font-black text-emerald-400 mb-8">Цэсүүд</h4>
                        <ul className="space-y-4 text-[13px] font-medium text-emerald-100/70">
                            {['Тэтгэлгүүд', 'Их сургуулиуд', 'Зөвлөгөө', 'Бидний тухай'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="hover:text-emerald-400 flex items-center gap-2 group transition-colors">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-800 group-hover:bg-emerald-400 transition-colors" />
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 3. Contact Info */}
                    <div>
                        <h4 className="text-[11px] uppercase tracking-[0.25em] font-black text-emerald-400 mb-8">Холбоо барих</h4>
                        <ul className="space-y-5 text-[13px] font-medium text-emerald-100/70">
                            <li className="flex items-start gap-4 group">
                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:border-emerald-500/50 transition-colors">
                                    <MapPin size={18} className="text-emerald-400" />
                                </div>
                                <span className="pt-1 text-[12px]">Улаанбаатар хот, Сүхбаатар дүүрэг</span>
                            </li>
                            <li className="flex items-center gap-4 group">
                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:border-emerald-500/50 transition-colors">
                                    <Phone size={18} className="text-emerald-400" />
                                </div>
                                <span className="text-[12px]">+976 9919-8805</span>
                            </li>
                        </ul>
                    </div>

                    {/* 4. Newsletter - ХОЛБОГДСОН ХЭСЭГ */}
                    <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 transition-all">
                        <h4 className="text-sm font-bold text-white mb-2">Мэдээлэл авах</h4>
                        <p className="text-xs text-emerald-100/50 mb-4">Шинэ тэтгэлгийн мэдээг имэйлээр авах.</p>
                        
                        {subscribed ? (
                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
                                <CheckCircle2 size={16} /> Бүртгэгдлээ! Баярлалаа.
                            </div>
                        ) : (
                            <form onSubmit={handleSubscribe} className="relative">
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Имэйл хаяг" 
                                    className="w-full bg-[#064e3b] border border-emerald-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-400 transition-colors text-white"
                                />
                                <button 
                                    disabled={loading}
                                    className="absolute right-2 top-2 bottom-2 bg-emerald-500 px-3 rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin text-white" /> : <ArrowUpRight size={16} className="text-white" />}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-100/30">
                        © {new Date().getFullYear()} SCHOLARSHIP MN. Бүх эрх хуулиар хамгаалагдсан.
                    </p>
                    <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-100/30">
                        <Link href="/terms" className="hover:text-emerald-400 transition-colors">Нөхцөл</Link>
                        <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Нууцлал</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;