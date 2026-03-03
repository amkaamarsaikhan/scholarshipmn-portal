"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  savedItems: any[];
  toggleSave: (item: any) => void;
  isSaved: (id: string) => boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedItems, setSavedItems] = useState<any[]>([]);

  const isSaved = (id: string) => savedItems.some(i => i.id === id);

  const toggleSave = (item: any) => {
    setSavedItems((prev) => {
      const isExisting = prev.some(i => i.id === item.id);
      const updated = isExisting ? prev.filter(i => i.id !== item.id) : [...prev, item];
      localStorage.setItem("savedScholarships", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem("savedScholarships");
    if (saved) setSavedItems(JSON.parse(saved));

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const register = (e: string, p: string) => createUserWithEmailAndPassword(auth, e, p).then(() => {});
  const login = (e: string, p: string) => signInWithEmailAndPassword(auth, e, p).then(() => {});
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, savedItems, toggleSave, isSaved, register, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);