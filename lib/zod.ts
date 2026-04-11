import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Хүчинтэй и-мэйл хаяг оруулна уу"),
  password: z.string().min(6, "Нууц үг дор хаяж 6 тэмдэгт байх ёстой"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

/** Хоосон/NaN-ийг 0 болгож, import-ын тоон талбартай ижил хэмжээтэй болгоно */
function scoreField(max: number) {
  return z.preprocess(
    (v) => {
      if (v === "" || v === null || v === undefined) return 0;
      const n = typeof v === "number" ? v : Number(v);
      if (!Number.isFinite(n)) return 0;
      return Math.min(max, Math.max(0, n));
    },
    z.number().min(0).max(max)
  );
}

export const scholarshipSchema = z.object({
  title: z.string().min(3, "Дор хаяж 3 тэмдэгт оруулна уу"),
  country: z.string().min(2, "Улсын нэр оруулна уу"),
  organization: z.string().optional(),
  category: z.enum(["Full", "Partial"]),
  deadline: z.string().min(1, "Хугацааг сонгоно уу"),
  description: z.string().min(10, "Дэлгэрэнгүй тайлбар оруулна уу"),
  link: z.string().url("Зөв URL хаяг оруулна уу").or(z.literal("")),

  /** import/page.tsx болон AI хайлтын query-тай тааруулсан талбарууд */
  minIelts: scoreField(9),
  minGpa: scoreField(4),
  minHsk: scoreField(6),
  minTopik: scoreField(6),
  minJlpt: scoreField(5),
  minGerman: scoreField(20),
  degree: z.enum(["", "Bachelor", "Master", "PhD"]),

  requirements: z.array(z.string()).default([]),
  checklist: z.array(z.string()).default([]),
});

export type ScholarshipFormValues = z.infer<typeof scholarshipSchema>;