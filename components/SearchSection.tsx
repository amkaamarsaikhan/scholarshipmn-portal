"use client"
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

/** AI алдагдсан ч бичвэрээс TOPIK 1–6 олно */
function parseTopikFromMessage(text: string): number | null {
    const t = text.trim();
    const patterns = [
        /(?:topik|TOPIK|топик|Топик)[^0-9]{0,15}(\d)/iu,
        /(\d)[^0-9]{0,10}(?:топик|topik)/iu,
    ];
    for (const re of patterns) {
        const m = t.match(re);
        if (m) {
            const n = Number(m[1]);
            if (n >= 1 && n <= 6) return n;
        }
    }
    return null;
}

function asNumber(v: unknown): number | null {
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
    return null;
}

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

            const topikLevel = asNumber(params.topik) ?? parseTopikFromMessage(userInput);
            const ielts = asNumber(params.ielts);
            const gpa = asNumber(params.gpa);
            const german = asNumber(params.german);
            const hsk = asNumber(params.hsk);
            const jlpt = asNumber(params.jlpt);

            const hasAnyFilter =
                params.isSearch === true ||
                topikLevel != null ||
                ielts != null ||
                gpa != null ||
                german != null ||
                hsk != null ||
                jlpt != null ||
                Boolean(params.country) ||
                Boolean(params.degree) ||
                Boolean(params.keyword);

            if (hasAnyFilter) {
                const scholarshipRef = collection(db, "scholarships");
                let q = query(scholarshipRef);
                
                // 1. IELTS — тэтгэлгийн minIelts нь хэрэглэгчийн онооноос доош эсвэл тэнцүү
                if (ielts != null) {
                    q = query(q, where("minIelts", "<=", ielts));
                }

                // 2. GPA
                if (gpa != null) {
                    q = query(q, where("minGpa", "<=", gpa));
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

                // 6. TOPIK
                if (topikLevel != null) {
                    q = query(q, where("minTopik", "<=", topikLevel));
                }

                // 7. TestDaF / Герман
                if (german != null) {
                    q = query(q, where("minGerman", "<=", german));
                }

                // 8. HSK
                if (hsk != null) {
                    q = query(q, where("minHsk", "<=", hsk));
                }

                // 9. JLPT
                if (jlpt != null) {
                    q = query(q, where("minJlpt", "<=", jlpt));
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
        <div className="w-full min-w-0 max-w-3xl mx-auto flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-lg">
            <input 
                className="min-w-0 flex-1 bg-transparent border-none text-white placeholder:text-emerald-100/50 focus:outline-none px-2 py-2 sm:px-4"
                placeholder="Жишээ нь: Би IELTS 6-тай Солонгос явах тэтгэлэг хайж байна..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSmartSearch()}
            />
            <button 
                onClick={handleSmartSearch} 
                disabled={isLocalLoading}
                className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md px-3 py-2 sm:px-6 uppercase text-[10px] tracking-widest font-bold transition-all disabled:opacity-50"
            >
                {isLocalLoading ? "..." : "Хайх"}
            </button>
        </div>
    );
}