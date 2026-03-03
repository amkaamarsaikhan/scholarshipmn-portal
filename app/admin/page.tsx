"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { sendTelegramNotification } from "@/lib/utils"; 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, LayoutDashboard, User, CheckCircle, Clock, Globe, GraduationCap, Sparkles } from "lucide-react";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newScholarship, setNewScholarship] = useState({ name: '', country: '', level: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddAndNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScholarship.name || !newScholarship.country) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'scholarships'), {
        title: newScholarship.name, country: newScholarship.country,
        category: newScholarship.level, createdAt: serverTimestamp()
      });
      await sendTelegramNotification(`📢 ШИНЭ ТЭТГЭЛЭГ: ${newScholarship.name}`);
      setNewScholarship({ name: '', country: '', level: '' });
    } finally { setSending(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-emerald-900">Ачааллаж байна...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto space-y-20"> {/* Секц хоорондын зайг 20 болгож тэлэв */}
        
        {/* --- 1. HEADER SECTION --- */}
        <div className="flex flex-col items-center text-center space-y-4 mb-10">
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-6 py-2 rounded-full font-bold tracking-widest uppercase text-[10px]">
            <Sparkles size={12} className="mr-2" /> Admin Control Center
          </Badge>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Хяналтын самбар</h1>
          <p className="text-slate-500 max-w-lg text-lg font-medium">Тэтгэлэг зарлах болон хэрэглэгчдийн явцыг нэг дороос хянах.</p>
        </div>

        {/* --- 2. ANNOUNCEMENT FORM (Илүү цэлгэр) --- */}
        <section className="bg-white rounded-[3.5rem] p-12 md:p-16 border border-emerald-100 shadow-2xl shadow-emerald-900/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl -mr-48 -mt-48 opacity-60" />
          
          <div className="relative z-10 space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <Send size={24} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Шинэ тэтгэлэг нийтлэх</h2>
            </div>

            <form onSubmit={handleAddAndNotify} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-3 lg:col-span-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Тэтгэлгийн нэр</label>
                <Input 
                  className="h-16 rounded-[1.5rem] bg-slate-50 border-none text-lg px-8 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  placeholder="Жишээ: Global Korea Scholarship 2026"
                  value={newScholarship.name}
                  onChange={(e) => setNewScholarship({...newScholarship, name: e.target.value})}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Улс</label>
                <Input 
                  className="h-16 rounded-[1.5rem] bg-slate-50 border-none text-lg px-8 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  placeholder="Жишээ: South Korea"
                  value={newScholarship.country}
                  onChange={(e) => setNewScholarship({...newScholarship, country: e.target.value})}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Боловсролын түвшин</label>
                <select 
                  className="w-full h-16 rounded-[1.5rem] bg-slate-50 border-none text-lg px-8 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500/20"
                  value={newScholarship.level}
                  onChange={(e) => setNewScholarship({...newScholarship, level: e.target.value})}
                >
                  <option value="">Түвшин сонгох</option>
                  <option value="Бакалавр">Бакалавр</option>
                  <option value="Магистр">Магистр</option>
                  <option value="Доктор">Доктор</option>
                </select>
              </div>

              <div className="lg:col-span-2 flex items-end">
                <Button 
                  disabled={sending}
                  className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-200 active:scale-[0.98]"
                >
                  {sending ? "Түр хүлээнэ үү..." : "Тэтгэлгийг зарлах ба Мэдэгдэх"}
                </Button>
              </div>
            </form>
          </div>
        </section>

        {/* --- 3. USER TABLE (Илүү том зайн авалттай) --- */}
        <Card className="rounded-[3.5rem] border border-emerald-50 shadow-2xl shadow-emerald-900/5 bg-white overflow-hidden">
          <CardHeader className="p-12 md:p-16 border-b border-slate-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <CardTitle className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                  <LayoutDashboard size={32} className="text-emerald-600" /> Хэрэглэгчид
                </CardTitle>
                <CardDescription className="text-slate-400 text-lg font-medium">
                  Нийт <span className="text-emerald-600 font-bold">{users.length}</span> суралцагч системд бүртгэлтэй байна.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50 h-20">
                  <TableRow className="border-none px-12">
                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest px-16">Суралцагч</TableHead>
                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Идэвхтэй тэтгэлэг</TableHead>
                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest text-right px-16">Явцын төлөв</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.uid} className="h-28 border-slate-50 hover:bg-emerald-50/30 transition-all duration-300">
                      <TableCell className="px-16">
                        <div className="flex items-center gap-6">
                          <Avatar className="h-16 w-16 border-4 border-white shadow-lg group-hover:scale-110 transition-transform">
                            <AvatarImage src={user.photoURL} />
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 font-black text-xl">
                              {user.displayName?.charAt(0) || <User />}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col gap-1">
                            <span className="text-slate-900 font-bold text-xl leading-none">{user.displayName || "Нэргүй"}</span>
                            <span className="text-slate-400 font-medium text-sm">{user.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {user.lastUpdatedScholarship ? (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                              <GraduationCap size={18} className="text-emerald-600" />
                            </div>
                            <span className="text-lg font-bold text-slate-700">{user.lastUpdatedScholarship}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 italic font-medium">Сонгоогүй байна</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right px-16">
                        {user.status === "completed" ? (
                          <Badge className="bg-emerald-500 text-white rounded-2xl px-6 py-3 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                            <CheckCircle size={14} className="mr-2" /> Дууссан
                          </Badge>
                        ) : (
                          <Badge className={`rounded-2xl px-6 py-3 font-black text-[10px] uppercase tracking-widest shadow-sm ${
                            user.status === "in-progress" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-400"
                          }`}>
                            <Clock size={14} className="mr-2" /> {user.status === "in-progress" ? "Явцтай" : "Эхлээгүй"}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}