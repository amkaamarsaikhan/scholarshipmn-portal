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
import { cn } from "@/lib/utils";
import { PlusCircle, Globe, Calendar, Building2, Link as LinkIcon, FileText, CheckCircle2, ListTodo, Plus, Trash2 } from "lucide-react";

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
      requirements: [""],
      checklist: [""],
    }
  });

  // Динамик талбаруудыг удирдах (Requirements & Checklist)
  const { fields: reqFields, append: appendReq, remove: removeReq } = useFieldArray({
    control,
    name: "requirements" as never,
  });

  const { fields: checkFields, append: appendCheck, remove: removeCheck } = useFieldArray({
    control,
    name: "checklist" as never,
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
        await fetch('/api/send-newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: data.title,
            description: data.description,
            link: data.link || 'https://scholarshipmn.academy',
            country: data.country
          }),
        });
      } catch (err) {
        console.error("Notification error:", err);
      }

      alert("Амжилттай нийтлэгдэж, мэдэгдэл илгээгдлээ!");
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 mb-4">
            <PlusCircle size={32} />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Шинэ тэтгэлэг нэмэх</h1>
          <p className="text-emerald-600 font-medium tracking-[0.15em] uppercase text-xs">Админ удирдлагын хэсэг</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-emerald-100 shadow-2xl shadow-emerald-900/5 space-y-8">
          
          {/* Үндсэн мэдээлэл */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                <FileText size={14} className="text-emerald-500" /> Тэтгэлгийн нэр
              </label>
              <Input {...register("title")} className="h-14 rounded-2xl border-emerald-50 bg-slate-50/50 px-5" placeholder="Жишээ: Global Korea Scholarship" />
              {errors.title && <p className="text-red-500 text-[11px] ml-2">{errors.title.message}</p>}
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                <Globe size={14} className="text-emerald-500" /> Улс
              </label>
              <Input {...register("country")} className="h-14 rounded-2xl border-emerald-50 bg-slate-50/50 px-5" placeholder="Жишээ: South Korea" />
              {errors.country && <p className="text-red-500 text-[11px] ml-2">{errors.country.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Байгууллага</label>
              <Input {...register("organization")} className="h-14 rounded-2xl border-emerald-50 bg-slate-50/50 px-5" placeholder="Сургуулийн нэр" />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Ангилал</label>
              <select {...register("category")} className="w-full h-14 rounded-2xl border-emerald-50 bg-slate-50/50 px-5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/10">
                <option value="Full">Full (Бүрэн)</option>
                <option value="Partial">Partial (Хэсэгчилсэн)</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Дуусах хугацаа</label>
              <Input type="date" {...register("deadline")} className="h-14 rounded-2xl border-emerald-50 bg-slate-50/50 px-5" />
            </div>
          </div>

          {/* Тайлбар */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Тэтгэлгийн тайлбар</label>
            <Textarea {...register("description")} className="rounded-2xl border-emerald-50 bg-slate-50/50 min-h-[120px] p-5" placeholder="Тэтгэлгийн тухай товч мэдээлэл..." />
          </div>

          {/* ШИНЭ: Тавигдах шаардлага (Dynamic Requirements) */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
              <CheckCircle2 size={14} className="text-emerald-500" /> Тавигдах шаардлага
            </label>
            <div className="space-y-3">
              {reqFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input 
                    {...register(`requirements.${index}` as never)} 
                    placeholder={`Шаардлага ${index + 1}`} 
                    className="h-12 rounded-xl border-emerald-50 bg-slate-50/50 px-4"
                  />
                  <Button type="button" variant="ghost" onClick={() => removeReq(index)} className="text-slate-400 hover:text-red-500">
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendReq("")} className="w-full h-12 rounded-xl border-dashed border-emerald-200 text-emerald-600 hover:bg-emerald-50 gap-2">
                <Plus size={16} /> Шаардлага нэмэх
              </Button>
            </div>
          </div>

          {/* ШИНЭ: Checklist (Dynamic Checklist) */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
              <ListTodo size={14} className="text-emerald-500" /> Бүрдүүлэх материал (Checklist)
            </label>
            <div className="space-y-3">
              {checkFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input 
                    {...register(`checklist.${index}` as never)} 
                    placeholder={`Материал ${index + 1}`} 
                    className="h-12 rounded-xl border-emerald-50 bg-slate-50/50 px-4"
                  />
                  <Button type="button" variant="ghost" onClick={() => removeCheck(index)} className="text-slate-400 hover:text-red-500">
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendCheck("")} className="w-full h-12 rounded-xl border-dashed border-emerald-200 text-emerald-600 hover:bg-emerald-50 gap-2">
                <Plus size={16} /> Материал нэмэх
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
              <LinkIcon size={14} className="text-emerald-500" /> Албан ёсны холбоос
            </label>
            <Input {...register("link")} className="h-14 rounded-2xl border-emerald-50 bg-slate-50/50 px-5" placeholder="https://example.com/scholarship" />
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={loading} className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-xl shadow-emerald-200 active:scale-[0.98]">
              {loading ? "Түр хүлээнэ үү..." : "Тэтгэлгийг нийтлэх ба Мэдэгдэх"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}