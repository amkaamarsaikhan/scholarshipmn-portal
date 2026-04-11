"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { revalidatePath } from "next/cache";

export async function addScholarship(formData: any) {
  try {
    const category = formData.category === "Full" || formData.category === "Partial"
      ? formData.category
      : "Partial";

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
      minIelts: 0,
      minGpa: 0,
      minHsk: 0,
      minTopik: 0,
      minJlpt: 0,
      minGerman: 0,
      createdAt: serverTimestamp(),
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error adding document: ", error);
    return { success: false, error: "Тэтгэлэг нэмэхэд алдаа гарлаа" };
  }
}