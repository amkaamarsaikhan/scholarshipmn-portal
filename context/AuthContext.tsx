"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  deleteUser,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { 
  doc, 
  setDoc, 
  getDoc,
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
  checklistProgress: Record<string, number[]>;
  toggleSave: (item: any) => Promise<void>;
  isSaved: (id: string) => boolean;
  setChecklist: (
    scholarshipId: string,
    items: number[],
    extra?: Record<string, unknown>
  ) => Promise<void>;
  register: (
    email: string,
    password: string,
    extraData?: { displayName?: string; phone?: string; age?: string; birthDate?: string }
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

function sanitizeChecks(v: unknown): number[] {
  if (!Array.isArray(v)) return [];
  return v.filter((n): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0);
}

function parseChecklistProgress(raw: unknown): Record<string, number[]> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, number[]> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    out[key] = sanitizeChecks(value);
  }
  return out;
}

const AuthContext = createContext<AuthContextType>({
  user: null, 
  loading: true, 
  savedItems: [],
  checklistProgress: {},
  toggleSave: async () => {}, 
  isSaved: () => false,
  setChecklist: async () => {},
  register: async () => {}, 
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  deleteAccount: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [checklistProgress, setChecklistProgress] = useState<Record<string, number[]>>({});

  const isSaved = (id: string) => savedItems.some(i => i.id === id);

  useEffect(() => {
    let unsubscribeUser: () => void;
    let migratedGuest = false;
    
    const authUnsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        unsubscribeUser = onSnapshot(doc(db, "users", u.uid), async (userDoc) => {
          if (userDoc.exists()) {
            const data = userDoc.data();
            const progress = parseChecklistProgress(data.checklistProgress);
            setChecklistProgress(progress);

            if (!migratedGuest && typeof window !== "undefined") {
              migratedGuest = true;
              const payload: Record<string, number[]> = {};
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (!key?.startsWith("checklist:")) continue;
                const suffix = key.includes(":") ? key.slice(key.lastIndexOf(":") + 1) : "";
                if (suffix !== "guest" && suffix !== u.uid) continue;
                const scholarshipId = key.slice("checklist:".length, -(suffix.length + 1));
                if (!scholarshipId || progress[scholarshipId]?.length) continue;
                try {
                  const parsed = sanitizeChecks(JSON.parse(localStorage.getItem(key) || "[]"));
                  if (parsed.length > 0) payload[scholarshipId] = parsed;
                } catch {
                  // ignore bad local data
                }
              }
              const ids = Object.keys(payload);
              if (ids.length > 0) {
                const nested: Record<string, number[]> = {};
                for (const sid of ids) nested[`checklistProgress.${sid}`] = payload[sid];
                try {
                  await updateDoc(doc(db, "users", u.uid), nested);
                  ids.forEach((sid) => {
                    localStorage.removeItem(`checklist:${sid}:guest`);
                    localStorage.removeItem(`checklist:${sid}:${u.uid}`);
                  });
                } catch (err) {
                  console.error("Checklist migrate error:", err);
                }
              }
            }

            const savedIds = data.savedScholarships || [];
            if (savedIds.length > 0) {
              try {
                const sQuery = query(collection(db, "scholarships"), where(documentId(), "in", savedIds));
                const sSnap = await getDocs(sQuery);
                const sList = sSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
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
        migratedGuest = false;
        if (unsubscribeUser) unsubscribeUser();
        setSavedItems([]);
        setChecklistProgress({});
      }
      setLoading(false);
    });

    return () => {
      authUnsubscribe();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  const register = async (
    email: string,
    password: string,
    extraData?: { displayName?: string; phone?: string; age?: string; birthDate?: string }
  ) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = res.user;
    const autoDisplayName = extraData?.displayName?.trim() || email.split("@")[0];

    await updateProfile(newUser, { displayName: autoDisplayName });

    // Мэдээлэл ирээгүй бол хоосон утгаар хадгална
    await setDoc(doc(db, "users", newUser.uid), {
      uid: newUser.uid,
      email: email,
      displayName: autoDisplayName,
      phone: extraData?.phone || "",
      age: extraData?.age ? parseInt(extraData.age) : 0,
      birthDate: extraData?.birthDate || "",
      status: "not-started",
      profileCompleted: !!extraData, // Мэдээлэл ирсэн бол true, үгүй бол false
      savedScholarships: [],
      checklistProgress: {},
      createdAt: serverTimestamp()
    });

    await fetch("/api/admin-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: "Шинэ хэрэглэгч бүртгүүллээ",
        email: email,
        phone: extraData?.phone || "Мэдээлэлгүй"
      }),
    });
  };

  const toggleSave = async (item: any) => {
    if (!user) return;
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

  const setChecklist = async (
    scholarshipId: string,
    items: number[],
    extra?: Record<string, unknown>
  ) => {
    if (!user || !scholarshipId) return;
    const clean = sanitizeChecks(items);
    setChecklistProgress((prev) => ({ ...prev, [scholarshipId]: clean }));
    try {
      await updateDoc(doc(db, "users", user.uid), {
        [`checklistProgress.${scholarshipId}`]: clean,
        ...(extra ?? {}),
      });
    } catch (error) {
      console.error("Checklist save error:", error);
    }
  };

  const login = (e: string, p: string) => signInWithEmailAndPassword(auth, e, p).then(() => {});

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const res = await signInWithPopup(auth, provider);
    const googleUser = res.user;
    const userRef = doc(db, "users", googleUser.uid);
    const existing = await getDoc(userRef);
    if (existing.exists()) return;

    const displayName = googleUser.displayName?.trim() || googleUser.email?.split("@")[0] || "Хэрэглэгч";
    await setDoc(userRef, {
      uid: googleUser.uid,
      email: googleUser.email || "",
      displayName,
      phone: "",
      age: 0,
      birthDate: "",
      status: "not-started",
      profileCompleted: false,
      savedScholarships: [],
      checklistProgress: {},
      provider: "google",
      createdAt: serverTimestamp(),
    });

    await fetch("/api/admin-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: "Шинэ хэрэглэгч (Google)",
        email: googleUser.email,
        phone: "Google бүртгэл",
      }),
    });
  };

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
      user, loading, savedItems, checklistProgress, toggleSave, isSaved, setChecklist, register, login, loginWithGoogle, logout, deleteAccount 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);