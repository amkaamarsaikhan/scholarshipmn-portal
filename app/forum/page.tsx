"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { MessageSquare, Plus, Send, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

type Post = {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: any;
};

type Reply = {
  id: string;
  content: string;
  authorName: string;
  createdAt: any;
};

export default function ForumPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Шинэ пост бичих утгууд
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Сонгогдсон сэдэвийн reply-ууд
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyText, setReplyText] = useState("");

  // Постуудыг татаж авах
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsArray: Post[] = [];
      snapshot.forEach((doc) => {
        postsArray.push({ id: doc.id, ...(doc.data() as Post) });
      });
      setPosts(postsArray);
      setLoadingPosts(false);
    });
    return () => unsubscribe();
  }, []);

  // Сонгогдсон постын reply-уудыг татах
  useEffect(() => {
    if (!selectedPost) return;

    setLoadingReplies(true);
    const q = query(
      collection(db, "posts", selectedPost.id, "replies"),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const repliesArray: Reply[] = [];
      snapshot.forEach((doc) => {
        repliesArray.push({ id: doc.id, ...(doc.data() as Reply) });
      });
      setReplies(repliesArray);
      setLoadingReplies(false);
    });

    return () => unsubscribe();
  }, [selectedPost]);

  // Шинэ пост үүсгэх
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim() || !content.trim()) return;

    try {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        authorName: user.displayName || user.email || "Хэрэглэгч",
        authorId: user.uid,
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setContent("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Пост үүсгэхэд алдаа гарлаа:", error);
    }
  };

  // Reply бичих
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!replyText.trim() || !selectedPost) return;

    try {
      await addDoc(collection(db, "posts", selectedPost.id, "replies"), {
        content: replyText,
        authorName: user.displayName || user.email || "Хэрэглэгч",
        createdAt: serverTimestamp(),
      });
      setReplyText("");
    } catch (error) {
      console.error("Reply бичихэд алдаа гарлаа:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-emerald-600 py-10 text-white">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl font-bold flex justify-center items-center gap-2">
            <MessageSquare /> Форум
          </h1>
          <p className="opacity-80 mt-2">Мэдлэгээ хуваалцаж, хамтдаа хөгжицгөөе</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800">Сүүлийн хэлэлцүүлгүүд</h2>
          {user ? (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-600 text-white px-5 py-2 rounded-full font-semibold flex items-center gap-2 hover:bg-emerald-700 transition-all w-fit"
            >
              <Plus size={18} /> Шинэ хэлэлцүүлэг
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="bg-emerald-600 text-white px-5 py-2 rounded-full font-semibold flex items-center gap-2 hover:bg-emerald-700 transition-all w-fit"
            >
              Нэвтрээд бичих
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            {loadingPosts ? (
              <p className="text-center text-gray-500">Ачаалж байна...</p>
            ) : posts.length === 0 ? (
              <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
                Одоогоор хэлэлцүүлэг алга.
              </div>
            ) : (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                {posts.map((post) => (
                  <button
                    type="button"
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className={`w-full text-left cursor-pointer p-4 rounded-xl border ${
                      selectedPost?.id === post.id
                        ? "border-emerald-600 bg-emerald-100"
                        : "border-gray-200 bg-white"
                    } hover:shadow-lg transition`}
                  >
                    <h3 className="font-semibold">{post.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      {post.authorName ? `${post.authorName} · ` : ""}
                      {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : ""}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-lg flex flex-col max-h-[80vh]">
            {selectedPost ? (
              <>
                <h2 className="text-2xl font-bold mb-4">{selectedPost.title}</h2>
                <p className="mb-6 whitespace-pre-wrap">{selectedPost.content}</p>

                <div className="flex-1 overflow-y-auto mb-6 space-y-4 border-t border-gray-200 pt-4">
                  {loadingReplies ? (
                    <p className="text-center text-gray-500">Хариултууд ачаалж байна...</p>
                  ) : replies.length > 0 ? (
                    replies.map((reply) => (
                      <div key={reply.id} className="p-3 bg-emerald-50 rounded-xl shadow-sm">
                        <div className="text-sm font-semibold text-emerald-700 mb-1">{reply.authorName}</div>
                        <div className="text-gray-700 whitespace-pre-wrap">{reply.content}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {reply.createdAt?.toDate
                            ? reply.createdAt.toDate().toLocaleString()
                            : ""}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">Хариулт байхгүй байна.</p>
                  )}
                </div>

                {user ? (
                  <form onSubmit={handleSubmitReply} className="flex gap-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Хариулт бичих..."
                      className="flex-1 p-3 border border-gray-300 rounded-xl resize-none focus:outline-emerald-500"
                      rows={3}
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      aria-label="Илгээх"
                      className="bg-emerald-600 text-white px-6 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                ) : (
                  <p className="text-sm text-slate-500 text-center">
                    Хариулахын тулд{" "}
                    <Link href="/auth/login" className="text-emerald-600 font-bold hover:underline">
                      нэвтэрнэ үү
                    </Link>
                    .
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-center mt-10">Сэдэв сонгоно уу</p>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              aria-label="Хаах"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold mb-4">Хэлэлцүүлэг эхлүүлэх</h3>
            <form onSubmit={handleSubmitPost} className="space-y-4">
              <input
                type="text"
                placeholder="Гарчиг"
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-emerald-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Та юуны тухай хэлэлцмээр байна?"
                rows={4}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-emerald-500"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              ></textarea>
              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Send size={18} /> Нийтлэх
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}