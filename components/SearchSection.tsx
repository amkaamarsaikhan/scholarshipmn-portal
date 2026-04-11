"use client"
import { useState } from 'react';
import { db } from '@/lib/firebase'; // Өөрийн firebase-ийн замаа шалгаарай
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function SearchSection() {
    const [userInput, setUserInput] = useState(""); // Хэрэглэгчийн бичиж буй текст
    const [results, setResults] = useState<any[]>([]); // Хайлтын үр дүн
    const [loading, setLoading] = useState(false);

    const handleSmartSearch = async () => {
        if (!userInput.trim()) return;
        
        setLoading(true);
        try {
            // 1. AI-аас параметрүүдээ авна
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userInput })
            });
            const params = await res.json();

            console.log("AI-аас ирсэн шүүлтүүр:", params);

            if (params.isSearch) {
                // 2. Firebase-ээс шүүх логик
                const scholarshipRef = collection(db, "scholarships");
                let q = query(scholarshipRef);
                
                // IELTS оноогоор шүүх
                if (params.ielts) {
                    q = query(q, where("minIelts", "<=", params.ielts));
                }
                
                // Улсаар шүүх
                if (params.country) {
                    q = query(q, where("country", "==", params.country));
                }

                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({ 
                    id: doc.id, 
                    ...doc.data() 
                }));
                
                setResults(data);
            } else {
                alert("Хайлт олдсонгүй. Илүү тодорхой бичнэ үү.");
            }
        } catch (error) {
            console.error("Search Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex flex-col md:flex-row gap-3 shadow-lg p-4 rounded-xl bg-white border">
                <input 
                    className="flex-1 p-3 outline-none border rounded-lg focus:ring-2 focus:ring-blue-400 text-gray-700"
                    placeholder="Жишээ нь: Би IELTS 6-тай Солонгос явах тэтгэлэг хайж байна..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSmartSearch()}
                />
                <button 
                    onClick={handleSmartSearch} 
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all disabled:bg-blue-300"
                >
                    {loading ? "Хайж байна..." : "Ухаалаг хайлт"}
                </button>
            </div>
            
            {/* Үр дүн харуулах хэсэг */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {results.length > 0 ? (
                    results.map((item) => (
                        <div key={item.id} className="border p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow bg-white">
                            <h3 className="font-bold text-lg text-blue-800">{item.title || item.name}</h3>
                            <p className="text-gray-600 mt-2">Улс: {item.country}</p>
                            <p className="text-sm font-medium text-green-600">IELTS: {item.minIelts}+</p>
                            <button className="mt-4 w-full bg-gray-100 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium">
                                Дэлгэрэнгүй
                            </button>
                        </div>
                    ))
                ) : (
                    !loading && results.length === 0 && (
                        <p className="text-center col-span-full text-gray-400 italic">
                            Хайлт хийх өгүүлбэрээ дээр бичнэ үү.
                        </p>
                    )
                )}
            </div>
        </div>
    );
}