import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Хүчинтэй и-мэйл хаяг оруулна уу"),
  password: z.string().min(6, "Нууц үг дор хаяж 6 тэмдэгт байх ёстой"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const scholarshipSchema = z.object({
  title: z.string().min(3, "Дор хаяж 3 тэмдэгт оруулна уу"),
  country: z.string().min(2, "Улсын нэр оруулна уу"),
  organization: z.string().optional(),
  category: z.enum(["Full", "Partial"]),
  deadline: z.string().min(1, "Хугацааг сонгоно уу"),
  description: z.string().min(10, "Дэлгэрэнгүй тайлбар оруулна уу"),
  link: z.string().url("Зөв URL хаяг оруулна уу").or(z.literal("")),
  // Энэ хэсгийг яг ингэж бичээрэй:
  requirements: z.array(z.string()),
  checklist: z.array(z.string()),
});

export type ScholarshipFormValues = z.infer<typeof scholarshipSchema>;