"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { revalidatePath } from "next/cache";

export async function addScholarship(formData: any) {
  try {
    await addDoc(collection(db, "scholarships"), {
      title: formData.title,
      country: formData.country,
      organization: formData.organization,
      deadline: new Date(formData.deadline), // Огноог Timestamp болгож хадгалах нь зөв
      description: formData.description,
      link: formData.link,
      createdAt: serverTimestamp(),
    });

    // Дата нэмэгдсэн тул хуудсыг шинэчилж мэдээллийг дахин татах
    revalidatePath("/"); 
    return { success: true };
  } catch (error) {
    console.error("Error adding document: ", error);
    return { success: false, error: "Тэтгэлэг нэмэхэд алдаа гарлаа" };
  }
}