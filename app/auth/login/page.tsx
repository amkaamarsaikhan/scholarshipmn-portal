"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase"; // db-г нэмж импортлоно
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Firestore функцүүд
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      // 1. Firebase Auth-оор нэвтрэх
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // 2. Firestore-оос хэрэглэгчийн мэдээллийг (role) татаж шалгах
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // 3. Role-оос хамаарч шилжүүлэх (Redirect)
        if (userData.role === "admin") {
          console.log("Админ нэвтэрлээ");
          router.push("/admin/add"); 
        } else {
          console.log("Хэрэглэгч нэвтэрлээ");
          router.push("/complete-profile"); // Эсвэл /profile
        }
      } else {
        // Хэрэв users коллекц дээр мэдээлэл байхгүй бол (Шинэ хэрэглэгч)
        router.push("/complete-profile");
      }

    } catch (err: any) {
      console.error("Login Error:", err);
      setError("И-мэйл эсвэл нууц үг буруу байна.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white border border-emerald-50 rounded-[2rem] shadow-xl shadow-emerald-900/5">
      <h1 className="text-3xl font-black mb-2 text-emerald-950 tracking-tighter uppercase">Нэвтрэх</h1>
      <p className="text-emerald-600 text-xs mb-8 font-bold uppercase tracking-widest">Системд нэвтрэх</p>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-xs font-bold border border-red-100 flex items-center gap-2">
           {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black text-emerald-900 ml-1">И-мэйл хаяг</label>
          <input
            {...register("email")}
            className="w-full h-14 px-5 bg-emerald-50/30 border border-emerald-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
            placeholder="admin@scholarship.mn"
          />
          {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black text-emerald-900 ml-1">Нууц үг</label>
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
      </form>
    </div>
  );
}