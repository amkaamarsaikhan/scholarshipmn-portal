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
import { PlusCircle, Link as LinkIcon, CheckCircle2, ListTodo, Plus, Trash2, Sparkles } from "lucide-react";
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
      requirements: [""], 
      checklist: [""],   
    }
  });

  // 'as const' ашигласнаар 'never' алдааг бүрэн засна
  const { fields: reqFields, append: appendReq, remove: removeReq } = useFieldArray({
    control,
    name: "requirements" as const,
  });

  const { fields: checkFields, append: appendCheck, remove: removeCheck } = useFieldArray({
    control,
    name: "checklist" as const,
  });

  const onSubmit = async (data: ScholarshipFormValues) => {
    setLoading(true);
    const result = await addScholarship(data);

    if (result.success) {
      try {
        const telegramMessage = `📢 <b>ШИНЭ ТЭТГЭЛЭГ ЗАРЛАГДЛАА!</b>\n\n🎓 <b>${data.title}</b>\n📍 Улс: ${data.country}\n📅 Дуусах хугацаа: ${data.deadline}\n\n🔗 <a href="${data.link || 'https://scholarshipmn.academy'}">Бүртгүүлэх холбоос</a>`;
        await sendTelegramNotification(telegramMessage);
        
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
      router.push("/admin"); 
    } else {
      alert("Алдаа: " + result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <Badge className="bg-emerald-100 text-emerald-700 px-6 py-2 rounded-full font-bold uppercase text-[10px]">
            <Sparkles size={12} className="mr-2" /> Scholarship Creator
          </Badge>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Тэтгэлэг нэмэх</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-10 md:p-16 rounded-[3.5rem] border border-emerald-100 shadow-2xl shadow-emerald-900/5 space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-60" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Тэтгэлгийн нэр</label>
              <Input {...register("title")} className="h-16 rounded-2xl bg-slate-50 border-none px-6 text-lg" placeholder="Жишээ: Global Korea Scholarship" />
              {errors.title && <p className="text-red-500 text-xs ml-2">{errors.title.message}</p>}
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Улс</label>
              <Input {...register("country")} className="h-16 rounded-2xl bg-slate-50 border-none px-6 text-lg" placeholder="Жишээ: South Korea" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Байгууллага</label>
              <Input {...register("organization")} className="h-16 rounded-2xl bg-slate-50 border-none px-6 text-lg" placeholder="Сургуулийн нэр" />
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

          <div className="space-y-3 relative z-10">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Тайлбар</label>
            <Textarea {...register("description")} className="rounded-[1.5rem] bg-slate-50 border-none min-h-[150px] p-6 text-lg" placeholder="Тэтгэлгийн тухай товч мэдээлэл..." />
          </div>

          {/* Requirements Section */}
          <div className="space-y-4 relative z-10">
            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">
              <CheckCircle2 size={14} className="text-emerald-500" /> Шаардлага
            </label>
            {reqFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 group">
                <Input 
                  {...register(`requirements.${index}` as const)} 
                  className="h-14 rounded-xl bg-slate-50 border-none px-6 transition-all focus:bg-white focus:ring-2 focus:ring-emerald-500/10" 
                  placeholder={`Шаардлага ${index + 1}`}
                />
                <Button type="button" variant="ghost" onClick={() => removeReq(index)} className="text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 size={20} />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => appendReq("")} className="w-full h-14 rounded-xl border-dashed border-emerald-200 text-emerald-600 font-bold hover:bg-emerald-50 transition-all">
              <Plus size={18} className="mr-2" /> Шаардлага нэмэх
            </Button>
          </div>

          {/* Checklist Section */}
          <div className="space-y-4 relative z-10">
            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">
              <ListTodo size={14} className="text-emerald-500" /> Материалын жагсаалт
            </label>
            {checkFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 group">
                <Input 
                  {...register(`checklist.${index}` as const)} 
                  className="h-14 rounded-xl bg-slate-50 border-none px-6 transition-all focus:bg-white focus:ring-2 focus:ring-emerald-500/10" 
                  placeholder={`Материал ${index + 1}`}
                />
                <Button type="button" variant="ghost" onClick={() => removeCheck(index)} className="text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 size={20} />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => appendCheck("")} className="w-full h-14 rounded-xl border-dashed border-emerald-200 text-emerald-600 font-bold hover:bg-emerald-50 transition-all">
              <Plus size={18} className="mr-2" /> Материал нэмэх
            </Button>
          </div>

          <div className="space-y-3 relative z-10">
            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">
              <LinkIcon size={14} className="text-emerald-500" /> Холбоос
            </label>
            <Input {...register("link")} className="h-16 rounded-2xl bg-slate-50 border-none px-6 text-lg" placeholder="https://example.com" />
          </div>

          <div className="pt-6 relative z-10">
            <Button type="submit" disabled={loading} className="w-full h-20 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-200 active:scale-[0.98]">
              {loading ? "Нийтэлж байна..." : "Тэтгэлгийг нийтлэх"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}