"use client";

import { useForm, useFieldArray, FieldArrayPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { scholarshipSchema, ScholarshipFormValues } from "@/lib/zod";
import { addScholarship } from "@/lib/actions/addScholarship";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Link as LinkIcon,
  CheckCircle2,
  ListTodo,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

export default function AddScholarshipPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<ScholarshipFormValues>({
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
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = form;

  const {
    fields: reqFields,
    append: appendReq,
    remove: removeReq,
  } = useFieldArray<ScholarshipFormValues>({
    control,
    name: "requirements" as FieldArrayPath<ScholarshipFormValues>,
  });

  const {
    fields: checkFields,
    append: appendCheck,
    remove: removeCheck,
  } = useFieldArray<ScholarshipFormValues>({
    control,
    name: "checklist" as FieldArrayPath<ScholarshipFormValues>,
  });

  const onSubmit = async (data: ScholarshipFormValues) => {
    setLoading(true);

    const cleanedData = {
      ...data,
      requirements: data.requirements.filter((r) => r.trim() !== ""),
      checklist: data.checklist.filter((c) => c.trim() !== ""),
    };

    const result = await addScholarship(cleanedData);

    if (result.success) {
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
        {/* HEADER */}

        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <Badge className="bg-emerald-100 text-emerald-700 px-6 py-2 rounded-full font-bold uppercase text-[10px]">
            <Sparkles size={12} className="mr-2" />
            Scholarship Creator
          </Badge>

          <h1 className="text-5xl font-black text-slate-900 tracking-tight">
            Тэтгэлэг нэмэх
          </h1>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-10 md:p-16 rounded-[3rem] border border-emerald-100 shadow-2xl space-y-10"
        >
          {/* TITLE + COUNTRY */}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-400">
                Тэтгэлгийн нэр
              </label>

              <Input {...register("title")} placeholder="Scholarship Name" />

              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400">Улс</label>

              <Input {...register("country")} placeholder="Country" />
            </div>
          </div>

          {/* ORGANIZATION + CATEGORY + DEADLINE */}

          <div className="grid md:grid-cols-3 gap-6">
            <Input {...register("organization")} placeholder="Organization" />

            <select
              {...register("category")}
              className="h-10 border rounded-lg px-3"
            >
              <option value="Partial">Partial</option>
              <option value="Full">Full</option>
            </select>

            <Input type="date" {...register("deadline")} />
          </div>

          {/* DESCRIPTION */}

          <Textarea
            {...register("description")}
            placeholder="Тэтгэлгийн дэлгэрэнгүй тайлбар"
          />

          {/* REQUIREMENTS */}

          <div className="space-y-4">
            <label className="flex items-center gap-2 font-bold text-slate-500">
              <CheckCircle2 size={16} /> Шаардлага
            </label>

            {reqFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input {...register(`requirements.${index}`)} />

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeReq(index)}
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => appendReq("")}
            >
              <Plus size={16} className="mr-2" />
              Шаардлага нэмэх
            </Button>
          </div>

          {/* CHECKLIST */}

          <div className="space-y-4">
            <label className="flex items-center gap-2 font-bold text-slate-500">
              <ListTodo size={16} /> Материалын жагсаалт
            </label>

            {checkFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input {...register(`checklist.${index}`)} />

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeCheck(index)}
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => appendCheck("")}
            >
              <Plus size={16} className="mr-2" />
              Материал нэмэх
            </Button>
          </div>

          {/* LINK */}

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <LinkIcon size={14} />
              Холбоос
            </label>

            <Input {...register("link")} placeholder="https://example.com" />
          </div>

          {/* SUBMIT */}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            {loading ? "Нийтэлж байна..." : "Тэтгэлгийг нийтлэх"}
          </Button>
        </form>
      </div>
    </div>
  );
}