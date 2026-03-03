"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  deleteUser // Нэмэгдсэн
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { 
  doc, 
  setDoc, 
  serverTimestamp, 
  getDoc, 
  updateDoc, 
  deleteDoc, // Нэмэгдсэн
  arrayUnion, 
  arrayRemove,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { sendTelegramNotification } from '@/lib/utils';

// 1. Interface-д бүх функцээ зарлах (TypeScript-ийн алдааг засна)
interface AuthContextType {
  user: User | null;
  loading: boolean;
  savedItems: any[];
  toggleSave: (item: any) => void;
  isSaved: (id: string) => boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>; // <--- Нэмэгдсэн
}

const AuthContext = createContext<AuthContextType>({
  user: null, 
  loading: true, 
  savedItems: [],
  toggleSave: () => {}, 
  isSaved: () => false,
  register: async () => {}, 
  login: async () => {}, 
  logout: async () => {},
  deleteAccount: async () => {}, // <--- Нэмэгдсэн
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedItems, setSavedItems] = useState<any[]>([]);

  const isSaved = (id: string) => savedItems.some(i => i.id === id);

  // --- 1. Firestore-оос хадгалсан тэтгэлгүүдийг татах логик ---
  const fetchSavedScholarships = async (u: User) => {
    try {
      const userDoc = await getDoc(doc(db, "users", u.uid));
      if (userDoc.exists()) {
        const savedIds = userDoc.data().savedScholarships || [];
        
        if (savedIds.length > 0) {
          const sQuery = query(collection(db, "scholarships"), where("__name__", "in", savedIds));
          const sSnap = await getDocs(sQuery);
          const sList = sSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setSavedItems(sList);
        } else {
          setSavedItems([]);
        }
      }
    } catch (error) {
      console.error("Error fetching saved items:", error);
    }
  };

  // --- 2. Хадгалах/Устгах логик (Firestore + Telegram) ---
  const toggleSave = async (item: any) => {
    if (!user) return alert("Нэвтэрсний дараа хадгалах боломжтой!");

    const userRef = doc(db, "users", user.uid);
    const alreadySaved = isSaved(item.id);

    try {
      if (alreadySaved) {
        setSavedItems(prev => prev.filter(i => i.id !== item.id));
        await updateDoc(userRef, { 
          savedScholarships: arrayRemove(item.id) 
        });
      } else {
        setSavedItems(prev => [...prev, item]);
        await updateDoc(userRef, { 
          savedScholarships: arrayUnion(item.id),
          lastUpdatedScholarship: item.title 
        });

        await sendTelegramNotification(`🌟 <b>ШИНЭ ХАДГАЛАЛТ!</b>\n\n👤 Хэрэглэгч: ${user.email}\n🎓 Тэтгэлэг: ${item.title}`);
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  // --- 3. Бүртгэл устгах функц (Auth + Firestore + Telegram) ---
  const deleteAccount = async () => {
    if (!user) return;

    const confirmDelete = confirm("Та бүртгэлээ бүрэн устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.");
    if (!confirmDelete) return;

    try {
      const userEmail = user.email;
      const userUid = user.uid;

      // Firestore-оос устгах
      await deleteDoc(doc(db, "users", userUid));

      // Auth-аас устгах
      await deleteUser(user);

      // Telegram мэдэгдэл
      await sendTelegramNotification(`🗑️ <b>БҮРТГЭЛ УСТЛАА</b>\n\n📧 Email: ${userEmail}\nСистемээс бүрэн хасагдлаа.`);

      alert("Таны бүртгэл амжилттай устлаа.");
      window.location.href = "/";
    } catch (error: any) {
      console.error("Delete account error:", error);
      if (error.code === "auth/requires-recent-login") {
        alert("Аюулгүй байдлын үүднээс та дахин нэвтэрсний дараа бүртгэлээ устгах боломжтой.");
        await signOut(auth);
      } else {
        alert("Алдаа гарлаа. Дахин оролдоно уу.");
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await fetchSavedScholarships(u);
      } else {
        setSavedItems([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = res.user;

    await setDoc(doc(db, "users", newUser.uid), {
      uid: newUser.uid,
      email: newUser.email,
      displayName: email.split('@')[0],
      status: "not-started",
      savedScholarships: [],
      createdAt: serverTimestamp()
    });

    await sendTelegramNotification(`👤 <b>ШИНЭ ХЭРЭГЛЭГЧ!</b>\n\n📧 Email: ${email}\n🎉 Платформд нэгдлээ.`);
  };

  const login = (e: string, p: string) => signInWithEmailAndPassword(auth, e, p).then(() => {});
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ 
      user, loading, savedItems, toggleSave, isSaved, register, login, logout, deleteAccount 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);