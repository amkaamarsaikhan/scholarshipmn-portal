"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, User as UserIcon, PlusCircle, Home } from 'lucide-react'; // Search-ийг хасав
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const { user, loading } = useAuth();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            console.error("Login Error:", error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    return (
        <nav className={`fixed w-full z-[100] transition-all duration-500 ${
                scrolled
                ? 'bg-white/90 backdrop-blur-lg border-b border-emerald-100 py-3 shadow-sm'
                : 'bg-transparent py-6'
            }`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

                {/* LOGO ХЭСЭГ */}
                <Link href="/" className={`flex items-center text-2xl font-serif italic tracking-tighter transition-colors duration-300 ${
                    scrolled ? 'text-emerald-950' : 'text-white'
                }`}>
                   SCHOLARSHIP
                   <span className="font-sans not-italic font-black ml-1 text-emerald-500 flex items-center">
                        MN <Home size={18} className="ml-1" />
                   </span>
                </Link>

                {/* ЦЭСҮҮД - Зөвхөн User нэвтэрсэн үед харагдана */}
                <div className={`hidden md:flex items-center space-x-10 text-[11px] uppercase tracking-[0.2em] font-bold transition-colors duration-300 ${
                    scrolled ? 'text-emerald-900' : 'text-emerald-50/90'
                }`}>
                    {user && (
                        <>
                            <Link href="/admin/add" className="text-emerald-500 hover:text-emerald-600 flex items-center gap-1 border border-emerald-500/30 px-3 py-1 rounded-full">
                                <PlusCircle size={14} /> Нэмэх
                            </Link>
                        </>
                    )}
                </div>

                {/* БАРУУН ТАЛ (User хэсэг) */}
                <div className="flex items-center space-x-6">
                    {/* Search Icon-г эндээс бүрэн устгав */}

                    {!loading && (
                        user ? (
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-end leading-none">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                                        scrolled ? 'text-emerald-950' : 'text-white'
                                    }`}>
                                        {user.displayName?.split(' ')[0] || "User"}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="text-[9px] text-emerald-500 font-bold uppercase tracking-tighter hover:underline"
                                    >
                                        Гарах
                                    </button>
                                </div>
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border-2 border-emerald-500 object-cover" />
                                ) : (
                                    <div className="bg-emerald-500 p-2 rounded-full text-white">
                                        <UserIcon size={16} />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Button
                                onClick={handleLogin}
                                variant="outline"
                                className={`rounded-none border-2 text-[10px] uppercase tracking-widest px-6 font-bold transition-all duration-300 ${
                                    scrolled
                                    ? 'border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                                    : 'border-white text-grey hover:bg-white/10 hover:border-white'
                                }`}
                            >
                                Нэвтрэх
                            </Button>
                        )
                    )}

                    <Menu className={`md:hidden w-6 h-6 ${scrolled ? 'text-emerald-950' : 'text-white'}`} />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;