"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  deleteUser
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { 
  doc, 
  setDoc, 
  serverTimestamp, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  arrayUnion, 
  arrayRemove,
  onSnapshot,
  collection,
  query,
  where,
  documentId
} from 'firebase/firestore';
import { sendTelegramNotification } from '@/lib/telegram';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  savedItems: any[];
  toggleSave: (item: any) => Promise<void>;
  isSaved: (id: string) => boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, 
  loading: true, 
  savedItems: [],
  toggleSave: async () => {}, 
  isSaved: () => false,
  register: async () => {}, 
  login: async () => {}, 
  logout: async () => {},
  deleteAccount: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedItems, setSavedItems] = useState<any[]>([]);

  const isSaved = (id: string) => savedItems.some(i => i.id === id);

  // --- Real-time тэтгэлэг татах логик ---
  useEffect(() => {
    let unsubscribeUser: () => void;
    
    const authUnsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      
      if (u) {
        // Хэрэглэгчийн баримтыг Real-time сонсох
        unsubscribeUser = onSnapshot(doc(db, "users", u.uid), async (userDoc) => {
          if (userDoc.exists()) {
            const savedIds = userDoc.data().savedScholarships || [];
            
            if (savedIds.length > 0) {
              // ID-нуудаар тэтгэлгийн мэдээллийг татах
              const sQuery = query(collection(db, "scholarships"), where(documentId(), "in", savedIds));
              const sSnap = await getDocs(sQuery); // query дотор snapshot ашиглаж болно, гэвч энэ хэсэгт хялбарчилсан
              const sList = sSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              setSavedItems(sList);
            } else {
              setSavedItems([]);
            }
          }
        });
      } else {
        setSavedItems([]);
      }
      setLoading(false);
    });

    return () => {
      authUnsubscribe();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  const toggleSave = async (item: any) => {
    if (!user) return alert("Нэвтэрсний дараа хадгалах боломжтой!");

    const userRef = doc(db, "users", user.uid);
    const alreadySaved = isSaved(item.id);

    try {
      if (alreadySaved) {
        await updateDoc(userRef, { 
          savedScholarships: arrayRemove(item.id) 
        });
      } else {
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

  const deleteAccount = async () => {
    if (!user) return;
    const confirmDelete = confirm("Та бүртгэлээ бүрэн устгахдаа итгэлтэй байна уу?");
    if (!confirmDelete) return;

    try {
      const userEmail = user.email;
      const userUid = user.uid;
      
      // 1. Хэрэглэгчийн бүх явцыг (progress) устгах логик энд нэмэгдэж болно
      await deleteDoc(doc(db, "users", userUid));
      await deleteUser(user);
      await sendTelegramNotification(`🗑️ <b>БҮРТГЭЛ УСТЛАА</b>\n\n📧 Email: ${userEmail}`);

      alert("Амжилттай устлаа.");
      window.location.href = "/";
    } catch (error: any) {
      if (error.code === "auth/requires-recent-login") {
        alert("Дахин нэвтэрсний дараа устгах боломжтой.");
        await signOut(auth);
      }
    }
  };

  const register = async (email: string, password: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", res.user.uid), {
      uid: res.user.uid,
      email: res.user.email,
      displayName: email.split('@')[0],
      status: "not-started",
      savedScholarships: [],
      createdAt: serverTimestamp()
    });
    await sendTelegramNotification(`👤 <b>ШИНЭ ХЭРЭГЛЭГЧ!</b>\n\n📧 Email: ${email}`);
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
import { getDocs } from 'firebase/firestore'; // Дутуу байсныг нэмэв