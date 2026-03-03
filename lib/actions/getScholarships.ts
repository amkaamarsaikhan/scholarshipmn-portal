import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import type { Scholarship } from "@/components/scholarships/scholarshipCard";

export const getScholarships = async (): Promise<Scholarship[]> => {
  try {
    const q = query(
      collection(db, "scholarships"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        title: String(data.title ?? "No title"),
        country: String(data.country ?? "Unknown"),
        image: data.image ?? "",
        type: data.type ?? "Full Fund",
        deadline:
          data.deadline?.toDate?.() instanceof Date
            ? data.deadline.toDate().toLocaleDateString()
            : data.deadline ?? "",
      };
    });
  } catch (error) {
    console.error("Error getting scholarships:", error);
    return [];
  }
};