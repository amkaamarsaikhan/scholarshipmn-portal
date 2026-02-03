"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { scholarshipSchema, ScholarshipFormValues } from "@/lib/zod";
import { addScholarship } from "@/lib/actions/addScholarship";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AddScholarshipPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScholarshipFormValues>({
    resolver: zodResolver(scholarshipSchema),
  });

  const onSubmit = async (data: ScholarshipFormValues) => {
    setLoading(true);
    const result = await addScholarship(data);
    setLoading(false);

    if (result.success) {
      alert("Тэтгэлэг амжилттай нэмэгдлээ!");
      router.push("/"); // Нүүр хуудас руу шилжих
      router.refresh();
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-20 px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-serif italic text-emerald-950">Шинэ тэтгэлэг нэмэх</h1>
        <p className="text-emerald-600 text-sm mt-2 uppercase tracking-widest font-bold">Admin Panel</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 border border-emerald-50 shadow-xl shadow-emerald-900/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Гарчиг */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-tighter font-black text-emerald-900">Тэтгэлгийн нэр</label>
            <Input {...register("title")} className="rounded-none border-emerald-100 focus:border-emerald-500" placeholder="Жишээ: Global Korea Scholarship" />
            {errors.title && <p className="text-red-500 text-[10px] italic">{errors.title.message}</p>}
          </div>

          {/* Улс */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-tighter font-black text-emerald-900">Улс</label>
            <Input {...register("country")} className="rounded-none border-emerald-100 focus:border-emerald-500" placeholder="Жишээ: South Korea" />
            {errors.country && <p className="text-red-500 text-[10px] italic">{errors.country.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Байгууллага */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-tighter font-black text-emerald-900">Байгууллага</label>
            <Input {...register("organization")} className="rounded-none border-emerald-100 focus:border-emerald-500" />
          </div>

          {/* Дуусах хугацаа */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-tighter font-black text-emerald-900">Дуусах хугацаа</label>
            <Input type="date" {...register("deadline")} className="rounded-none border-emerald-100 focus:border-emerald-500" />
            {errors.deadline && <p className="text-red-500 text-[10px] italic">{errors.deadline.message}</p>}
          </div>
        </div>

        {/* Тайлбар */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-tighter font-black text-emerald-900">Тэтгэлгийн тайлбар</label>
          <Textarea {...register("description")} className="rounded-none border-emerald-100 focus:border-emerald-500 min-h-[120px]" />
        </div>

        {/* Холбоос */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-tighter font-black text-emerald-900">Албан ёсны холбоос (Link)</label>
          <Input {...register("link")} className="rounded-none border-emerald-100 focus:border-emerald-500" placeholder="https://..." />
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-emerald-950 hover:bg-emerald-800 text-white rounded-none py-6 uppercase tracking-[0.2em] font-bold text-xs transition-all"
        >
          {loading ? "Түр хүлээнэ үү..." : "Тэтгэлгийг нийтлэх"}
        </Button>
      </form>
    </div>
  );
}