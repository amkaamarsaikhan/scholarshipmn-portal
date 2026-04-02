"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  deleteUser,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { 
  doc, 
  setDoc, 
  serverTimestamp, 
  updateDoc, 
  deleteDoc, 
  arrayUnion, 
  arrayRemove,
  onSnapshot,
  collection,
  query,
  where,
  documentId,
  getDocs
} from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  savedItems: any[];
  toggleSave: (item: any) => Promise<void>;
  isSaved: (id: string) => boolean;
  register: (email: string, password: string, extraData: { phone: string; age: string; birthDate: string }) => Promise<void>;
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

  useEffect(() => {
    let unsubscribeUser: () => void;
    
    const authUnsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        unsubscribeUser = onSnapshot(doc(db, "users", u.uid), async (userDoc) => {
          if (userDoc.exists()) {
            const savedIds = userDoc.data().savedScholarships || [];
            if (savedIds.length > 0) {
              try {
                const sQuery = query(collection(db, "scholarships"), where(documentId(), "in", savedIds));
                const sSnap = await getDocs(sQuery);
                const sList = sSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setSavedItems(sList);
              } catch (err) {
                console.error("Scholarships fetch error:", err);
              }
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

  const register = async (email: string, password: string, extraData: { phone: string; age: string; birthDate: string }) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = res.user;
    const autoDisplayName = email.split('@')[0];

    await updateProfile(newUser, { displayName: autoDisplayName });

    await setDoc(doc(db, "users", newUser.uid), {
      uid: newUser.uid,
      email: email,
      displayName: autoDisplayName,
      phone: extraData.phone,
      age: parseInt(extraData.age),
      birthDate: extraData.birthDate,
      status: "not-started",
      profileCompleted: true,
      savedScholarships: [],
      createdAt: serverTimestamp()
    });

    await fetch("/api/admin-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: "Шинэ хэрэглэгч бүртгүүллээ",
        email: email,
        phone: extraData.phone
      }),
    });
  };

  const toggleSave = async (item: any) => {
    if (!user) return alert("Нэвтэрсний дараа хадгалах боломжтой!");
    const userRef = doc(db, "users", user.uid);
    try {
      if (isSaved(item.id)) {
        await updateDoc(userRef, { savedScholarships: arrayRemove(item.id) });
      } else {
        await updateDoc(userRef, { 
          savedScholarships: arrayUnion(item.id),
          lastUpdatedScholarship: item.title 
        });
        await fetch("/api/admin-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: "Хэрэглэгч тэтгэлэг хадгаллаа",
            email: user.email,
            scholarship: item.title
          }),
        });
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const login = (e: string, p: string) => signInWithEmailAndPassword(auth, e, p).then(() => {});
  const logout = () => signOut(auth);

  const deleteAccount = async () => {
    if (!user) return;
    const confirmDelete = confirm("Та бүртгэлээ бүрэн устгахдаа итгэлтэй байна уу?");
    if (!confirmDelete) return;

    try {
      const email = user.email;
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);
      await fetch("/api/admin-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: "Бүртгэл устлаа", email: email }),
      });
      window.location.href = "/";
    } catch (error: any) {
      if (error.code === "auth/requires-recent-login") {
        alert("Дахин нэвтэрсний дараа устгах боломжтой.");
        await signOut(auth);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, loading, savedItems, toggleSave, isSaved, register, login, logout, deleteAccount 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);