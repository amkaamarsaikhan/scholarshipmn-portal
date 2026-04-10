"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  deleteDoc,
  orderBy 
} from "firebase/firestore";
import { sendTelegramNotification } from "@/lib/telegram"; 
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
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, User, CheckCircle, Clock, 
  GraduationCap, Sparkles, Building2, CheckCircle2, 
  XCircle, Trash2, ExternalLink, ShieldCheck 
} from "lucide-react";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]); // Партнерүүд хадгалах
  const [loading, setLoading] = useState(true);
  
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Хэрэглэгчдийг татах
    const userQuery = query(collection(db, "users"));
    const unsubUsers = onSnapshot(userQuery, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
    });

    // Партнерүүдийг татах (Шинэ нь дээрээ)
    const partnerQuery = query(collection(db, "partners"), orderBy("createdAt", "desc"));
    const unsubPartners = onSnapshot(partnerQuery, (snapshot) => {
      setPartners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => { unsubUsers(); unsubPartners(); };
  }, []);

  // Партнер баталгаажуулах функц
  const togglePartnerApprove = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "partners", id), {
        approved: !currentStatus
      });
    } catch (error) {
      alert("Алдаа гарлаа.");
    }
  };

  // Партнер устгах функц
  const deletePartner = async (id: string) => {
    if (confirm("Энэ партнерыг устгах уу?")) {
      await deleteDoc(doc(db, "partners", id));
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-emerald-900 italic">Ачааллаж байна...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-24">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col items-center text-center space-y-4">
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-6 py-2 rounded-full font-black tracking-widest uppercase text-[10px] italic">
            <ShieldCheck size={12} className="mr-2" /> System Administrator
          </Badge>
          <h1 className="text-6xl font-black text-slate-900 tracking-tight italic uppercase">Control Panel</h1>
        </div>

        {/* --- PARTNERS SECTION (ШИНЭ) --- */}
        <div className="space-y-8">
          <div className="flex items-end gap-4 ml-6">
            <Building2 size={40} className="text-emerald-600 mb-2" />
            <div>
              <h2 className="text-4xl font-black text-slate-900 italic uppercase">Партнерууд</h2>
              <p className="text-slate-400 font-bold tracking-tight">Хүсэлт илгээсэн байгууллагуудыг хянах</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {partners.map((partner) => (
              <Card key={partner.id} className={cn(
                "rounded-[2.5rem] border-none shadow-xl transition-all overflow-hidden",
                partner.approved ? "bg-white" : "bg-emerald-50/50 border-2 border-dashed border-emerald-200"
              )}>
                <CardContent className="p-8">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <img src={partner.logo} className="w-20 h-20 rounded-3xl object-cover shadow-lg border-4 border-white" />
                    <div className="flex-1 space-y-3 text-center sm:text-left">
                      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">{partner.name}</h3>
                        {partner.approved ? (
                          <Badge className="bg-emerald-500 text-white border-none text-[9px] font-black italic">ACTIVE</Badge>
                        ) : (
                          <Badge className="bg-amber-500 text-white border-none text-[9px] font-black italic animate-pulse">PENDING</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
                        {partner.targetCountries?.map((tag: string) => (
                          <span key={tag} className="text-[9px] px-2 py-1 bg-white border border-slate-100 text-slate-500 rounded-lg font-black uppercase italic tracking-tighter">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-slate-400 text-xs font-bold italic line-clamp-1">{partner.email} • {partner.phone}</p>
                    </div>

                    <div className="flex sm:flex-col gap-2">
                      <Button 
                        onClick={() => togglePartnerApprove(partner.id, partner.approved)}
                        className={cn(
                          "h-14 px-6 rounded-2xl font-black italic uppercase tracking-tighter shadow-lg transition-all",
                          partner.approved ? "bg-slate-900 hover:bg-slate-800 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        )}
                      >
                        {partner.approved ? <><XCircle size={18} className="mr-2" /> Цуцлах</> : <><CheckCircle2 size={18} className="mr-2" /> Зөвшөөрөх</>}
                      </Button>
                      <div className="flex gap-2">
                        <a href={partner.link} target="_blank" className="flex-1">
                          <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200"><ExternalLink size={18} /></Button>
                        </a>
                        <Button onClick={() => deletePartner(partner.id)} variant="ghost" className="h-12 w-12 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={18} /></Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* --- USERS SECTION --- */}
        <div className="space-y-8">
          <div className="flex items-end gap-4 ml-6">
            <LayoutDashboard size={40} className="text-emerald-600 mb-2" />
            <div>
              <h2 className="text-4xl font-black text-slate-900 italic uppercase">Суралцагчид</h2>
              <p className="text-slate-400 font-bold tracking-tight">Нийт {users.length} бүртгэлтэй хэрэглэгч</p>
            </div>
          </div>

          <Card className="rounded-[3.5rem] border-none shadow-2xl bg-white overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50 h-20">
                  <TableRow className="border-none">
                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest px-12 italic">Суралцагч</TableHead>
                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest italic">Идэвхтэй тэтгэлэг</TableHead>
                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest text-right px-12 italic">Төлөв</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.uid} className="h-28 border-slate-50 hover:bg-emerald-50/30 transition-all duration-300">
                      <TableCell className="px-12">
                        <div className="flex items-center gap-6">
                          <Avatar className="h-14 w-14 border-4 border-slate-50 shadow-md">
                            <AvatarImage src={user.photoURL} />
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 font-black italic">{user.displayName?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-slate-900 font-black text-lg italic uppercase tracking-tighter">{user.displayName || "Unknown"}</span>
                            <span className="text-slate-400 font-bold text-xs">{user.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><GraduationCap size={16} className="text-emerald-600" /></div>
                          <span className="text-base font-black text-slate-700 uppercase italic tracking-tighter">{user.lastUpdatedScholarship || "None"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-12">
                        <Badge className={cn(
                          "rounded-xl px-4 py-2 font-black text-[9px] uppercase tracking-widest italic shadow-sm",
                          user.status === "completed" ? "bg-emerald-500 text-white" : 
                          user.status === "in-progress" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-400"
                        )}>
                          {user.status === "completed" ? "Success" : user.status === "in-progress" ? "In Progress" : "No Action"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}