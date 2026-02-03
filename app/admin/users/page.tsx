"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
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

// Хэрэглэгчийн төрөл (Type) тодорхойлох
interface UserData {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phone?: string;
  age?: number;
  profileCompleted?: boolean;
  savedScholarships?: string[]; // Хадгалсан тэтгэлгийн ID-нууд
  updatedAt?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // 'users' коллекцоос бүх хэрэглэгчийг шинэчлэгдсэн хугацаагаар нь эрэмбэлж татах
        const q = query(collection(db, "users"), orderBy("updatedAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        const usersList: UserData[] = [];
        querySnapshot.forEach((doc) => {
          usersList.push({ uid: doc.id, ...doc.data() } as UserData);
        });

        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-emerald-600 font-bold">
        Хэрэглэгчдийн жагсаалтыг уншиж байна...
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <Card className="rounded-[2rem] shadow-sm border-none overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100 p-8">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                Хэрэглэгчдийн удирдлага
              </CardTitle>
              <CardDescription>
                Нийт {users.length} хэрэглэгч бүртгэлтэй байна.
              </CardDescription>
            </div>
            <Badge className="bg-emerald-500 hover:bg-emerald-600 px-4 py-1 rounded-full">
              Admin Mode
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[250px] font-bold">Хэрэглэгч</TableHead>
                <TableHead className="font-bold">Холбоо барих</TableHead>
                <TableHead className="font-bold text-center">Нас</TableHead>
                <TableHead className="font-bold text-center">Хадгалсан</TableHead>
                <TableHead className="font-bold text-right">Төлөв</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.uid} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-emerald-100">
                        <AvatarImage src={user.photoURL} alt={user.displayName} />
                        <AvatarFallback className="bg-emerald-50 text-emerald-700 font-bold">
                          {user.displayName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-slate-800 font-bold text-sm">{user.displayName || "Нэргүй"}</span>
                        <span className="text-slate-400 text-xs">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-600 text-sm font-medium">
                      {user.phone || "Бүртгүүлээгүй"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-bold text-slate-700">
                    {user.age || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="rounded-lg border-emerald-200 text-emerald-700 bg-emerald-50/50">
                      {user.savedScholarships?.length || 0} тэтгэлэг
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {user.profileCompleted ? (
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none rounded-full text-[10px]">
                        Бүрэн
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none rounded-full text-[10px]">
                        Дутуу
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