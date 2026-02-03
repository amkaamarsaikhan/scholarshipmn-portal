"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, User as UserIcon, PlusCircle, Home, LayoutDashboard, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const { user, loading } = useAuth();

    // Таны админ имэйл (Энийг өөрийнхөөрөө солиорой)
    const isAdmin = user?.email === "amkaamarsaikhan@gmail.com";

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            // Нэвтэрсний дараа Firestore-оос шалгаад /complete-profile руу 
            // шилжүүлэх логикийг энд эсвэл useEffect-д нэмж болно.
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
        <nav className={`fixed w-full z-50 transition-all duration-500 ${
                scrolled
                ? 'bg-white/95 backdrop-blur-md border-b border-emerald-100 py-3 shadow-md'
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

                {/* ЦЭСҮҮД */}
                <div className="hidden md:flex items-center space-x-8 text-[11px] uppercase tracking-[0.2em] font-bold">
                    {user && (
                        <>
                            <Link href="/admin/add" className={`flex items-center gap-1.5 transition-colors ${
                                scrolled ? 'text-emerald-900 hover:text-emerald-500' : 'text-emerald-50 hover:text-white'
                            }`}>
                                <PlusCircle size={14} /> Тэтгэлэг нэмэх
                            </Link>
                            
                            {isAdmin && (
                                <Link href="/admin/users" className={`flex items-center gap-1.5 transition-colors ${
                                    scrolled ? 'text-emerald-900 hover:text-emerald-500' : 'text-emerald-50 hover:text-white'
                                }`}>
                                    <LayoutDashboard size={14} /> Админ Хяналт
                                </Link>
                            )}
                        </>
                    )}
                </div>

                {/* БАРУУН ТАЛ */}
                <div className="flex items-center space-x-6">
                    {!loading && (
                        user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger className="focus:outline-none">
                                    <div className="flex items-center gap-3 group">
                                        <div className="flex flex-col items-end leading-none">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors ${
                                                scrolled ? 'text-emerald-950' : 'text-white'
                                            }`}>
                                                {user.displayName?.split(' ')[0] || "User"}
                                            </span>
                                            <span className="text-[9px] text-emerald-500 font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                                                Миний цэс
                                            </span>
                                        </div>
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="Profile" className="w-9 h-9 rounded-full border-2 border-emerald-500 object-cover shadow-sm transition-transform active:scale-90" />
                                        ) : (
                                            <div className="bg-emerald-500 p-2 rounded-full text-white">
                                                <UserIcon size={18} />
                                            </div>
                                        )}
                                    </div>
                                </DropdownMenuTrigger>
                                
                                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl border-emerald-100 p-2 shadow-xl">
                                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-slate-400 p-2">
                                        Миний бүртгэл
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem className="rounded-xl focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer p-3">
                                        <Link href="/complete-profile" className="flex items-center w-full gap-2 text-xs font-bold uppercase tracking-tight">
                                            <Settings size={14} /> Мэдээлэл шинэчлэх
                                        </Link>
                                    </DropdownMenuItem>
                                    {isAdmin && (
                                        <DropdownMenuItem className="rounded-xl focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer p-3">
                                            <Link href="/admin/users" className="flex items-center w-full gap-2 text-xs font-bold uppercase tracking-tight text-emerald-600">
                                                <LayoutDashboard size={14} /> Хэрэгчдийн жагсаалт
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator className="bg-emerald-50" />
                                    <DropdownMenuItem 
                                        onClick={handleLogout}
                                        className="rounded-xl focus:bg-red-50 focus:text-red-600 cursor-pointer p-3 text-xs font-bold uppercase tracking-tight text-red-500"
                                    >
                                        Гарах
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button
                                onClick={handleLogin}
                                variant="outline"
                                className={`rounded-full border-2 text-[10px] uppercase tracking-widest px-8 h-10 font-black transition-all duration-300 shadow-lg active:scale-95 ${
                                    scrolled
                                    ? 'border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white shadow-emerald-100'
                                    : 'border-white text-white hover:bg-white/20 hover:border-white shadow-black/10'
                                }`}
                            >
                                Нэвтрэх
                            </Button>
                        )
                    )}

                    <Menu className={`md:hidden w-6 h-6 cursor-pointer ${scrolled ? 'text-emerald-950' : 'text-white'}`} />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;