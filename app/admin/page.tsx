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
import { Send, LayoutDashboard, User, CheckCircle, Clock } from "lucide-react";

interface UserData {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phone?: string;
  status?: "completed" | "in-progress" | "not-started";
  lastUpdatedScholarship?: string;
  savedScholarships?: string[];
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newScholarship, setNewScholarship] = useState({ name: '', country: '', level: '' });
  const [sending, setSending] = useState(false);

  // 1. Хэрэглэгчдийг Real-time (onSnapshot) татах
  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as UserData[];
      setUsers(usersList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Шинэ тэтгэлэг нэмэх ба Telegram мэдэгдэл илгээх
  const handleAddAndNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScholarship.name || !newScholarship.country) return alert("Мэдээллээ бүрэн бөглөнө үү!");

    setSending(true);
    try {
      // Firestore-д нэмэх
      await addDoc(collection(db, 'scholarships'), {
        title: newScholarship.name,
        country: newScholarship.country,
        category: newScholarship.level,
        createdAt: serverTimestamp()
      });

      // Telegram мэдэгдэл
      const message = `📢 <b>ШИНЭ ТЭТГЭЛЭГ ЗАРЛАГДЛАА!</b>\n\n🎓 <b>Нэр:</b> ${newScholarship.name}\n📍 <b>Улс:</b> ${newScholarship.country}\n🌐 <b>Түвшин:</b> ${newScholarship.level}`;
      
      if (typeof sendTelegramNotification === 'function') {
        await sendTelegramNotification(message);
      }

      alert("Тэтгэлэг нэмэгдэж, Телеграм руу илгээгдлээ!");
      setNewScholarship({ name: '', country: '', level: '' });
    } catch (error) {
      console.error("Error:", error);
      alert("Алдаа гарлаа!");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-slate-900 font-bold tracking-tighter uppercase">Ачааллаж байна...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen space-y-8">
      
      {/* --- ШИНЭ ТЭТГЭЛЭГ НЭМЭХ ХЭСЭГ (Хуучин логик + Шинэ дизайн) --- */}
      <section className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200">
        <h2 className="text-xl font-black mb-6 flex items-center gap-3 uppercase tracking-tight">
          <Send size={20} className="text-emerald-400" /> Шинэ тэтгэлэг зарлах
        </h2>
        <form onSubmit={handleAddAndNotify} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input 
            className="bg-slate-800 border-none rounded-2xl h-14 text-white placeholder:text-slate-500"
            placeholder="Тэтгэлэгийн нэр..."
            value={newScholarship.name}
            onChange={(e) => setNewScholarship({...newScholarship, name: e.target.value})}
          />
          <Input 
            className="bg-slate-800 border-none rounded-2xl h-14 text-white placeholder:text-slate-500"
            placeholder="Улс..."
            value={newScholarship.country}
            onChange={(e) => setNewScholarship({...newScholarship, country: e.target.value})}
          />
          <select 
            className="bg-slate-800 border-none rounded-2xl h-14 px-4 text-sm outline-none text-white appearance-none"
            value={newScholarship.level}
            onChange={(e) => setNewScholarship({...newScholarship, level: e.target.value})}
          >
            <option value="">Түвшин сонгох</option>
            <option value="Бакалавр">Бакалавр</option>
            <option value="Магистр">Магистр</option>
            <option value="Доктор">Доктор</option>
          </select>
          <Button 
            disabled={sending}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 h-14 rounded-2xl font-black uppercase tracking-widest transition-all"
          >
            {sending ? "..." : "Зарлах ба Илгээх"}
          </Button>
        </form>
      </section>

      {/* --- ХЭРЭГЛЭГЧДИЙН ЖАГСААЛТ --- */}
      <Card className="rounded-[2.5rem] shadow-sm border-none overflow-hidden bg-white">
        <CardHeader className="p-8 border-b border-slate-50">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
                <LayoutDashboard size={24} /> Хэрэглэгчдийн явц
              </CardTitle>
              <CardDescription className="font-medium text-slate-400 mt-1">
                Нийт {users.length} хэрэглэгч бодит цагт хянагдаж байна.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-none">
                <TableHead className="font-bold px-8">Хэрэглэгч</TableHead>
                <TableHead className="font-bold">Явц байгаа тэтгэлэг</TableHead>
                <TableHead className="font-bold text-right px-8">Төлөв</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.uid} className="hover:bg-slate-50/50 border-slate-50 transition-colors">
                  <TableCell className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-slate-100">
                        <AvatarImage src={user.photoURL} />
                        <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                          {user.displayName?.charAt(0) || <User size={18}/>}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-slate-900 font-bold">{user.displayName || "Нэргүй"}</span>
                        <span className="text-slate-400 text-xs font-medium">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.lastUpdatedScholarship ? (
                      <Badge variant="outline" className="rounded-xl border-blue-100 text-blue-600 bg-blue-50/50 py-1 px-3">
                        {user.lastUpdatedScholarship}
                      </Badge>
                    ) : (
                      <span className="text-slate-300 text-xs italic font-medium">Сонгоогүй</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right px-8">
                    {user.status === "completed" ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none rounded-full px-4 py-1 font-bold text-[10px] uppercase">
                        <CheckCircle size={12} className="mr-1 inline" /> Дууссан
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none rounded-full px-4 py-1 font-bold text-[10px] uppercase">
                        <Clock size={12} className="mr-1 inline" /> {user.status === "in-progress" ? "Явцтай" : "Эхлээгүй"}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}