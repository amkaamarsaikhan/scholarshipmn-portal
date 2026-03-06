"use client";
import React, { useState, useEffect } from 'react';
import { db, auth } from "@/lib/firebase"; 
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { MessageSquare, Plus, User, Send, X } from 'lucide-react';

export default function ForumPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Шинэ пост бичих утгууд
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsArray: any[] = [];
      querySnapshot.forEach((doc) => {
        postsArray.push({ ...doc.data(), id: doc.id });
      });
      setPosts(postsArray);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Пост хадгалах функц
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        authorName: auth.currentUser?.displayName || "Зочин",
        authorId: auth.currentUser?.uid || "anonymous",
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setContent("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Алдаа гарлаа:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-emerald-600 py-10 text-white">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl font-bold flex justify-center items-center gap-2">
            <MessageSquare /> Форум
          </h1>
          <p className="opacity-80 mt-2">Мэдлэгээ хуваалцаж, хамтдаа хөгжицгөөе</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Сүүлийн хэлэлцүүлгүүд</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 text-white px-5 py-2 rounded-full font-semibold flex items-center gap-2 hover:bg-emerald-700 transition-all"
          >
            <Plus size={18} /> Шинэ хэлэлцүүлэг
          </button>
        </div>

        {/* Пост оруулах Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
              <h3 className="text-xl font-bold mb-4">Хэлэлцүүлэг эхлүүлэх</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                  type="text" placeholder="Гарчиг" 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-emerald-500"
                  value={title} onChange={(e) => setTitle(e.target.value)}
                />
                <textarea 
                  placeholder="Та юуны тухай хэлэлцмээр байна?" rows={4}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-emerald-500"
                  value={content} onChange={(e) => setContent(e.target.value)}
                ></textarea>
                <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                  <Send size={18} /> Нийтлэх
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Постууд */}
        {loading ? (
          <p className="text-center text-gray-500">Ачаалж байна...</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white p-6 rounded-2xl border border-emerald-50 shadow-sm hover:shadow-md transition-all">
                <h3 className="text-lg font-bold text-emerald-900 mb-2">{post.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.content}</p>
                <div className="flex items-center justify-between text-[12px] text-gray-400 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                      <User size={12} />
                    </div>
                    <span className="font-medium text-gray-700">{post.authorName}</span>
                  </div>
                  <span>{post.createdAt?.toDate().toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}