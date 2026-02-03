"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase"; // Firebase auth-ыг импортлох
import { signInWithEmailAndPassword } from "firebase/auth";
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
      await signInWithEmailAndPassword(auth, data.email, data.password);
      console.log("Амжилттай нэвтэрлээ!");
      router.push("/admin/add"); // Нэвтэрсний дараа админ хуудас руу шилжинэ
    } catch (err: any) {
      console.error("Login Error:", err);
      setError("И-мэйл эсвэл нууц үг буруу байна.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6 text-emerald-900 font-serif">Нэвтрэх</h1>
      
      {error && <p className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ... өмнөх input-үүд хэвээрээ байна ... */}
        <div>
          <label className="text-sm font-medium">И-мэйл</label>
          <input
            {...register("email")}
            className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="example@mail.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Нууц үг</label>
          <input
            {...register("password")}
            type="password"
            className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isSubmitting ? "Уншиж байна..." : "Нэвтрэх"}
        </Button>
      </form>
    </div>
  );
}