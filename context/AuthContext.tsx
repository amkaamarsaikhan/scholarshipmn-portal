"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// 1. Context-ийн төрлийг шинэчлэн тодорхойлох
interface AuthContextType {
  user: User | null;
  loading: boolean;
  savedItems: any[]; // Хадгалсан тэтгэлгүүдийн жагсаалт
  toggleSave: (item: any) => void; // Хадгалах/Устгах функц
}

// 2. Default утгуудыг тохируулах
const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  savedItems: [],
  toggleSave: () => {} 
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedItems, setSavedItems] = useState<any[]>([]);

  // 3. localStorage-оос хадгалсан датаг унших (Browser дээр ажиллана)
  useEffect(() => {
    const saved = localStorage.getItem("savedScholarships");
    if (saved) {
      try {
        setSavedItems(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing saved items", e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 4. Хадгалах/Устгах функц
  const toggleSave = (item: any) => {
    setSavedItems((prevItems) => {
      const isExisting = prevItems.some((i) => i.id === item.id);
      let updatedItems;

      if (isExisting) {
        // Хэрэв байгаа бол жагсаалтаас хасах
        updatedItems = prevItems.filter((i) => i.id !== item.id);
      } else {
        // Байхгүй бол нэмэх
        updatedItems = [...prevItems, item];
      }

      // LocalStorage-д хадгалах
      localStorage.setItem("savedScholarships", JSON.stringify(updatedItems));
      return updatedItems;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, savedItems, toggleSave }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);