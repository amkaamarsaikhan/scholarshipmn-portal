"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { revalidatePath } from "next/cache";

export async function addScholarship(formData: any) {
  try {
    const category = formData.category === "Full" || formData.category === "Partial"
      ? formData.category
      : "Partial";

    const n = (v: unknown, fallback = 0) => {
      const x = typeof v === "number" ? v : Number(v);
      return Number.isFinite(x) ? x : fallback;
    };

    await addDoc(collection(db, "scholarships"), {
      title: formData.title,
      country: formData.country,
      organization: formData.organization ?? "",
      category,
      type: formData.type ?? category,
      deadline: new Date(formData.deadline),
      description: formData.description,
      link: formData.link ?? "",
      requirements: Array.isArray(formData.requirements) ? formData.requirements : [],
      checklist: Array.isArray(formData.checklist) ? formData.checklist : [],
      minIelts: n(formData.minIelts),
      minGpa: n(formData.minGpa),
      minHsk: n(formData.minHsk),
      minTopik: n(formData.minTopik),
      minJlpt: n(formData.minJlpt),
      minGerman: n(formData.minGerman),
      degree: typeof formData.degree === "string" ? formData.degree : "",
      createdAt: serverTimestamp(),
      lastViewedAt: serverTimestamp(),
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error adding document: ", error);
    return { success: false, error: "Тэтгэлэг нэмэхэд алдаа гарлаа" };
  }
}