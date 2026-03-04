"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, ArrowUpRight, CheckCircle2, Loader2 } from 'lucide-react';
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    <div className="space-y-6">
                        <Link href="/" className="text-2xl font-black">
                            SCHOLARSHIP<span className="text-emerald-400">MN</span>
                        </Link>
                        <p className="text-emerald-100/60 text-sm">Бид Монгол залууст дэлхийн шилдэг боловсрол эзэмшихэд нь тусална.</p>
                    </div>
                    {/* Newsletter */}
                    <div className="lg:col-start-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h4 className="font-bold mb-4">Мэдээлэл авах</h4>
                        {subscribed ? (
                            <div className="text-emerald-400 text-sm flex items-center gap-2"><CheckCircle2 size={16}/> Бүртгэгдлээ!</div>
                        ) : (
                            <form onSubmit={handleSubscribe} className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Имэйл хаяг"
                                    className="w-full bg-[#064e3b] border border-emerald-800 rounded-xl px-4 py-3 text-xs focus:outline-none"
                                />
                                <button className="absolute right-2 top-2 bg-emerald-500 p-2 rounded-lg">
                                    {loading ? <Loader2 size={14} className="animate-spin"/> : <ArrowUpRight size={14}/>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;