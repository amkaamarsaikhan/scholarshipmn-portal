"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

// 1. Context-ийн төрлийг шинэчлэн тодорхойлох (Бүртгэл, Нэвтрэх функц нэмэв)
interface AuthContextType {
  user: User | null;
  loading: boolean;
  savedItems: any[];
  toggleSave: (item: any) => void;
  register: (email: string, password: string) => Promise<void>; // Нэмэгдсэн
  login: (email: string, password: string) => Promise<void>;    // Нэмэгдсэн
  logout: () => Promise<void>;                                   // Нэмэгдсэн
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  savedItems: [],
  toggleSave: () => {},
  register: async () => {},
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedItems, setSavedItems] = useState<any[]>([]);

  // 2. Бүртгүүлэх функц
  const register = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  // 3. Нэвтрэх функц
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // 4. Гарах функц
  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    // localStorage-оос хадгалсан датаг унших
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

  const toggleSave = (item: any) => {
    setSavedItems((prevItems) => {
      const isExisting = prevItems.some((i) => i.id === item.id);
      let updatedItems;

      if (isExisting) {
        updatedItems = prevItems.filter((i) => i.id !== item.id);
      } else {
        updatedItems = [...prevItems, item];
      }

      localStorage.setItem("savedScholarships", JSON.stringify(updatedItems));
      return updatedItems;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, savedItems, toggleSave, register, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);