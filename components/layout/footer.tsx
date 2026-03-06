"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
    Facebook, Instagram, Twitter, Mail, MapPin, Phone, 
    ArrowUpRight, CheckCircle2, Loader2, Send 
} from 'lucide-react';
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { sendTelegramNotification } from '@/lib/telegram';

const Footer = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            await addDoc(collection(db, "subscribers"), {
                email: email,
                subscribedAt: serverTimestamp(),
                status: "active"
            });

            await sendTelegramNotification(`📧 <b>ШИНЭ SUBSCRIBE!</b>\n\nИмэйл: ${email}`);
            setSubscribed(true);
            setEmail("");
        } catch (error) {
            console.error("Subscription error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer className="bg-[#022c22] text-white pt-24 pb-12">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    
                    {/* Brand & Mission */}
                    <div className="space-y-6">
                        <Link href="/" className="text-2xl font-black tracking-tighter">
                            SCHOLARSHIP<span className="text-emerald-400">MN</span>
                        </Link>
                        <p className="text-emerald-100/60 text-sm leading-relaxed">
                            Бид Монгол залууст дэлхийн шилдэг боловсрол эзэмших, тэтгэлэг авахад нь мэргэжлийн туслалцаа үзүүлж, ирээдүйн боломжийг нь нээж байна.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Instagram, Twitter].map((Icon, idx) => (
                                <a key={idx} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500 transition-colors group">
                                    <Icon size={18} className="text-emerald-100 group-hover:text-white" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-6">Үндсэн цэс</h4>
                        <ul className="space-y-4 text-emerald-100/60 text-sm font-medium">
                            <li><Link href="/scholarships" className="hover:text-emerald-400 transition-colors">Тэтгэлгүүд</Link></li>
                            <li><Link href="/mentors" className="hover:text-emerald-400 transition-colors">Менторууд</Link></li>
                            <li><Link href="/courses" className="hover:text-emerald-400 transition-colors">Сургалтууд</Link></li>
                            <li><Link href="/about" className="hover:text-emerald-400 transition-colors">Бидний тухай</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-bold text-lg mb-6">Холбоо барих</h4>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-emerald-100/60 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                    <Phone size={16} />
                                </div>
                                <a href="tel:99198805" className="hover:text-white transition-colors">99198805</a>
                            </li>
                            <li className="flex items-center gap-3 text-emerald-100/60 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                    <Mail size={16} />
                                </div>
                                <a href="mailto:admin@scholarshipmn.academy" className="hover:text-white transition-colors">admin@scholarshipmn.academy</a>
                            </li>
                            <li className="flex items-start gap-3 text-emerald-100/60 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                                    <MapPin size={16} />
                                </div>
                                <span>Улаанбаатар хот, Сүхбаатар дүүрэг, Мэдээлэл Технологийн Үндэсний Парк</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="font-bold text-lg mb-2">Мэдээлэл авах</h4>
                            <p className="text-emerald-100/50 text-xs mb-6">Шинэ тэтгэлгийн мэдээллийг цаг алдалгүй имэйлээр аваарай.</p>
                            
                            {subscribed ? (
                                <div className="bg-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs flex items-center gap-3 animate-in fade-in zoom-in">
                                    <CheckCircle2 size={18}/> 
                                    <span>Амжилттай бүртгэгдлээ!</span>
                                </div>
                            ) : (
                                <form onSubmit={handleSubscribe} className="space-y-3">
                                    <div className="relative">
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Имэйл хаяг"
                                            className="w-full bg-[#064e3b] border border-emerald-800 rounded-xl px-4 py-4 text-xs focus:outline-none focus:border-emerald-400 transition-all placeholder:text-emerald-100/30"
                                        />
                                        <button 
                                            disabled={loading}
                                            className="absolute right-2 top-2 bottom-2 bg-emerald-500 hover:bg-emerald-400 text-white px-4 rounded-lg transition-all flex items-center justify-center"
                                        >
                                            {loading ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/10 flex flex-col md:row-start-2 md:flex-row justify-between items-center gap-6">
                    <p className="text-emerald-100/40 text-[12px]">
                        © {new Date().getFullYear()} SCHOLARSHIPMN. Бүх эрх хуулиар хамгаалагдсан.
                    </p>
                    <div className="flex gap-8 text-[12px] text-emerald-100/40 font-medium">
                        <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Нууцлалын бодлого</Link>
                        <Link href="/terms" className="hover:text-emerald-400 transition-colors">Үйлчилгээний нөхцөл</Link>
                        <Link href="/cookies" className="hover:text-emerald-400 transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;