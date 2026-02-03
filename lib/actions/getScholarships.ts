import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export const getScholarships = async () => {
  try {
    const q = query(collection(db, "scholarships"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Deadline-ийг аюулгүй хөрвүүлэх
        deadline: data.deadline?.toDate ? data.deadline.toDate().toLocaleDateString() : data.deadline,
      };
    });
  } catch (error) {
    console.error("Error getting scholarships: ", error);
    return [];
  }
};