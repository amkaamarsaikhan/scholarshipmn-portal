"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, Mail, Bookmark, CheckCircle2, 
  Settings2, Trash2, ShieldAlert, ArrowRight,
  GraduationCap, Clock
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, savedItems, deleteAccount, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-slate-400">Ачааллаж байна...</div>;
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
        
        {/* --- 1. USER HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="w-32 h-32 bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-900/10 flex items-center justify-center border-4 border-white">
            <User size={50} className="text-emerald-600" />
          </div>
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-5xl font-black text-slate-900 tracking-tight italic">
              Сайн уу, {user.displayName || user.email?.split('@')[0]}!
            </h1>
            <p className="text-slate-400 text-lg font-medium flex items-center justify-center md:justify-start gap-2">
              <Mail size={16} /> {user.email}
            </p>
          </div>
        </div>

        {/* --- 2. STATS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/50 p-10 bg-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-100 transition-colors" />
            <CardContent className="p-0 relative z-10 space-y-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                <Bookmark size={24} />
              </div>
              <div>
                <h3 className="text-4xl font-black text-slate-900">{savedItems.length}</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Хадгалсан тэтгэлэг</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/50 p-10 bg-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-amber-100 transition-colors" />
            <CardContent className="p-0 relative z-10 space-y-6">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="text-4xl font-black text-slate-900">Идэвхтэй</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Явцын төлөв</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- 3. SAVED SCHOLARSHIPS LIST --- */}
        <section className="space-y-8">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 italic">
              <GraduationCap className="text-emerald-600" /> Миний хадгалсан тэтгэлгүүд
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {savedItems.length > 0 ? (
              savedItems.map((item) => (
                <Card key={item.id} className="rounded-[2.5rem] border-none shadow-sm bg-white hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                        <span className="text-2xl font-bold">{item.country === 'South Korea' ? '🇰🇷' : '🌎'}</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{item.title}</h4>
                        <p className="text-slate-400 font-medium">{item.country} • {item.category}</p>
                      </div>
                    </div>
                    <Link href={`/scholarships/${item.id}`}>
                      <Button variant="ghost" className="rounded-xl h-12 w-12 p-0 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                        <ArrowRight size={20} />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-medium">Одоогоор хадгалсан тэтгэлэг алга байна.</p>
              </div>
            )}
          </div>
        </section>

        {/* --- 4. DANGER ZONE (Delete Account) --- */}
        <div className="pt-20 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-8 text-red-500 font-black uppercase tracking-widest text-[10px]">
            <ShieldAlert size={16} /> Danger Zone / Аюултай бүс
          </div>

          <Card className="rounded-[3.5rem] border-2 border-red-50 bg-red-50/10 p-10 md:p-16 relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
              <div className="space-y-3 text-center md:text-left">
                <h3 className="text-2xl font-bold text-red-900">Бүртгэл устгах</h3>
                <p className="text-red-700/60 max-w-md font-medium text-lg leading-relaxed">
                  Та бүртгэлээ устгаснаар хадгалсан бүх тэтгэлэг болон өөрийн ахиц дэвшлийг <b>үүрд устгах</b> болно.
                </p>
              </div>
              <Button 
                onClick={deleteAccount}
                className="h-16 px-12 rounded-[1.5rem] bg-red-500 hover:bg-red-600 text-white font-black text-sm uppercase tracking-widest shadow-2xl shadow-red-200 transition-all active:scale-95 flex items-center gap-3"
              >
                <Trash2 size={20} /> Бүртгэл бүрэн устгах
              </Button>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}