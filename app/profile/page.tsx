"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  User, Mail, Bookmark, Trash2, ShieldAlert, ArrowRight,
  GraduationCap, Clock
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, savedItems, deleteAccount, toggleSave, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase text-slate-400">Ачааллаж байна...</div>;

  if (!user) return (
    <div className="h-screen flex flex-col items-center justify-center space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Нэвтрэх шаардлагатай</h1>
      <Link href="/auth/login">
        <Button className="bg-emerald-600 rounded-2xl px-8 h-14 font-bold">Нэвтрэх</Button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-20 px-6 md:px-12">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="w-32 h-32 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center border-4 border-white overflow-hidden">
            {user.photoURL ? (
              <img src={user.photoURL} className="w-full h-full object-cover" />
            ) : (
              <User size={50} className="text-emerald-600" />
            )}
          </div>
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-5xl font-black text-slate-900 italic tracking-tight">
              Сайн уу, {user.displayName || "Хэрэглэгч"}!
            </h1>
            <p className="text-slate-400 text-lg font-medium flex items-center justify-center md:justify-start gap-2">
              <Mail size={16} /> {user.email}
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="rounded-[3rem] border-none shadow-xl p-10 bg-white">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                <Bookmark size={24} />
              </div>
              <div>
                <h3 className="text-4xl font-black text-slate-900">{savedItems.length}</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Хадгалсан</p>
              </div>
            </div>
          </Card>
          <Card className="rounded-[3rem] border-none shadow-xl p-10 bg-white">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="text-4xl font-black text-slate-900">Идэвхтэй</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Процесс</p>
              </div>
            </div>
          </Card>
        </div>

        {/* LIST */}
        <section className="space-y-8">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 italic px-4">
            <GraduationCap className="text-emerald-600" /> Миний хадгалсан тэтгэлгүүд
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {savedItems.length > 0 ? (
              savedItems.map((item) => (
                <Card key={item.id} className="rounded-[2.5rem] border-none shadow-sm bg-white hover:shadow-md transition-all group">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-xl">
                        {item.country === 'South Korea' ? '🇰🇷' : '🌎'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{item.title}</h4>
                        <p className="text-slate-400 text-sm">{item.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={() => toggleSave(item)} 
                        variant="ghost" 
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 size={20} />
                      </Button>
                      <Link href={`/scholarships/${item.id}`}>
                        <Button className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl">
                          <ArrowRight size={20} />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-100 text-slate-400">
                Одоогоор хадгалсан тэтгэлэг алга.
              </div>
            )}
          </div>
        </section>

        {/* DANGER ZONE */}
        <div className="pt-20 border-t border-slate-200">
          <Card className="rounded-[3.5rem] border-2 border-red-50 bg-red-50/10 p-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-red-900 flex items-center justify-center md:justify-start gap-2">
                <ShieldAlert size={20} /> Бүртгэл устгах
              </h3>
              <p className="text-red-700/60 text-sm">Бүх дата үүрд устахыг анхаарна уу.</p>
            </div>
            <Button 
              onClick={deleteAccount}
              className="bg-red-500 hover:bg-red-600 text-white rounded-2xl px-10 h-14 font-bold"
            >
              Бүрэн устгах
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}