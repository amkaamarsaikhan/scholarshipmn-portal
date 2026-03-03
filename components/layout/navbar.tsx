"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, User as UserIcon, PlusCircle, Home, LayoutDashboard, Settings, UserCircle, LogOut } from 'lucide-react';
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

    // 1. Firestore-оос хэрэглэгчийн эрхийг (role) шалгах
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

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogin = () => {
        router.push("/auth/login");
    };

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

                {/* LOGO */}
                <Link href="/" className={`flex items-center text-2xl font-serif italic tracking-tighter transition-colors duration-300 ${scrolled ? 'text-emerald-950' : 'text-white'
                    }`}>
                    SCHOLARSHIP
                    <span className="font-sans not-italic font-black ml-1 text-emerald-500 flex items-center">
                        MN <Home size={18} className="ml-1" />
                    </span>
                </Link>

                {/* ЦЭСҮҮД (Desktop - Admin бол харагдана) */}
                <div className="hidden md:flex items-center space-x-8 text-[11px] uppercase tracking-[0.2em] font-bold">
                    {user && isAdmin && (
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
                </div>

                {/* БАРУУН ТАЛ (User Profile & Login) */}
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
                                                {isAdmin ? "Админ Эрх" : "Миний цэс"}
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
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                                        </div>
                                    </div>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-64 mt-4 rounded-[2rem] border-emerald-50 p-3 shadow-2xl shadow-emerald-900/10 bg-white">
                                    <DropdownMenuLabel className="p-4">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Тавтай морил</p>
                                        <p className="text-sm font-black text-slate-800 truncate">{user.email}</p>
                                    </DropdownMenuLabel>
                                    
                                    <DropdownMenuSeparator className="bg-emerald-50 mx-2" />
                                    
                                    {/* МИНИЙ ПРОФАЙЛ */}
                                    <DropdownMenuItem asChild className="rounded-2xl focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer p-3 transition-colors">
                                        <Link href="/profile" className="flex items-center w-full gap-3 text-[11px] font-black uppercase tracking-widest">
                                            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                <UserCircle size={18} />
                                            </div>
                                            Миний Профайл
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem asChild className="rounded-2xl focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer p-3 transition-colors">
                                        <Link href="/complete-profile" className="flex items-center w-full gap-3 text-[11px] font-black uppercase tracking-widest">
                                            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                                                <Settings size={18} />
                                            </div>
                                            Тохиргоо
                                        </Link>
                                    </DropdownMenuItem>

                                    {isAdmin && (
                                        <>
                                            <DropdownMenuSeparator className="bg-emerald-50 mx-2" />
                                            <DropdownMenuItem asChild className="rounded-2xl focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer p-3 transition-colors">
                                                <Link href="/admin" className="flex items-center w-full gap-3 text-[11px] font-black uppercase tracking-widest text-emerald-600">
                                                    <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                                                        <LayoutDashboard size={18} />
                                                    </div>
                                                    Админ Панел
                                                </Link>
                                            </DropdownMenuItem>
                                        </>
                                    )}

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
                            <Button
                                onClick={handleLogin}
                                variant="outline"
                                className={`rounded-full border-2 text-[10px] uppercase tracking-[0.2em] px-8 h-12 font-black transition-all duration-300 shadow-xl active:scale-95 ${scrolled
                                        ? 'border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white shadow-emerald-200/50'
                                        : 'border-white text-white hover:bg-white hover:text-emerald-600 shadow-white/10'
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