"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setRole(null);
        setRoleLoading(false);
        return;
      }
      setRoleLoading(true);
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        setRole(snap.exists() ? snap.data().role || "user" : "user");
      } catch {
        setRole(null);
      } finally {
        setRoleLoading(false);
      }
    };
    void load();
  }, [user]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-emerald-800 font-bold">
        Ачааллаж байна...
      </div>
    );
  }

  if (!user || role !== "admin") {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-black text-slate-900">Хандах эрхгүй</h1>
        <p className="text-slate-500 text-sm">Энэ хуудас зөвхөн админд зориулагдсан.</p>
        <Link href={user ? "/" : "/auth/login"}>
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl px-8 h-12 font-bold">
            {user ? "Нүүр хуудас" : "Нэвтрэх"}
          </Button>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
