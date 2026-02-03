"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Нууц үг зөрүүтэй байна.");
    }

    try {
      setLoading(true);
      await register(email, password);
      router.push("/"); // Бүртгүүлээд нүүр хуудас руу шилжинэ
    } catch (err: any) {
      setError("Бүртгэл амжилтгүй боллоо. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md rounded-[2.5rem] shadow-xl border-none p-6">
        <CardHeader className="space-y-1 items-center">
          <CardTitle className="text-3xl font-black text-slate-800">Бүртгүүлэх</CardTitle>
          <p className="text-slate-400 text-sm">ProjectA+ платформын гишүүн болох</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-100">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Имэйл хаяг"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-2xl border-slate-100 h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Нууц үг"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-2xl border-slate-100 h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Нууц үг давтах"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-2xl border-slate-100 h-12"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-black text-white transition-all shadow-lg shadow-emerald-200"
              disabled={loading}
            >
              {loading ? "Түр хүлээнэ үү..." : "Бүртгэл үүсгэх"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-slate-400">Аль хэдийн бүртгэлтэй юу? </span>
            <Link href="/auth/login" className="text-emerald-600 font-bold hover:underline">
              Нэвтрэх
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}