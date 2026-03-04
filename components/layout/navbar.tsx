"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
    Menu, X, User as UserIcon, PlusCircle, Home, 
    LayoutDashboard, Settings, UserCircle, LogOut, Bookmark, 
    ChevronRight, LogIn, UserPlus 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const { user, loading } = useAuth();
    const router = useRouter();

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

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setMobileMenuOpen(false);
            router.push("/");
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    // Цэсний холбоос дээр дарахад хаах функц
    const closeMenu = () => setMobileMenuOpen(false);

    return (
        <>
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

                    {/* --- DESKTOP NAV --- */}
                    <div className="hidden md:flex items-center space-x-8 text-[11px] uppercase tracking-[0.2em] font-bold">
                        {user && (
                            <>
                                <Link href="/profile" className={`flex items-center gap-1.5 transition-colors ${scrolled ? 'text-emerald-900 hover:text-emerald-500' : 'text-emerald-50 hover:text-white'}`}>
                                    <Bookmark size={14} /> Миний Тэтгэлэг
                                </Link>
                                {isAdmin && (
                                    <>
                                        <Link href="/admin/add" className={`flex items-center gap-1.5 transition-colors ${scrolled ? 'text-emerald-900 hover:text-emerald-500' : 'text-emerald-50 hover:text-white'}`}>
                                            <PlusCircle size={14} /> Тэтгэлэг нэмэх
                                        </Link>
                                        <Link href="/admin" className={`flex items-center gap-1.5 transition-colors ${scrolled ? 'text-emerald-900 hover:text-emerald-500' : 'text-emerald-50 hover:text-white'}`}>
                                            <LayoutDashboard size={14} /> Админ Хяналт
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    {/* --- RIGHT SIDE (Desktop Dropdown / Login) --- */}
                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center">
                            {!loading && (
                                user ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="focus:outline-none">
                                            <div className="flex items-center gap-3 group">
                                                <div className="flex flex-col items-end leading-none">
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors ${scrolled ? 'text-emerald-950' : 'text-white'}`}>
                                                        {user.displayName?.split(' ')[0] || "User"}
                                                    </span>
                                                    <span className="text-[9px] text-emerald-500 font-black uppercase tracking-tighter">
                                                        {isAdmin ? "Админ" : "Хэрэглэгч"}
                                                    </span>
                                                </div>
                                                <div className="w-10 h-10 rounded-2xl border-2 border-emerald-500 overflow-hidden shadow-lg shadow-emerald-500/10 transition-transform group-hover:scale-105 active:scale-95">
                                                    {user.photoURL ? <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" /> : <div className="bg-emerald-500 w-full h-full flex items-center justify-center text-white"><UserIcon size={20} /></div>}
                                                </div>
                                            </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-64 mt-4 rounded-[2rem] border-emerald-50 p-3 shadow-2xl bg-white">
                                            <DropdownMenuLabel className="p-4 text-xs font-black text-slate-800 truncate">{user.email}</DropdownMenuLabel>
                                            <DropdownMenuSeparator className="bg-emerald-50" />
                                            <DropdownMenuItem asChild className="rounded-2xl p-3 focus:bg-emerald-50"><Link href="/profile" className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-700"><UserCircle size={18} className="text-emerald-600" /> Миний Профайл</Link></DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-emerald-50" />
                                            <DropdownMenuItem onClick={handleLogout} className="rounded-2xl p-3 focus:bg-red-50 text-red-500 font-black text-[11px] uppercase tracking-widest flex items-center gap-3"><LogOut size={18} /> Гарах</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <div className="flex items-center gap-6">
                                        <Link href="/auth/login" className={`text-[10px] uppercase tracking-widest font-black ${scrolled ? 'text-emerald-950' : 'text-white'}`}>Нэвтрэх</Link>
                                        <Button onClick={() => router.push("/auth/register")} className={`rounded-full px-8 h-11 text-[10px] uppercase tracking-widest font-black transition-all ${scrolled ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-white text-emerald-950'}`}>Бүртгүүлэх</Button>
                                    </div>
                                )
                            )}
                        </div>

                        {/* MOBILE MENU TOGGLE */}
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                            className={`md:hidden p-2 rounded-xl transition-colors ${scrolled ? 'bg-emerald-50 text-emerald-950' : 'bg-white/10 text-white'}`}
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- MOBILE OVERLAY MENU --- */}
            <div className={`fixed inset-0 z-[60] md:hidden transition-all duration-500 ${mobileMenuOpen ? 'visible' : 'invisible'}`}>
                {/* Backdrop */}
                <div 
                    className={`absolute inset-0 bg-[#022c22]/60 backdrop-blur-md transition-opacity duration-500 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
                    onClick={closeMenu}
                />
                
                {/* Menu Content */}
                <div className={`absolute top-0 right-0 w-[85%] h-full bg-white shadow-2xl transition-transform duration-500 ease-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col h-full p-8">
                        {/* Mobile Header */}
                        <div className="flex justify-between items-center mb-12">
                            <span className="text-emerald-900 font-black tracking-tighter text-xl italic">SCHOLARSHIP MN</span>
                            <button onClick={closeMenu} className="p-2 bg-emerald-50 rounded-full text-emerald-900"><X size={20} /></button>
                        </div>

                        {/* User Profile Info (If logged in) */}
                        {user && (
                            <div className="mb-10 p-4 bg-emerald-50 rounded-3xl flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-500">
                                    {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : <div className="bg-emerald-500 w-full h-full flex items-center justify-center text-white"><UserIcon size={20} /></div>}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-black text-emerald-950 text-xs uppercase truncate">{user.displayName || "Хэрэглэгч"}</span>
                                    <span className="text-[10px] text-emerald-600 font-bold">{isAdmin ? "Админ хандалт" : user.email}</span>
                                </div>
                            </div>
                        )}

                        {/* Navigation Links */}
                        <div className="space-y-4 flex-1">
                            <Link href="/" onClick={closeMenu} className="flex items-center justify-between p-4 rounded-2xl hover:bg-emerald-50 transition-colors group">
                                <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Нүүр хуудас</span>
                                <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500" />
                            </Link>

                            {user ? (
                                <>
                                    <Link href="/profile" onClick={closeMenu} className="flex items-center justify-between p-4 rounded-2xl hover:bg-emerald-50 transition-colors group">
                                        <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Миний Тэтгэлэг</span>
                                        <Bookmark size={18} className="text-emerald-500" />
                                    </Link>
                                    {isAdmin && (
                                        <Link href="/admin" onClick={closeMenu} className="flex items-center justify-between p-4 rounded-2xl bg-emerald-950 text-white transition-colors group">
                                            <span className="text-sm font-black uppercase tracking-widest">Админ Хяналт</span>
                                            <LayoutDashboard size={18} className="text-emerald-400" />
                                        </Link>
                                    )}
                                </>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 pt-4">
                                    <Button onClick={() => { router.push("/auth/login"); closeMenu(); }} variant="outline" className="h-14 rounded-2xl font-black uppercase tracking-widest border-2 border-emerald-100 text-emerald-900 gap-2">
                                        <LogIn size={18} /> Нэвтрэх
                                    </Button>
                                    <Button onClick={() => { router.push("/auth/register"); closeMenu(); }} className="h-14 rounded-2xl font-black uppercase tracking-widest bg-emerald-600 text-white gap-2 shadow-lg shadow-emerald-100">
                                        <UserPlus size={18} /> Бүртгүүлэх
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Footer in Mobile Menu */}
                        {user && (
                            <button onClick={handleLogout} className="mt-auto flex items-center justify-center gap-3 p-5 rounded-2xl bg-red-50 text-red-600 font-black uppercase tracking-widest text-xs">
                                <LogOut size={18} /> Гарах
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;