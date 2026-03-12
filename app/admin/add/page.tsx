"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { scholarshipSchema, ScholarshipFormValues } from "@/lib/zod";
import { addScholarship } from "@/lib/actions/addScholarship";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sendTelegramNotification } from "@/lib/telegram";
import { PlusCircle, Globe, Building2, Link as LinkIcon, FileText, CheckCircle2, ListTodo, Plus, Trash2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AddScholarshipPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ScholarshipFormValues>({
    resolver: zodResolver(scholarshipSchema),
    defaultValues: {
      title: "",
      country: "",
      organization: "",
      category: "Partial",
      deadline: "",
      description: "",
      link: "",
      requirements: [""], // Анхны утга
      checklist: [""],    // Анхны утга
    }
  });

  // Dynamic талбарууд (World Nomads бүтэц)
  const { fields: reqFields, append: appendReq, remove: removeReq } = useFieldArray({
    control,
    name: "requirements",
  });

  const { fields: checkFields, append: appendCheck, remove: removeCheck } = useFieldArray({
    control,
    name: "checklist",
  });

  const onSubmit = async (data: ScholarshipFormValues) => {
    setLoading(true);
    
    // Server Action ашиглан Firebase рүү хадгалах
    const result = await addScholarship(data);

    if (result.success) {
      const telegramMessage = `📢 <b>ШИНЭ ТЭТГЭЛЭГ ЗАРЛАГДЛАА!</b>\n\n🎓 <b>${data.title}</b>\n📍 Улс: ${data.country}\n🏢 Байгууллага: ${data.organization}\n📅 Дуусах хугацаа: ${data.deadline}\n\n🔗 <a href="${data.link || 'https://scholarshipmn.academy'}">Бүртгүүлэх холбоос</a>`;

      try {
        await sendTelegramNotification(telegramMessage);
        
        // Newsletter илгээх API
        await fetch('/api/send-newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: data.title,
            description: data.description,
            link: data.link,
            country: data.country
          }),
        });
      } catch (err) {
        console.error("Мэдэгдэл илгээхэд алдаа гарлаа:", err);
      }

      alert("Амжилттай нийтлэгдлээ!");
      reset();
      router.refresh();
      router.push("/admin"); // Admin dashboard руу буцах
    } else {
      alert("Алдаа: " + result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-20 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-6 py-2 rounded-full font-bold tracking-widest uppercase text-[10px]">
            <Sparkles size={12} className="mr-2" /> Scholarship Creator
          </Badge>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Тэтгэлэг нэмэх</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-10 md:p-16 rounded-[3.5rem] border border-emerald-100 shadow-2xl shadow-emerald-900/5 space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-60" />

          {/* 1. Үндсэн мэдээлэл */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Тэтгэлгийн нэр</label>
              <Input {...register("title")} className="h-16 rounded-2xl bg-slate-50 border-none px-6 text-lg" placeholder="World Nomads Scholarship" />
              {errors.title && <p className="text-red-500 text-xs ml-2">{errors.title.message}</p>}
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Улс (Country)</label>
              <Input {...register("country")} className="h-16 rounded-2xl bg-slate-50 border-none px-6 text-lg" placeholder="Global" />
            </div>
          </div>

          {/* 2. Байгууллага, Төрөл, Хугацаа */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Байгууллага</label>
              <Input {...register("organization")} className="h-16 rounded-2xl bg-slate-50 border-none px-6 text-lg" placeholder="World Nomads" />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Ангилал</label>
              <select {...register("category")} className="w-full h-16 rounded-2xl bg-slate-50 border-none px-6 text-lg outline-none cursor-pointer">
                <option value="Partial">Partial (Хэсэгчилсэн)</option>
                <option value="Full">Full (Бүрэн)</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Дуусах хугацаа</label>
              <Input type="date" {...register("deadline")} className="h-16 rounded-2xl bg-slate-50 border-none px-6 text-lg" />
            </div>
          </div>

          {/* 3. Тайлбар */}
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Тэтгэлгийн тайлбар</label>
            <Textarea {...register("description")} className="rounded-[1.5rem] bg-slate-50 border-none min-h-[150px] p-6 text-lg" placeholder="Аялал жуулчлал, контент бүтээх сонирхолтой..." />
          </div>

          {/* 4. Requirements (Dynamic) */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">
              <CheckCircle2 size={14} className="text-emerald-500" /> Шаардлага (Requirements)
            </label>
            <div className="space-y-3">
              {reqFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 group">
                  <Input 
                    {...register(`requirements.${index}` as const)} 
                    placeholder={`Жишээ: 18+ настай байх`} 
                    className="h-14 rounded-xl bg-slate-50 border-none px-6 transition-all focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                  />
                  <Button type="button" variant="ghost" onClick={() => removeReq(index)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all">
                    <Trash2 size={20} />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendReq("")} className="w-full h-14 rounded-xl border-dashed border-emerald-200 text-emerald-600 hover:bg-emerald-50 gap-2 font-bold">
                <Plus size={18} /> Шаардлага нэмэх
              </Button>
            </div>
          </div>

          {/* 5. Checklist (Dynamic) */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">
              <ListTodo size={14} className="text-emerald-500" /> Материалын жагсаалт (Checklist)
            </label>
            <div className="space-y-3">
              {checkFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 group">
                  <Input 
                    {...register(`checklist.${index}` as const)} 
                    placeholder={`Жишээ: Portfolio линк`} 
                    className="h-14 rounded-xl bg-slate-50 border-none px-6 transition-all focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                  />
                  <Button type="button" variant="ghost" onClick={() => removeCheck(index)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all">
                    <Trash2 size={20} />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendCheck("")} className="w-full h-14 rounded-xl border-dashed border-emerald-200 text-emerald-600 hover:bg-emerald-50 gap-2 font-bold">
                <Plus size={18} /> Материал нэмэх
              </Button>
            </div>
          </div>

          {/* 6. Холбоос */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">
              <LinkIcon size={14} className="text-emerald-500" /> Албан ёсны холбоос
            </label>
            <Input {...register("link")} className="h-16 rounded-2xl bg-slate-50 border-none px-6 text-lg" placeholder="https://worldnomads.com" />
          </div>

          {/* Submit Button */}
          <div className="pt-6 relative z-10">
            <Button type="submit" disabled={loading} className="w-full h-20 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-200 active:scale-[0.98]">
              {loading ? "Бэлтгэж байна..." : "Тэтгэлгийг нийтлэх ба Мэдэгдэх"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}