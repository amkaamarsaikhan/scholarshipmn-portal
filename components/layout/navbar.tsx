"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, User as UserIcon, PlusCircle, Home, LayoutDashboard, Settings, UserCircle, LogOut, Bookmark } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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
    const [role, setRole] = useState<string | null>(null);
    const { user, loading } = useAuth();
    const router = useRouter();

    // 1. Хэрэглэгчийн эрхийг шалгах
    useEffect(() => {
        const checkRole = async () => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        setRole(userDoc.data().role || "user");
                    }
                } catch (error) {
                    console.error("Role fetch error:", error);
                }
            } else {
                setRole(null);
            }
        };
        checkRole();
    }, [user]);

    const isAdmin = role === "admin";

    // 2. Скролл хийх үед дизайн өөрчлөх
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/");
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    return (
        <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled
                ? 'bg-white/95 backdrop-blur-md border-b border-emerald-100 py-3 shadow-md'
                : 'bg-transparent py-6'
            }`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

                {/* --- LOGO --- */}
                <Link href="/" className={`flex items-center text-2xl font-serif italic tracking-tighter transition-colors duration-300 ${scrolled ? 'text-emerald-950' : 'text-white'
                    }`}>
                    SCHOLARSHIP
                    <span className="font-sans not-italic font-black ml-1 text-emerald-500 flex items-center">
                        MN <Home size={18} className="ml-1" />
                    </span>
                </Link>

                {/* --- ЦЭСҮҮД (Desktop) --- */}
                <div className="hidden md:flex items-center space-x-8 text-[11px] uppercase tracking-[0.2em] font-bold">
                    {user && (
                        <>
                            <Link href="/profile" className={`flex items-center gap-1.5 transition-colors ${scrolled ? 'text-emerald-900 hover:text-emerald-500' : 'text-emerald-50 hover:text-white'
                                }`}>
                                <Bookmark size={14} /> Миний Тэтгэлэг
                            </Link>

                            {isAdmin && (
                                <>
                                    <Link href="/admin/add" className={`flex items-center gap-1.5 transition-colors ${scrolled ? 'text-emerald-900 hover:text-emerald-500' : 'text-emerald-50 hover:text-white'
                                        }`}>
                                        <PlusCircle size={14} /> Тэтгэлэг нэмэх
                                    </Link>
                                    <Link href="/admin" className={`flex items-center gap-1.5 transition-colors ${scrolled ? 'text-emerald-900 hover:text-emerald-500' : 'text-emerald-50 hover:text-white'
                                        }`}>
                                        <LayoutDashboard size={14} /> Админ Хяналт
                                    </Link>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* --- БАРУУН ТАЛ (User Profile / Auth Buttons) --- */}
                <div className="flex items-center space-x-6">
                    {!loading && (
                        user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger className="focus:outline-none">
                                    <div className="flex items-center gap-3 group">
                                        <div className="flex flex-col items-end leading-none">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors ${scrolled ? 'text-emerald-950' : 'text-white'
                                                }`}>
                                                {user.displayName?.split(' ')[0] || "User"}
                                            </span>
                                            <span className="text-[9px] text-emerald-500 font-black uppercase tracking-tighter">
                                                {isAdmin ? "Админ" : "Хэрэглэгч"}
                                            </span>
                                        </div>
                                        <div className="relative">
                                            {user.photoURL ? (
                                                <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-2xl border-2 border-emerald-500 object-cover shadow-sm transition-transform group-hover:scale-105 active:scale-95" />
                                            ) : (
                                                <div className="bg-emerald-500 p-2.5 rounded-2xl text-white shadow-lg shadow-emerald-200 transition-transform group-hover:scale-105">
                                                    <UserIcon size={20} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-64 mt-4 rounded-[2rem] border-emerald-50 p-3 shadow-2xl bg-white border border-slate-100">
                                    <DropdownMenuLabel className="p-4">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Тавтай морил</p>
                                        <p className="text-sm font-black text-slate-800 truncate">{user.email}</p>
                                    </DropdownMenuLabel>
                                    
                                    <DropdownMenuSeparator className="bg-emerald-50 mx-2" />
                                    
                                    <DropdownMenuItem asChild className="rounded-2xl focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer p-3 transition-colors">
                                        <Link href="/profile" className="flex items-center w-full gap-3 text-[11px] font-black uppercase tracking-widest text-slate-700">
                                            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                <UserCircle size={18} />
                                            </div>
                                            Миний Профайл
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator className="bg-emerald-50 mx-2" />
                                    
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="rounded-2xl focus:bg-red-50 focus:text-red-600 cursor-pointer p-3 transition-colors text-red-500"
                                    >
                                        <div className="flex items-center w-full gap-3 text-[11px] font-black uppercase tracking-widest">
                                            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
                                                <LogOut size={18} />
                                            </div>
                                            Гарах
                                        </div>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            /* Нэвтрээгүй үед харагдах хэсэг */
                            <div className="flex items-center gap-6">
                                <Link 
                                    href="/auth/login" 
                                    className={`text-[10px] uppercase tracking-[0.2em] font-black transition-all hover:opacity-70 ${
                                        scrolled ? 'text-emerald-950' : 'text-white'
                                    }`}
                                >
                                    Нэвтрэх
                                </Link>

                                <Button
                                    onClick={() => router.push("/auth/register")}
                                    className={`rounded-full px-8 h-11 text-[10px] uppercase tracking-[0.2em] font-black transition-all duration-300 shadow-xl active:scale-95 ${
                                        scrolled
                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200/50'
                                            : 'bg-white text-emerald-900 hover:bg-emerald-50 shadow-white/10'
                                    }`}
                                >
                                    Бүртгүүлэх
                                </Button>
                            </div>
                        )
                    )}

                    {/* Mobile Menu Icon */}
                    <Menu className={`md:hidden w-6 h-6 cursor-pointer ${scrolled ? 'text-emerald-950' : 'text-white'}`} />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;