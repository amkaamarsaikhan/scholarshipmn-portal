"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"; // Reset функц нэмэв
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
    watch, // И-мэйл хаягийг хянахын тулд
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const emailValue = watch("email");

  // --- Нууц үг сэргээх функц ---
  const handleForgotPassword = async () => {
    if (!emailValue) {
      setError("Эхлээд и-мэйл хаягаа оруулна уу.");
      return;
    }
    setError(null);
    try {
      await sendPasswordResetEmail(auth, emailValue);
      setResetMessage("Нууц үг сэргээх линк таны и-мэйл рүү илгээгдлээ.");
    } catch (err: any) {
      setError("И-мэйл илгээхэд алдаа гарлаа. Хаягаа шалгана уу.");
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
          router.push("/profile"); 
        }
      } else {
        router.push("/complete-profile");
      }
    } catch (err: any) {
      setError("И-мэйл эсвэл нууц үг буруу байна.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white border border-emerald-50 rounded-[2rem] shadow-xl shadow-emerald-900/5">
      <h1 className="text-3xl font-black mb-2 text-emerald-950 tracking-tighter uppercase">Нэвтрэх</h1>
      <p className="text-emerald-600 text-xs mb-8 font-bold uppercase tracking-widest">Системд нэвтрэх</p>
      
      {/* Амжилтын мэдэгдэл */}
      {resetMessage && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl mb-6 text-[10px] font-bold border border-emerald-100 italic">
           {resetMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-[10px] font-bold border border-red-100 flex items-center gap-2">
           {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black text-emerald-900 ml-1">И-мэйл хаяг</label>
          <input
            {...register("email")}
            className="w-full h-14 px-5 bg-emerald-50/30 border border-emerald-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm font-medium"
            placeholder="и-мэйл хаяг"
          />
          {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-2 relative">
          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase font-black text-emerald-900 ml-1">Нууц үг</label>
            {/* НУУЦ ҮГ МАРТСАН ЛИНК */}
            <button 
              type="button"
              onClick={handleForgotPassword}
              className="text-[9px] uppercase font-black text-emerald-500 hover:text-emerald-700 transition-colors mr-1 outline-none"
            >
              Нууц үг мартсан?
            </button>
          </div>
          <input
            {...register("password")}
            type="password"
            className="w-full h-14 px-5 bg-emerald-50/30 border border-emerald-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.password.message}</p>}
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full h-14 bg-emerald-950 hover:bg-emerald-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-emerald-900/20"
        >
          {isSubmitting ? "Уншиж байна..." : "Нэвтрэх"}
        </Button>

        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
          Бүртгэлгүй юу? <Link href="/auth/register" className="text-emerald-600 hover:underline ml-1">Бүртгүүлэх</Link>
        </p>
      </form>
    </div>
  );
}