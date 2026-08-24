"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

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

export type SearchFeedback =
    | { kind: "idle" }
    | { kind: "ok"; count: number }
    | { kind: "empty" }
    | { kind: "error" }
    | { kind: "unclear" };

interface SearchSectionProps {
    onSearchResults: (data: any[]) => void;
    setLoadingState: (loading: boolean) => void;
    onSearchFeedback?: (feedback: SearchFeedback) => void;
}

export default function SearchSection({
    onSearchResults,
    setLoadingState,
    onSearchFeedback,
}: SearchSectionProps) {
    const [userInput, setUserInput] = useState("");
    const [isLocalLoading, setIsLocalLoading] = useState(false);
    const [localFeedback, setLocalFeedback] = useState<SearchFeedback>({ kind: "idle" });

    const emitFeedback = (feedback: SearchFeedback) => {
        setLocalFeedback(feedback);
        onSearchFeedback?.(feedback);
    };

    const handleSmartSearch = async () => {
        if (!userInput.trim()) return;

        setIsLocalLoading(true);
        setLoadingState(true);
        emitFeedback({ kind: "idle" });

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userInput }),
            });
            if (!res.ok) throw new Error("search failed");
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

            if (!hasAnyFilter) {
                emitFeedback({ kind: "unclear" });
                return;
            }

            const scholarshipRef = collection(db, "scholarships");
            let q = query(scholarshipRef);

            if (ielts != null) {
                q = query(q, where("minIelts", "<=", ielts));
            }
            if (gpa != null) {
                q = query(q, where("minGpa", "<=", gpa));
            }
            if (params.country) {
                q = query(q, where("country", "==", params.country));
            }
            if (params.degree) {
                q = query(q, where("degree", "==", params.degree));
            }
            if (params.keyword) {
                q = query(q, where("category", "==", params.keyword));
            }
            if (topikLevel != null) {
                q = query(q, where("minTopik", "<=", topikLevel));
            }
            if (german != null) {
                q = query(q, where("minGerman", "<=", german));
            }
            if (hsk != null) {
                q = query(q, where("minHsk", "<=", hsk));
            }
            if (jlpt != null) {
                q = query(q, where("minJlpt", "<=", jlpt));
            }

            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            onSearchResults(data);
            emitFeedback(data.length === 0 ? { kind: "empty" } : { kind: "ok", count: data.length });
        } catch (error) {
            console.error("Search Error:", error);
            emitFeedback({ kind: "error" });
        } finally {
            setIsLocalLoading(false);
            setLoadingState(false);
        }
    };

    const feedbackText =
        localFeedback.kind === "empty"
            ? "Тохирох тэтгэлэг олдсонгүй. Шүүлтүүрээ өөрчилж үзнэ үү."
            : localFeedback.kind === "error"
              ? "Хайлт амжилтгүй боллоо. Дахин оролдоно уу."
              : localFeedback.kind === "unclear"
                ? "Улс, зэрэг, IELTS/GPA зэргийг тодорхой бичнэ үү."
                : localFeedback.kind === "ok"
                  ? `${localFeedback.count} тэтгэлэг олдлоо.`
                  : null;

    return (
        <div className="w-full min-w-0 max-w-3xl mx-auto">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-lg">
                <input
                    className="min-w-0 flex-1 bg-transparent border-none text-white placeholder:text-emerald-100/50 focus:outline-none px-2 py-2 sm:px-4"
                    placeholder="Жишээ: IELTS 6.0, Солонгос, бакалавр..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSmartSearch()}
                    aria-label="Тэтгэлэг хайх"
                />
                <button
                    onClick={handleSmartSearch}
                    disabled={isLocalLoading}
                    className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md px-3 py-2 sm:px-6 uppercase text-[10px] tracking-widest font-bold transition-all disabled:opacity-50"
                >
                    {isLocalLoading ? "Хайж байна..." : "Хайх"}
                </button>
            </div>
            {feedbackText && (
                <p
                    className={`mt-3 text-sm font-medium ${
                        localFeedback.kind === "ok" ? "text-emerald-200" : "text-amber-100"
                    }`}
                    role="status"
                >
                    {feedbackText}
                </p>
            )}
        </div>
    );
}
