"use client"
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface SearchSectionProps {
    onSearchResults: (data: any[]) => void;
    setLoadingState: (loading: boolean) => void;
}

export default function SearchSection({ onSearchResults, setLoadingState }: SearchSectionProps) {
    const [userInput, setUserInput] = useState("");
    const [isLocalLoading, setIsLocalLoading] = useState(false);

    const handleSmartSearch = async () => {
        if (!userInput.trim()) return;
        
        setIsLocalLoading(true);
        setLoadingState(true);
        
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userInput })
            });
            const params = await res.json();

            if (params.isSearch) {
                const scholarshipRef = collection(db, "scholarships");
                let q = query(scholarshipRef);
                
                // 1. IELTS оноогоор шүүх (Тоо мөн эсэхийг шалгана)
                if (params.ielts) {
                    q = query(q, where("minIelts", "<=", Number(params.ielts)));
                }

                // 2. GPA оноогоор шүүх (ШИНЭ)
                if (params.gpa) {
                    q = query(q, where("minGpa", "<=", Number(params.gpa)));
                }
                
                // 3. Улсаар шүүх
                if (params.country) {
                    q = query(q, where("country", "==", params.country));
                }

                // 4. Боловсролын зэргээр шүүх (Bachelor, Master, PhD)
                if (params.degree) {
                    q = query(q, where("degree", "==", params.degree));
                }

                // 5. Түлхүүр үгээр шүүх
                if (params.keyword) {
                    q = query(q, where("category", "==", params.keyword));
                }

                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({ 
                    id: doc.id, 
                    ...doc.data() 
                }));
                
                onSearchResults(data);

                if (data.length === 0) {
                    console.log("Тохирох тэтгэлэг олдсонгүй.");
                }
            }
        } catch (error) {
            console.error("Search Error:", error);
        } finally {
            setIsLocalLoading(false);
            setLoadingState(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-lg">
            <input 
                className="flex-1 bg-transparent border-none text-white placeholder:text-emerald-100/50 focus:outline-none px-4 py-2"
                placeholder="Жишээ нь: Би IELTS 6-тай Солонгос явах тэтгэлэг хайж байна..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSmartSearch()}
            />
            <button 
                onClick={handleSmartSearch} 
                disabled={isLocalLoading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-md px-6 py-2 uppercase text-[10px] tracking-widest font-bold transition-all disabled:opacity-50"
            >
                {isLocalLoading ? "..." : "Хайх"}
            </button>
        </div>
    );
}