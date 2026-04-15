"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
    Facebook, Instagram, Twitter, Mail, MapPin, Phone, 
    CheckCircle2, Loader2, Send 
} from 'lucide-react';

const Footer = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [subscribeState, setSubscribeState] = useState<"idle" | "success" | "error">("idle");
    const [subscribeMessage, setSubscribeMessage] = useState("");

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setSubscribeState("idle");
        setSubscribeMessage("");
        try {
            // Newsletter subscription-ийг server API-р дамжуулж хадгална.
            // Ингэснээр user нэвтрээгүй (guest) байсан ч permission-denied авахгүй.
            const subscribeRes = await fetch('/api/newsletter-subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const subscribeResult = await subscribeRes.json();
            if (!subscribeRes.ok) {
                throw new Error(subscribeResult?.error || 'Subscription failed');
            }

            if (subscribeResult?.alreadySubscribed) {
                setSubscribeState("success");
                setSubscribeMessage("Та өмнө нь бүртгүүлсэн байна.");
                setEmail("");
                setLoading(false);
                return;
            }

            // Админ руу Zoho-гоор мэдэгдэл илгээх API-г дуудах
            await fetch('/api/admin-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newUserEmail: email.trim().toLowerCase() }),
            });

            setSubscribeState("success");
            setSubscribeMessage("Амжилттай бүртгэгдлээ!");
            setEmail("");
        } catch (error: any) {
            if (typeof error?.code === "string" && error.code.includes("permission-denied")) {
                setSubscribeMessage("Системийн зөвшөөрлийн алдаа гарлаа. Админтай холбогдоно уу.");
            } else {
                setSubscribeMessage("Бүртгэл амжилтгүй боллоо. Дахин оролдоно уу.");
            }
            setSubscribeState("error");
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
                            <li><Link href="/" className="hover:text-emerald-400 transition-colors">Тэтгэлгүүд</Link></li>
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
                                <a href="tel:96969060" className="hover:text-white transition-colors">+976-96969060</a>
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
                                <span>Улаанбаатар хот, ITC tower</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter (Бүртгэл хэсэг) */}
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="font-bold text-lg mb-2">Мэдээлэл авах</h4>
                            <p className="text-emerald-100/50 text-xs mb-6">Шинэ тэтгэлгийн мэдээллийг цаг алдалгүй имэйлээр аваарай.</p>
                            
                            <form onSubmit={handleSubscribe} className="space-y-3">
                                <div className="relative">
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Имэйл хаяг"
                                        disabled={loading}
                                        className="w-full bg-[#064e3b] border border-emerald-800 rounded-xl px-4 py-4 text-xs focus:outline-none focus:border-emerald-400 transition-all placeholder:text-emerald-100/30 text-white disabled:opacity-70"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="absolute right-2 top-2 bottom-2 bg-emerald-500 hover:bg-emerald-400 text-white px-4 rounded-lg transition-all flex items-center justify-center disabled:opacity-70"
                                    >
                                        {loading ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}
                                    </button>
                                </div>
                            </form>
                            {subscribeState !== "idle" && (
                                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in zoom-in ${
                                    subscribeState === "success"
                                        ? "bg-emerald-500/20 text-emerald-300"
                                        : "bg-red-500/20 text-red-200"
                                }`}>
                                    {subscribeState === "success" ? <CheckCircle2 size={16} /> : <span>!</span>}
                                    <span>{subscribeMessage}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-emerald-100/40 text-[12px]">
                        © {new Date().getFullYear()} SCHOLARSHIPMN. Бүх эрх хуулиар хамгаалагдсан.
                    </p>
                    <div className="flex gap-8 text-[12px] text-emerald-100/40 font-medium">
                        <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Нууцлалын бодлого</Link>
                        <Link href="/terms" className="hover:text-emerald-400 transition-colors">Үйлчилгээний нөхцөл</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;