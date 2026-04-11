"use client";

import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp, serverTimestamp } from "firebase/firestore";
import { useState, useEffect } from "react"; // useEffect нэмэв
import { Database, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";

const scholarshipsData = [
  {
    title: "University of Galway Global Achievement Scholarship",
    country: "Ireland",
    organization: "University of Galway",
    category: "Partial",
    deadline: "2026-05-31",
    link: "https://www.universityofgalway.ie/international-students/feesandfunding/scholarships/",
    description: "Академик өндөр амжилттай олон улсын оюутнуудад зориулж сургалтын төлбөрөөс €2,000-аас €5,000 хүртэлх хөнгөлөлт үзүүлдэг.",
    minIelts: 6.5,
    minGpa: 3.0,
    minHsk: 0,
    minTopik: 0,
    minJlpt: 0,
    minGerman: 0,
    degree: "Bachelor / Master",
    requirements: [
      "Acceptance of an offer for an eligible program",
      "High academic standards",
      "Personal statement"
    ],
    checklist: [
      "Letter of Acceptance",
      "Academic Transcripts",
      "Scholarship Statement"
    ]
  },
  {
    title: "DCU International Merit Scholarship",
    country: "Ireland",
    organization: "Dublin City University",
    category: "Partial",
    deadline: "2026-06-15",
    link: "https://www.dcu.ie/international/international-scholarships",
    description: "Dublin City University-д суралцах хүсэлтэй, өмнөх шатны боловсролын гүйцэтгэл өндөр оюутнуудад олгодог сургалтын төлбөрийн хөнгөлөлт.",
    minIelts: 6.5,
    minGpa: 3.3,
    minHsk: 0,
    minTopik: 0,
    minJlpt: 0,
    minGerman: 0,
    degree: "Bachelor / Master",
    requirements: [
      "First-time applicant to DCU",
      "Proof of high academic achievement",
      "Full offer from DCU"
    ],
    checklist: [
      "DCU Offer Letter",
      "CV",
      "Academic Certificates"
    ]
  },
  {
    title: "UCC Excellence Scholarships",
    country: "Ireland",
    organization: "University College Cork",
    category: "Partial",
    deadline: "2026-05-01",
    link: "https://www.ucc.ie/en/international/studyatucc/scholarshipsandfunding/",
    description: "UCC-ийн сургууль бүрээс (Бизнес, Хууль, Технологи) олгодог, олон улсын шилдэг оюутнуудыг дэмжих €5,000 хүртэлх тэтгэлэг.",
    minIelts: 6.5,
    minGpa: 3.5,
    minHsk: 0,
    minTopik: 0,
    minJlpt: 0,
    minGerman: 0,
    degree: "Master",
    requirements: [
      "Exceptional academic record",
      "Applied to an eligible postgraduate program at UCC"
    ],
    checklist: [
      "Proof of Application",
      "Academic Reference",
      "Research Proposal (if applicable)"
    ]
  },
  {
    title: "Maynooth University Taught Postgraduate Scholarship",
    country: "Ireland",
    organization: "Maynooth University",
    category: "Partial",
    deadline: "2026-04-30",
    link: "https://www.maynoothuniversity.ie/study-maynooth/postgraduate-studies/fees-funding-scholarships",
    description: "Мэйнут их сургуулийн Мастерын хөтөлбөрт нэг жилийн хугацаатай суралцах оюутнуудад зориулсан €2,000-ын тэтгэлэг.",
    minIelts: 6.5,
    minGpa: 3.2,
    minHsk: 0,
    minTopik: 0,
    minJlpt: 0,
    minGerman: 0,
    degree: "Master",
    requirements: [
      "Open to all international applicants",
      "Based on undergraduate academic achievement"
    ],
    checklist: [
      "Official Transcripts",
      "Degree Certificate",
      "Passport Copy"
    ]
  },
  {
    title: "TUS International Student Scholarship",
    country: "Ireland",
    organization: "Technological University of the Shannon",
    category: "Partial",
    deadline: "2026-07-01",
    link: "https://tus.ie/international/scholarships/",
    description: "Технологийн чиглэлээр Айрландад суралцах хүсэлтэй оюутнуудад зориулсан 20-30%-ийн төлбөрийн хөнгөлөлт.",
    minIelts: 6.0,
    minGpa: 2.8,
    minHsk: 0,
    minTopik: 0,
    minJlpt: 0,
    minGerman: 0,
    degree: "Bachelor / Master",
    requirements: [
      "Academic excellence in previous studies",
      "Statement of purpose"
    ],
    checklist: [
      "TUS Application Reference",
      "Motivation Letter",
      "IELTS Certificate"
    ]
  }
];

export default function ImportPage() {
    const [status, setStatus] = useState("Бэлэн");
    const [progress, setProgress] = useState(0);
    const [isImporting, setIsImporting] = useState(false);

    // Render-ийн алдаанаас сэргийлж, Client дээр ажиллаж буйг баталгаажуулах
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const startImport = async () => {
        if (isImporting) return;
        
        const confirmAction = confirm(`Та ${scholarshipsData.length} тэтгэлэг оруулах уу?`);
        if (!confirmAction) return;

        setIsImporting(true);
        setStatus("Импорт эхэллээ...");
        let count = 0;

        try {
            const colRef = collection(db, "scholarships");
            for (const item of scholarshipsData) {
                await addDoc(colRef, {
                    ...item,
                    minHsk: item.minHsk ?? 0,
                    minTopik: item.minTopik ?? 0,
                    minJlpt: item.minJlpt ?? 0,
                    minGerman: item.minGerman ?? 0,
                    type: (item as { type?: string; category: string }).type ?? item.category ?? "Full Fund",
                    deadline: Timestamp.fromDate(new Date(item.deadline)),
                    createdAt: serverTimestamp(),
                    lastViewedAt: serverTimestamp()
                });
                count++;
                setProgress(Math.round((count / scholarshipsData.length) * 100));
            }
            setStatus(`Амжилттай! ${count} тэтгэлэг баазад орлоо.`);
        } catch (err) {
            console.error(err);
            setStatus("Алдаа гарлаа.");
        } finally {
            setIsImporting(false);
        }
    };

    if (!isMounted) return null; // Server-side prerender хийх үед хоосон буцаана

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f172a] text-white p-6">
            <div className="bg-[#1e293b] p-10 rounded-[2.5rem] shadow-2xl border border-white/5 w-full max-w-lg text-center relative overflow-hidden">
                <div className="relative z-10">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                        <Database className="text-emerald-400" size={40} />
                    </div>
                    <h1 className="text-3xl font-black mb-2 tracking-tighter uppercase">Data Seeder v2</h1>
                    <p className="text-slate-400 text-sm mb-10 font-medium">Firestore-руу {scholarshipsData.length} өгөгдөл хуулах</p>

                    <div className="space-y-4 mb-10 text-left">
                        <div className="w-full bg-slate-800 rounded-full h-3">
                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                    </div>

                    <button
                        onClick={startImport}
                        disabled={isImporting}
                        className="w-full h-16 rounded-2xl font-black bg-white text-black hover:bg-emerald-400 transition-all"
                    >
                        {isImporting ? "Хуулж байна..." : "Өгөгдлийг хуулах"}
                    </button>
                    <div className="mt-8 text-xs font-bold text-slate-500">{status}</div>
                </div>
            </div>
        </div>
    );
}