"use client";

import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, getDocs, query, where, Timestamp, serverTimestamp } from "firebase/firestore";
import { useState, useEffect } from "react"; // useEffect нэмэв
import { Database } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";

const scholarshipsData = [
  {
    "title": "DSU Regional Scholarship (Tuscany Region)",
    "country": "Italy",
    "organization": "Azienda DSU Toscana",
    "category": "Full",
    "deadline": "2026-09-07",
    "link": "https://www.dsu.toscana.it/",
    "description": "Сургалтын төлбөрөөс бүрэн чөлөөлөхөөс гадна үнэгүй байр, хоол болон жилд 6000+ еврогийн тэтгэмж олгоно. Гэр бүлийн орлого дээр суурилдаг. 2026/27: бакалавр/магистр 2026.09.07 хүртэл (PhD: 2026.11.16).",
    "minIelts": 6.0,
    "minGpa": 2.5,
    "minHsk": 0,
    "minTopik": 0,
    "minJlpt": 0,
    "minGerman": 0,
    "degree": "Bachelor / Master / PhD",
    "requirements": [
      "Family Income Certificate (ISEE Parificato)",
      "University enrollment in Tuscany region",
      "No previous degree at the same level"
    ],
    "checklist": [
      "ISEE-U calculation document",
      "Passport and Visa",
      "Family Composition Certificate"
    ]
  },
  {
    "title": "Invest Your Talent in Italy (IYT)",
    "country": "Italy",
    "organization": "Ministry of Foreign Affairs",
    "category": "Full",
    "deadline": "2026-05-11",
    "link": "https://investyourtalentitaly.esteri.it/",
    "description": "Инженер, архитектур, дизайн, эдийн засгийн чиглэлээр суралцах оюутнуудад зориулсан засгийн газрын тэтгэлэг. Дадлага хийх боломжоор хангана.",
    "minIelts": 6.5,
    "minGpa": 3.0,
    "minHsk": 0,
    "minTopik": 0,
    "minJlpt": 0,
    "minGerman": 0,
    "degree": "Master",
    "requirements": [
      "Citizen of Mongolia",
      "Age under 26 at the time of application",
      "Strong academic background"
    ],
    "checklist": [
      "Video Essay (Max 1 minute)",
      "University Admission Letter",
      "Academic Transcripts"
    ]
  },
  {
    "title": "MAECI Scholarships for International Students",
    "country": "Italy",
    "organization": "Ministry of Foreign Affairs and International Cooperation",
    "category": "Full",
    "deadline": "2026-03-26",
    "link": "https://studyinitaly.esteri.it/",
    "description": "Италийн Засгийн газраас гадаадын оюутнуудад олгодог 9 сарын хугацаатай сургалтын төлбөр болон амьжиргааны тэтгэлэг.",
    "minIelts": 6.0,
    "minGpa": 2.8,
    "minHsk": 0,
    "minTopik": 0,
    "minJlpt": 0,
    "minGerman": 0,
    "degree": "Master / PhD",
    "requirements": [
      "Admission to an Italian University",
      "Age limit (usually under 28 for Master)",
      "Language proficiency in English or Italian"
    ],
    "checklist": [
      "Curriculum Vitae (CV)",
      "Final Academic Certificate",
      "Letter of Motivation"
    ]
  },
  {
    "title": "France-Mongolia Joint Scholarship",
    "country": "France",
    "organization": "Embassy of France in Mongolia / Ministry of Education",
    "category": "Full",
    "deadline": "2026-05-16",
    "link": "https://mn.ambafrance.org/",
    "description": "Монгол Улсын БШУЯ болон Францын Элчин сайдын яамны хамтарсан тэтгэлэг. Магистр, Докторын түвшинд суралцах оюутнуудын зардлыг бүрэн хариуцна.",
    "minIelts": 6.5,
    "minGpa": 3.2,
    "minHsk": 0,
    "minTopik": 0,
    "minJlpt": 0,
    "minGerman": 0,
    "degree": "Master / PhD",
    "requirements": [
      "Mongolian citizenship",
      "Excellent academic record",
      "Field of study must be a priority for Mongolia"
    ],
    "checklist": [
      "Study Plan / Research Project",
      "CV in French or English",
      "Diplomas and Transcripts"
    ]
  },
  {
    "title": "Eiffel Excellence Scholarship Program",
    "country": "France",
    "organization": "Campus France",
    "category": "Full",
    "deadline": "2026-01-08",
    "link": "https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence",
    "description": "Францын ГХЯ-наас олгодог хамгийн нэр хүндтэй тэтгэлэг. Сар бүрийн 1,181€ (Master) - 1,800€ (PhD) тэтгэмж, эрүүл мэндийн даатгал, ирэх очих нислэгийн зардлыг даана.",
    "minIelts": 7.0,
    "minGpa": 3.5,
    "minHsk": 0,
    "minTopik": 0,
    "minJlpt": 0,
    "minGerman": 0,
    "degree": "Master / PhD",
    "requirements": [
      "Nomination by a French Higher Education Institution",
      "Age limit: 27 for Master, 32 for PhD",
      "First-time applicants only"
    ],
    "checklist": [
      "University Nomination Form",
      "Professional Project Statement",
      "Language Proficiency Certificate"
    ]
  },
  {
    "title": "Emile Boutmy Scholarship (Sciences Po)",
    "country": "France",
    "organization": "Sciences Po University",
    "category": "Partial / Full",
    "deadline": "2026-01-20",
    "link": "https://www.sciencespo.fr/students/en/fees-funding/financial-aid/emile-boutmy-scholarship/",
    "description": "Европын холбооны бус орнуудын шилдэг оюутнуудад зориулсан тэтгэлэг. Сургалтын төлбөрөөс 3,000€-оос 13,000€ хүртэлх хөнгөлөлт үзүүлнэ.",
    "minIelts": 7.0,
    "minGpa": 3.3,
    "minHsk": 0,
    "minTopik": 0,
    "minJlpt": 0,
    "minGerman": 0,
    "degree": "Bachelor / Master",
    "requirements": [
      "First time applicant from a non-EU state",
      "Admitted to Sciences Po's undergraduate or graduate program",
      "Social criteria and academic excellence"
    ],
    "checklist": [
      "Tax returns or proof of income",
      "Curriculum Vitae",
      "Two Academic References"
    ]
  },
  {
    "title": "Stefan Banach Scholarship Programme",
    "country": "Poland",
    "organization": "Polish National Agency for Academic Exchange (NAWA)",
    "category": "Full",
    "deadline": "2026-05-08",
    "link": "https://nawa.gov.pl/en/students/foreign-students/the-banach-scholarship-programme",
    "description": "Монгол оюутнуудад зориулсан хамгийн том тэтгэлэг. Инженерчлэл, байгалийн шинжлэх ухаан, хөдөө аж ахуйн чиглэлээр Магистрт суралцах зардлыг бүрэн даана.",
    "minIelts": 6.0,
    "minGpa": 3.0,
    "minHsk": 0,
    "minTopik": 0,
    "minJlpt": 0,
    "minGerman": 0,
    "degree": "Master",
    "requirements": [
      "Citizen of Mongolia",
      "Bachelor's degree obtained not earlier than 2024 (or final year student)",
      "Not having a previous Master's degree"
    ],
    "checklist": [
      "Passport scan",
      "Bachelor's Diploma or Certificate of Student Status",
      "English (B2) or Polish language certificate"
    ]
  },
  {
    "title": "Jagiellonian University Scholarship",
    "country": "Poland",
    "organization": "Jagiellonian University in Krakow",
    "category": "Full",
    "deadline": "2026-04-15",
    "link": "https://welcome.uj.edu.pl/en_GB/admission/scholarships",
    "description": "Польшийн хамгийн эртний, нэр хүндтэй сургуулиас олгодог тэтгэлэг. Сургалтын төлбөрөөс чөлөөлөхөөс гадна сар бүр 1,500 PLN тэтгэмж олгоно.",
    "minIelts": 6.5,
    "minGpa": 3.0,
    "minHsk": 0,
    "minTopik": 0,
    "minJlpt": 0,
    "minGerman": 0,
    "degree": "Bachelor / Master / PhD",
    "requirements": [
      "High academic performance (GPA > 85%)",
      "Admission to a program at Jagiellonian University",
      "Strong motivation and recommendation letters"
    ],
    "checklist": [
      "Curriculum Vitae (CV)",
      "Motivation Letter",
      "Two Recommendation Letters"
    ]
  },
  {
    "title": "Lane Kirkland Scholarship Program",
    "country": "Poland",
    "organization": "Leaders of Change Foundation / NAWA",
    "category": "Full",
    "deadline": "2026-03-01",
    "link": "https://kirkland.edu.pl/en/",
    "description": "2-аас доошгүй жил ажилласан туршлагатай залуу удирдагч, мэргэжилтнүүдэд зориулсан 2 семестрийн судалгааны тэтгэлэг. Хугацаа жил бүрийн 3-р сарын 1. 2026–27 дуудлагын улсын жагсаалтад Монгол ороогүй байсан тул дараагийн ээлжийг kirkland.edu.pl дээр шалгана уу.",
    "minIelts": 6.0,
    "minGpa": 2.8,
    "minHsk": 0,
    "minTopik": 0,
    "minJlpt": 0,
    "minGerman": 0,
    "degree": "Post-graduate / Professional",
    "requirements": [
      "Up to 40 years of age",
      "At least 2 years of professional experience",
      "Knowledge of Polish (A1/A2) or English (B2)"
    ],
    "checklist": [
      "Diplomas and Transcripts",
      "Two Letters of Recommendation",
      "Professional Internship Plan"
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
        
        const confirmAction = confirm(
            `${scholarshipsData.length} тэтгэлэгийг нэрээр нь хайж шинэчлэх үү?\n\nБайгаа бичлэгийн ID хадгалагдана — хэрэглэгчийн хадгалсан жагсаалт устахгүй.`
        );
        if (!confirmAction) return;

        setIsImporting(true);
        setStatus("Шинэчилж байна...");
        let updated = 0;
        let created = 0;

        try {
            const colRef = collection(db, "scholarships");
            for (let i = 0; i < scholarshipsData.length; i++) {
                const item = scholarshipsData[i];
                const payload = {
                    ...item,
                    minHsk: item.minHsk ?? 0,
                    minTopik: item.minTopik ?? 0,
                    minJlpt: item.minJlpt ?? 0,
                    minGerman: item.minGerman ?? 0,
                    type: (item as { type?: string; category: string }).type ?? item.category ?? "Full Fund",
                    deadline: Timestamp.fromDate(new Date(item.deadline)),
                    updatedAt: serverTimestamp(),
                };

                const existing = await getDocs(query(colRef, where("title", "==", item.title)));
                if (existing.empty) {
                    await addDoc(colRef, {
                        ...payload,
                        createdAt: serverTimestamp(),
                        lastViewedAt: serverTimestamp(),
                    });
                    created++;
                } else {
                    for (const docSnap of existing.docs) {
                        await updateDoc(docSnap.ref, payload);
                        updated++;
                    }
                }
                setProgress(Math.round(((i + 1) / scholarshipsData.length) * 100));
            }
            setStatus(`Дууслаа. Шинэчилсэн: ${updated}, шинээр нэмсэн: ${created}.`);
        } catch (err) {
            console.error(err);
            setStatus("Алдаа гарлаа.");
        } finally {
            setIsImporting(false);
        }
    };

    if (!isMounted) return null; // Server-side prerender хийх үед хоосон буцаана

    return (
        <AdminGuard>
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f172a] text-white p-6">
            <div className="bg-[#1e293b] p-10 rounded-[2.5rem] shadow-2xl border border-white/5 w-full max-w-lg text-center relative overflow-hidden">
                <div className="relative z-10">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                        <Database className="text-emerald-400" size={40} />
                    </div>
                    <h1 className="text-3xl font-black mb-2 tracking-tighter uppercase">Өгөгдөл шинэчлэх</h1>
                    <p className="text-slate-400 text-sm mb-10 font-medium leading-relaxed">
                        {scholarshipsData.length} тэтгэлэгийг нэрээр нь олж deadline-ийг шинэчилнэ. Document ID хэвээр үлдэх тул хадгалсан тэтгэлэг устахгүй.
                    </p>

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
                        {isImporting ? "Шинэчилж байна..." : "Deadline шинэчлэх"}
                    </button>
                    <div className="mt-8 text-xs font-bold text-slate-500">{status}</div>
                </div>
            </div>
        </div>
        </AdminGuard>
    );
}