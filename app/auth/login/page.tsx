"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const emailValue = watch("email");

  const handleForgotPassword = async () => {
    if (!emailValue || emailValue.trim() === "") {
      setError("Нууц үг сэргээхийн тулд эхлээд и-мэйл хаягаа оруулна уу.");
      return;
    }
    setError(null);
    setResetMessage(null);
    try {
      await sendPasswordResetEmail(auth, emailValue);
      setResetMessage("Нууц үг сэргээх линк таны и-мэйл рүү илгээгдлээ. Спам хэсгээ шалгаарай.");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("Энэ и-мэйл хаяг бүртгэлгүй байна.");
      } else {
        setError("Алдаа гарлаа. Түр хүлээгээд дахин оролдоно уу.");
      }
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setResetMessage(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === "admin") {
          router.push("/admin/add"); 
        } else {
          router.push("/"); // Эсвэл /profile
        }
      } else {
        router.push("/complete-profile");
      }
    } catch (err: any) {
      setError("И-мэйл эсвэл нууц үг буруу байна.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white border border-emerald-50 rounded-[2.5rem] shadow-2xl shadow-emerald-900/5">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-emerald-950 tracking-tighter uppercase mb-2">Нэвтрэх</h1>
        <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-[0.2em]">Scholarship MN систем</p>
      </div>
      
      {resetMessage && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl mb-6 text-xs font-bold border border-emerald-100 leading-relaxed text-center">
           {resetMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-xs font-bold border border-red-100 flex items-center justify-center gap-2">
           ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black text-emerald-900 ml-2">И-мэйл хаяг</label>
          <input
            {...register("email")}
            autoComplete="email"
            className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-medium"
            placeholder="example@mail.com"
          />
          {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center px-2">
            <label className="text-[10px] uppercase font-black text-emerald-900">Нууц үг</label>
            <button 
              type="button"
              onClick={handleForgotPassword}
              className="text-[10px] uppercase font-bold text-emerald-500 hover:text-emerald-700 transition-colors outline-none"
            >
              Мартсан уу?
            </button>
          </div>
          <input
            {...register("password")}
            type="password"
            autoComplete="current-password"
            className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2">{errors.password.message}</p>}
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full h-14 bg-emerald-950 hover:bg-emerald-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-950/20"
        >
          {isSubmitting ? "Түр хүлээнэ үү..." : "Нэвтрэх"}
        </Button>

        <div className="pt-4 border-t border-slate-50 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Бүртгэлгүй юу? <Link href="/auth/register" className="text-emerald-600 hover:text-emerald-700 hover:underline ml-1">Шинээр бүртгүүлэх</Link>
          </p>
        </div>
      </form>
    </div>
  );
}