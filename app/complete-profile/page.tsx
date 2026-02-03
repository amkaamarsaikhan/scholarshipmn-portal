"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// 1. Zod Schema: Input-аас ирэх утгуудыг баталгаажуулах
const profileSchema = z.object({
  phone: z.string().min(8, "Утасны дугаар дор хаяж 8 оронтой байх ёстой"),
  age: z.string().min(1, "Насаа оруулна уу"), // TypeScript алдаанаас сэргийлж string-ээр авна
  birthDate: z.string().min(1, "Төрсөн огноогоо сонгоно уу"),
});

export default function CompleteProfilePage() {
  const { user } = useAuth(); 
  const router = useRouter();
  const [error, setError] = useState("");

  // 2. useForm-ийг <any> төрөлтэй зарласнаар TypeScript алдаа арилна
  const form = useForm<any>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      phone: "",
      age: "",
      birthDate: "",
    },
  });

  // Хэрэглэгч нэвтрээгүй бол Login руу буцаана
  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    }
  }, [user, router]);

  // 3. Submit функц
  const onSubmit = async (values: any) => {
    if (!user) return;

    setError("");
    try {
      // Илгээхдээ age-ийг тоо руу хөрвүүлнэ
      const payload = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        phone: values.phone,
        age: parseInt(values.age),
        birthDate: values.birthDate,
        updatedAt: new Date().toISOString(),
        profileCompleted: true, // Профайл гүйцэд болсныг тэмдэглэх
      };

      await setDoc(doc(db, "users", user.uid), payload, { merge: true });

      alert("Мэдээлэл амжилттай хадгалагдлаа!");
      router.push("/"); 
    } catch (err: any) {
      console.error("Firestore Error:", err);
      setError("Мэдээлэл хадгалахад алдаа гарлаа.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 font-sans">
      <Card className="w-full max-w-md rounded-[2.5rem] shadow-xl border-none p-6">
        <CardHeader className="items-center text-center">
          <CardTitle className="text-2xl font-black text-emerald-900">Мэдээлэл гүйцээх</CardTitle>
          <CardDescription className="text-slate-500">
            Тэтгэлэгт бүртгүүлэхийн тулд нэмэлт мэдээллээ оруулна уу.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-100 text-center">
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name="phone"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="ml-2 text-slate-600 font-bold text-xs uppercase">Утасны дугаар</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="9911...." 
                        {...field} 
                        className="rounded-2xl h-12 border-slate-100 focus-visible:ring-emerald-500 shadow-sm" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel className="ml-2 text-slate-600 font-bold text-xs uppercase">Нас</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="20"
                          {...field} 
                          className="rounded-2xl h-12 border-slate-100 focus-visible:ring-emerald-500 shadow-sm" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel className="ml-2 text-slate-600 font-bold text-xs uppercase">Төрсөн огноо</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          className="rounded-2xl h-12 border-slate-100 focus-visible:ring-emerald-500 shadow-sm" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-black text-white mt-4 shadow-lg shadow-emerald-200 transition-all active:scale-95"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Түр хүлээнэ үү..." : "Хадгалах & Үргэлжлүүлэх"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}