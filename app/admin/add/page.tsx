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
import { sendTelegramNotification } from "@/lib/utils";
import { PlusCircle, Globe, Calendar, Building2, Link as LinkIcon, FileText } from "lucide-react";

export default function AddScholarshipPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ScholarshipFormValues>({
    resolver: zodResolver(scholarshipSchema),
  });

  const onSubmit = async (data: ScholarshipFormValues) => {
    setLoading(true);
    const result = await addScholarship(data);

    if (result.success) {
      const telegramMessage = `
📢 <b>ШИНЭ ТЭТГЭЛЭГ ЗАРЛАГДЛАА!</b>

🎓 <b>Нэр:</b> ${data.title}
📍 <b>Улс:</b> ${data.country}
🏢 <b>Байгууллага:</b> ${data.organization || "Тодорхойгүй"}
📅 <b>Дуусах хугацаа:</b> ${data.deadline}

🔗 <a href="${data.link || 'https://scholarshipmn.academy'}">Дэлгэрэнгүйг эндээс үзэх</a>
      `;

      try {
        await sendTelegramNotification(telegramMessage);
      } catch (err) {
        console.error("Telegram error:", err);
      }

      alert("Амжилттай нийтлэгдлээ!");
      reset();
      router.refresh();
      router.push("/"); 
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fcfdfc] py-24 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 mb-4">
            <PlusCircle size={32} />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Шинэ тэтгэлэг нэмэх</h1>
          <p className="text-emerald-600 font-medium tracking-[0.15em] uppercase text-xs">Админ удирдлагын хэсэг</p>
        </div>

        {/* Form Section */}
        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-emerald-100 shadow-2xl shadow-emerald-900/5 space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Тэтгэлгийн нэр */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                <FileText size={14} className="text-emerald-500" /> Тэтгэлгийн нэр
              </label>
              <Input 
                {...register("title")} 
                className="h-14 rounded-2xl border-emerald-50 bg-slate-50/50 focus:bg-white focus:ring-emerald-500/10 transition-all px-5" 
                placeholder="Жишээ: Global Korea Scholarship" 
              />
              {errors.title && <p className="text-red-500 text-[11px] font-medium ml-2">{errors.title.message}</p>}
            </div>

            {/* Улс */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                <Globe size={14} className="text-emerald-500" /> Улс
              </label>
              <Input 
                {...register("country")} 
                className="h-14 rounded-2xl border-emerald-50 bg-slate-50/50 focus:bg-white focus:ring-emerald-500/10 transition-all px-5" 
                placeholder="Жишээ: South Korea" 
              />
              {errors.country && <p className="text-red-500 text-[11px] font-medium ml-2">{errors.country.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Байгууллага */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                <Building2 size={14} className="text-emerald-500" /> Байгууллага
              </label>
              <Input 
                {...register("organization")} 
                className="h-14 rounded-2xl border-emerald-50 bg-slate-50/50 focus:bg-white focus:ring-emerald-500/10 transition-all px-5" 
                placeholder="Сургууль эсвэл Сангийн нэр"
              />
            </div>

            {/* Дуусах хугацаа */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                <Calendar size={14} className="text-emerald-500" /> Дуусах хугацаа
              </label>
              <Input 
                type="date" 
                {...register("deadline")} 
                className="h-14 rounded-2xl border-emerald-50 bg-slate-50/50 focus:bg-white focus:ring-emerald-500/10 transition-all px-5" 
              />
              {errors.deadline && <p className="text-red-500 text-[11px] font-medium ml-2">{errors.deadline.message}</p>}
            </div>
          </div>

          {/* Тайлбар */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
              <FileText size={14} className="text-emerald-500" /> Тэтгэлгийн тайлбар
            </label>
            <Textarea 
              {...register("description")} 
              className="rounded-2xl border-emerald-50 bg-slate-50/50 focus:bg-white focus:ring-emerald-500/10 transition-all min-h-[150px] p-5 leading-relaxed" 
              placeholder="Тэтгэлгийн тухай дэлгэрэнгүй мэдээлэл..."
            />
          </div>

          {/* Холбоос */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
              <LinkIcon size={14} className="text-emerald-500" /> Албан ёсны холбоос
            </label>
            <Input 
              {...register("link")} 
              className="h-14 rounded-2xl border-emerald-50 bg-slate-50/50 focus:bg-white focus:ring-emerald-500/10 transition-all px-5" 
              placeholder="https://example.com/scholarship" 
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-xl shadow-emerald-200 active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Түр хүлээнэ үү...
                </div>
              ) : "Тэтгэлгийг нийтлэх ба Мэдэгдэх"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}