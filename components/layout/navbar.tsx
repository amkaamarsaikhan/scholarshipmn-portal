"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  User as UserIcon,
  PlusCircle,
  Home,
  LayoutDashboard,
  CalendarClock,
  UserCircle,
  LogOut,
  Bookmark,
  ChevronRight,
  LogIn,
  UserPlus,
} from "lucide-react";
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

const NAV_LINKS = [
  { href: "/", label: "Тэтгэлэг" },
  { href: "/courses", label: "Сургалт" },
  { href: "/forum", label: "Форум" },
  { href: "/about", label: "Бидний тухай" },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isAdmin = role === "admin";
  const closeMenu = () => setMobileMenuOpen(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      closeMenu();
      router.push("/");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const isActive = (href: string) =>
    href === "/" || href === "/admin" ? pathname === href : pathname.startsWith(href);

  const linkClass = (href: string) =>
    `transition-colors ${
      isActive(href)
        ? "text-emerald-600"
        : "text-emerald-900 hover:text-emerald-500"
    }`;

  return (
    <>
      <nav className="w-full py-3">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center gap-4">
          <Link
            href="/"
            className="flex items-center text-2xl font-serif italic tracking-tighter text-emerald-950 shrink-0"
          >
            SCHOLARSHIP
            <span className="font-sans not-italic font-black ml-1 text-emerald-500 flex items-center">
              MN <Home size={18} className="ml-1" />
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-7 text-[11px] uppercase tracking-[0.2em] font-bold">
            {NAV_LINKS.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                {item.label}
              </Link>
            ))}
            {user && (
              <Link href="/profile" className={`flex items-center gap-1.5 ${linkClass("/profile")}`}>
                <Bookmark size={14} /> Миний тэтгэлэг
              </Link>
            )}
            {isAdmin && (
              <>
                <Link href="/admin/scholarships" className={`flex items-center gap-1.5 ${linkClass("/admin/scholarships")}`}>
                  <CalendarClock size={14} /> Огноо засах
                </Link>
                <Link href="/admin/add" className={`flex items-center gap-1.5 ${linkClass("/admin/add")}`}>
                  <PlusCircle size={14} /> Тэтгэлэг нэмэх
                </Link>
                <Link href="/admin" className={`flex items-center gap-1.5 ${linkClass("/admin")}`}>
                  <LayoutDashboard size={14} /> Админ
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center">
              {!loading &&
                (user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none" aria-label="Хэрэглэгчийн цэс">
                      <div className="flex items-center gap-3 group">
                        <div className="flex flex-col items-end leading-none">
                          <span className="text-[10px] font-bold uppercase tracking-widest mb-1 text-emerald-950">
                            {user.displayName?.split(" ")[0] || "Хэрэглэгч"}
                          </span>
                          <span className="text-[9px] text-emerald-500 font-black uppercase tracking-tighter">
                            {isAdmin ? "Админ" : "Хэрэглэгч"}
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-2xl border-2 border-emerald-500 overflow-hidden">
                          {user.photoURL ? (
                            <Image
                              src={user.photoURL}
                              alt="Профайл"
                              width={40}
                              height={40}
                              sizes="40px"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="bg-emerald-500 w-full h-full flex items-center justify-center text-white">
                              <UserIcon size={20} />
                            </div>
                          )}
                        </div>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-64 mt-4 rounded-[2rem] border-emerald-50 p-3 shadow-2xl bg-white"
                    >
                      <DropdownMenuLabel className="p-4 text-xs font-black text-slate-800 truncate">
                        {user.email}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-emerald-50" />
                      <DropdownMenuItem asChild className="rounded-2xl p-3 focus:bg-emerald-50">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-700"
                        >
                          <UserCircle size={18} className="text-emerald-600" /> Миний профайл
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-emerald-50" />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="rounded-2xl p-3 focus:bg-red-50 text-red-500 font-black text-[11px] uppercase tracking-widest flex items-center gap-3"
                      >
                        <LogOut size={18} /> Гарах
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-6">
                    <Link
                      href="/auth/login"
                      className="text-[10px] uppercase tracking-widest font-black text-emerald-950"
                    >
                      Нэвтрэх
                    </Link>
                    <Button
                      onClick={() => router.push("/auth/register")}
                      className="rounded-full px-8 h-11 text-[10px] uppercase tracking-widest font-black bg-emerald-600 text-white hover:bg-emerald-500"
                    >
                      Бүртгүүлэх
                    </Button>
                  </div>
                ))}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-emerald-50 text-emerald-950"
              aria-label={mobileMenuOpen ? "Цэс хаах" : "Цэс нээх"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-all duration-500 ${
          mobileMenuOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`absolute inset-0 bg-[#022c22]/60 backdrop-blur-md transition-opacity duration-500 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMenu}
        />

        <div
          className={`absolute top-0 right-0 w-[85%] max-w-sm h-full bg-white shadow-2xl transition-transform duration-500 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-10">
              <span className="text-emerald-900 font-black tracking-tighter text-xl italic">
                SCHOLARSHIP MN
              </span>
              <button
                type="button"
                onClick={closeMenu}
                className="p-2 bg-emerald-50 rounded-full text-emerald-900"
                aria-label="Цэс хаах"
              >
                <X size={20} />
              </button>
            </div>

            {user && (
              <div className="mb-8 p-4 bg-emerald-50 rounded-3xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-500">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt="Профайл"
                      width={48}
                      height={48}
                      sizes="48px"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="bg-emerald-500 w-full h-full flex items-center justify-center text-white">
                      <UserIcon size={20} />
                    </div>
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-black text-emerald-950 text-xs uppercase truncate">
                    {user.displayName || "Хэрэглэгч"}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    {isAdmin ? "Админ хандалт" : user.email}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2 flex-1">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-colors group ${
                    isActive(item.href) ? "bg-emerald-50" : "hover:bg-emerald-50"
                  }`}
                >
                  <span className="text-sm font-black text-slate-700 uppercase tracking-widest">
                    {item.label}
                  </span>
                  <ChevronRight
                    size={18}
                    className="text-slate-300 group-hover:text-emerald-500"
                  />
                </Link>
              ))}

              {user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-emerald-50 transition-colors"
                  >
                    <span className="text-sm font-black text-slate-700 uppercase tracking-widest">
                      Миний тэтгэлэг
                    </span>
                    <Bookmark size={18} className="text-emerald-500" />
                  </Link>
                  {isAdmin && (
                    <>
                      <Link
                        href="/admin/scholarships"
                        onClick={closeMenu}
                        className="flex items-center justify-between p-4 rounded-2xl hover:bg-emerald-50 transition-colors"
                      >
                        <span className="text-sm font-black text-slate-700 uppercase tracking-widest">
                          Огноо засах
                        </span>
                        <CalendarClock size={18} className="text-emerald-500" />
                      </Link>
                      <Link
                        href="/admin/add"
                        onClick={closeMenu}
                        className="flex items-center justify-between p-4 rounded-2xl hover:bg-emerald-50 transition-colors"
                      >
                        <span className="text-sm font-black text-slate-700 uppercase tracking-widest">
                          Тэтгэлэг нэмэх
                        </span>
                        <PlusCircle size={18} className="text-emerald-500" />
                      </Link>
                      <Link
                        href="/admin"
                        onClick={closeMenu}
                        className="flex items-center justify-between p-4 rounded-2xl bg-emerald-950 text-white transition-colors"
                      >
                        <span className="text-sm font-black uppercase tracking-widest">
                          Админ хяналт
                        </span>
                        <LayoutDashboard size={18} className="text-emerald-400" />
                      </Link>
                    </>
                  )}
                </>
              ) : (
                <div className="grid grid-cols-1 gap-4 pt-4">
                  <Button
                    onClick={() => {
                      router.push("/auth/login");
                      closeMenu();
                    }}
                    variant="outline"
                    className="h-14 rounded-2xl font-black uppercase tracking-widest border-2 border-emerald-100 text-emerald-900 gap-2"
                  >
                    <LogIn size={18} /> Нэвтрэх
                  </Button>
                  <Button
                    onClick={() => {
                      router.push("/auth/register");
                      closeMenu();
                    }}
                    className="h-14 rounded-2xl font-black uppercase tracking-widest bg-emerald-600 text-white gap-2"
                  >
                    <UserPlus size={18} /> Бүртгүүлэх
                  </Button>
                </div>
              )}
            </div>

            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-auto flex items-center justify-center gap-3 p-5 rounded-2xl bg-red-50 text-red-600 font-black uppercase tracking-widest text-xs"
              >
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
