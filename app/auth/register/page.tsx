"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const registerSchema = z.object({
  displayName: z.string().min(2, "Нэрээ оруулна уу."),
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

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setError("");
    try {
      // Одоо зөвхөн 2 утга дамжуулахад алдаа гарахгүй
      await register(values.email, values.password, { displayName: values.displayName });
      router.push("/");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Бүртгэл амжилтгүй боллоо. Дахин оролдоно уу.");
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-6">
      <div className="p-8 bg-white border border-emerald-50 rounded-[2.5rem] shadow-2xl shadow-emerald-900/5">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-emerald-950 tracking-tighter uppercase mb-2">Бүртгүүлэх</h1>
          <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-[0.2em]">Scholarship MN систем</p>
        </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-100">
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Нэр"
                        autoComplete="name"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Имэйл хаяг"
                        autoComplete="email"
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
                        autoComplete="new-password"
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
                        autoComplete="new-password"
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
                className="w-full h-14 bg-emerald-950 hover:bg-emerald-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-950/20"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Түр хүлээнэ үү..." : "Бүртгэл үүсгэх"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 pt-4 border-t border-slate-50 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Аль хэдийн бүртгэлтэй юу?{" "}
              <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Нэвтрэх
              </Link>
            </p>
          </div>
      </div>
    </div>
  );
}