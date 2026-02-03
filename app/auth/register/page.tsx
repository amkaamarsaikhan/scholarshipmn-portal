"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

// 1. Баталгаажуулалтын схем (Zod)
const registerSchema = z.object({
  email: z.string().email("Хүчинтэй имэйл хаяг оруулна уу."),
  password: z.string().min(6, "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой."),
  confirmPassword: z.string().min(6, "Нууц үг давтан оруулна уу."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Нууц үг зөрүүтэй байна.",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");

  // 2. React Hook Form тохируулга
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setError("");
    try {
      await register(values.email, values.password);
      router.push("/");
    } catch (err: any) {
      setError("Бүртгэл амжилтгүй боллоо. Дахин оролдоно уу.");
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-100">
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Имэйл хаяг"
                        {...field}
                        className="rounded-2xl border-slate-100 h-12 focus-visible:ring-emerald-500"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] ml-2" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Нууц үг"
                        {...field}
                        className="rounded-2xl border-slate-100 h-12 focus-visible:ring-emerald-500"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] ml-2" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Нууц үг давтах"
                        {...field}
                        className="rounded-2xl border-slate-100 h-12 focus-visible:ring-emerald-500"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] ml-2" />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-black text-white transition-all shadow-lg shadow-emerald-200"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Түр хүлээнэ үү..." : "Бүртгэл үүсгэх"}
              </Button>
            </form>
          </Form>

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