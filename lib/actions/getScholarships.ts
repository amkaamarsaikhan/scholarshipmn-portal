import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Scholarship } from "@/components/scholarships/scholarshipCard";

export const getScholarships = async (): Promise<Scholarship[]> => {
  try {
    const q = query(
      collection(db, "scholarships"),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    const scholarships: Scholarship[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,

        // 🔒 Required fields-г баталгаажуулж өгнө
        title: data.title ?? "No title",
        country: data.country ?? "Unknown",

        // Optional fields
        image: data.image ?? "",
        type: data.type ?? "Full Fund",

        // Firestore Timestamp safe convert
        deadline:
          data.deadline?.toDate instanceof Function
            ? data.deadline.toDate().toLocaleDateString()
            : data.deadline ?? "",
      };
    });

    return scholarships;
  } catch (error) {
    console.error("Error getting scholarships: ", error);
    return [];
  }
};