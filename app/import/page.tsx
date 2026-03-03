"use client";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useState } from "react";
import { Database, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";

const scholarshipsData = [
  // --- 1-10: ЗАСГИЙН ГАЗРЫН БҮРЭН ТЭТГЭЛЭГ (Хамгийн өндөр квоттой) ---
  { 
    title: "Stipendium Hungaricum", country: "Hungary", organization: "Tempus Public Foundation", category: "Full", deadline: "2026-01-15", link: "https://stipendiumhungaricum.hu", 
    description: "Унгарын засгийн газрын тэтгэлэг. Жил бүр Монгол Улсад 200 квот олгодог, хамгийн хүртээмжтэй тэтгэлэг.",
    requirements: ["IELTS 5.5+", "Голч дүн 3.0+", "БШУЯ-ны бүртгэл", "Эрүүл мэндийн шинжилгээ"],
    checklist: ["DreamApply Online Application", "Study Plan (Min 3000 chars)", "Motivation Letter", "Medical Certificate", "Passport Copy"]
  },
  { 
    title: "Australia Awards Mongolia", country: "Australia", organization: "DFAT", category: "Full", deadline: "2026-04-30", link: "https://www.australiaawardsmongolia.org", 
    description: "Австралид магистрт суралцах бүрэн тэтгэлэг. Төрийн болон хувийн хэвшлийнхэнд тусдаа квоттой.",
    requirements: ["IELTS 6.5+ (no band < 6.0)", "2 жил ажилласан туршлага", "Бакалаврын зэрэг", "Монголын хөгжилд хувь нэмэр оруулах"],
    checklist: ["OASIS Application", "Employer Support Letter", "Relevance Statement", "Transcripts (Notarized English)"]
  },
  { 
    title: "Global Korea Scholarship (GKS)", country: "South Korea", organization: "NIIED", category: "Full", deadline: "2026-03-15", link: "https://www.studyinkorea.go.kr", 
    description: "БНСУ-ын Засгийн газрын тэтгэлэг. ЭСЯ-ны квот болон Их сургуулийн квот гэсэн 2 замаар өгөх боломжтой.",
    requirements: ["GPA 80%+", "Нас 25/40-өөс доош", "Бакалавр/Магистрын диплом", "Солонгос хэлний бэлтгэл 1 жил"],
    checklist: ["Application Forms (1-10)", "Personal Statement", "Study Plan", "2 Recommendation Letters", "Medical Assessment"]
  },
  { 
    title: "MEXT (Monbukagakusho)", country: "Japan", organization: "MEXT", category: "Full", deadline: "2026-05-20", link: "https://www.mn.emb-japan.go.jp", 
    description: "Японы засгийн газрын тэтгэлэг. Шалгалт дээр суурилдаг бөгөөд судалгааны ажил маш чухал.",
    requirements: ["Япон эсвэл Англи хэлний мэдлэг", "Математикийн шалгалт", "Судалгааны төлөвлөгөө", "Насны хязгаартай"],
    checklist: ["Application Form", "Field of Study & Research Plan", "Placement Preference Form", "Medical Certificate"]
  },
  { 
    title: "Chevening Scholarship", country: "UK", organization: "FCDO", category: "Full", deadline: "2026-11-01", link: "https://www.chevening.org/scholarship/mongolia/", 
    description: "Их Британийн магистрын бүрэн тэтгэлэг. Манлайлагч, ирээдүйн шийдвэр гаргагчдад зориулсан.",
    requirements: ["2 жил ажилласан туршлага (2800 цаг)", "Бакалаврын диплом", "Их Британийн 3 сургууль сонгох", "Манлайлах чадвар"],
    checklist: ["4 Essays (Leadership, Networking, Study in UK, Career Plan)", "2 Reference Letters", "Passport", "Education Docs"]
  },
  { 
    title: "Fulbright Foreign Student Program", country: "USA", organization: "State Department", category: "Full", deadline: "2026-05-15", link: "https://mn.usembassy.gov", 
    description: "АНУ-ын Засгийн газрын магистрын тэтгэлэг. Монгол дахь ЭСЯ-аар дамжуулан сонгон шалгаруулдаг.",
    requirements: ["IELTS 7.0+ / TOEFL 80+", "2 жил ажилласан туршлага", "Монголд оршин сууж байх", "Бакалаврын зэрэг"],
    checklist: ["Online Application", "Personal Statement", "Study Objectives Essay", "3 Letters of Recommendation", "Transcripts"]
  },
  { 
    title: "DAAD EPOS Scholarship", country: "Germany", organization: "DAAD", category: "Full", deadline: "2026-10-31", link: "https://www.daad.de", 
    description: "Германд хөгжлийн чиглэлээр магистр, докторт суралцах мэргэжилтнүүдэд зориулсан тэтгэлэг.",
    requirements: ["2 жил мэргэжлээрээ ажилласан", "IELTS/TOEFL эсвэл Герман хэл", "Бакалавр төгссөнөөс хойш 6 жил болоогүй"],
    checklist: ["DAAD Application Form", "Hand-signed CV (Europass)", "Motivation Letter", "Employer Reference", "Proof of Work"]
  },
  { 
    title: "Chinese Government Scholarship (CSC)", country: "China", organization: "CSC", category: "Full", deadline: "2026-03-31", link: "https://www.campuschina.org", 
    description: "Хятадын засгийн газрын тэтгэлэг (Type A/B). БШУЯ-аар дамжуулах эсвэл сургуульдаа шууд хандах боломжтой.",
    requirements: ["HSK 4+ (Хятад хэл дээр сурах бол)", "GPA 3.0+", "Эрүүл мэнд сайн байх", "Насны хязгаартай"],
    checklist: ["CSC Online Form", "Physical Examination Form", "Non-criminal Record", "Study Plan", "2 Recommendation Letters"]
  },
  { 
    title: "Türkiye Bursları", country: "Turkey", organization: "YTB", category: "Full", deadline: "2026-02-20", link: "https://www.turkiyeburslari.gov.tr", 
    description: "Туркийн бүх шатны (Бакалавр, Магистр, Доктор) бүрэн тэтгэлэг. Монголчууд маш ихээр хамрагддаг.",
    requirements: ["GPA 70% (Bachelor) / 75% (Graduate)", "Нас 21/30/35-аас доош", "Турк хэлний бэлтгэл 1 жил"],
    checklist: ["ID/Passport", "Transcript", "Diploma", "Letter of Intent", "Research Proposal (Graduate only)"]
  },
  { 
    title: "Taiwan MOE Scholarship", country: "Taiwan", organization: "MOE", category: "Full", deadline: "2026-03-31", link: "https://www.roc-taiwan.org/mn_mn/", 
    description: "Тайванийн Төлөөлөгчийн газраар дамжуулан Монголчуудад олгодог тэтгэлэг.",
    requirements: ["English or Chinese proficiency", "ROC Partner Uni admission", "High academic performance", "No other scholarship"],
    checklist: ["Online Application", "Diploma", "Transcripts", "2 Recommendation Letters", "Study Plan"]
  },

  // --- 11-20: ОЛОН УЛСЫН & ЕВРОПЫН САНГИЙН ТЭТГЭЛЭГ ---
  { 
    title: "Erasmus Mundus Joint Masters", country: "Europe", organization: "EU Commission", category: "Full", deadline: "2026-02-15", link: "https://erasmus-plus.ec.europa.eu", 
    description: "Европын холбооны 2-оос дээш улсад дамжин суралцах магистрын тэтгэлэг. Тэтгэмж маш өндөр.",
    requirements: ["IELTS 6.5+", "Бакалаврын зэрэг", "Academic excellence", "International mindset"],
    checklist: ["Common Application", "CV Europass", "2 Reference Letters", "Motivation Letter", "Proof of Residence"]
  },
  { 
    title: "Swedish Institute SISGP", country: "Sweden", organization: "Swedish Institute", category: "Full", deadline: "2026-02-15", link: "https://si.se", 
    description: "Шведийн засгийн газрын магистрын тэтгэлэг. Монгол улс хамрагдах боломжтой орны жагсаалтад бий.",
    requirements: ["3,000 цагийн ажлын туршлага", "Citizen of SI country", "Leadership experience", "Master's admission in Sweden"],
    checklist: ["CV (SI Template)", "Proof of Work Experience", "2 Reference Letters", "Motivation Letter"]
  },
  { 
    title: "Eiffel Excellence Scholarship", country: "France", organization: "Campus France", category: "Full", deadline: "2026-01-10", link: "https://www.campusfrance.org", 
    description: "Францын засгийн газрын магистр, докторт суралцах шилдэг оюутны тэтгэлэг.",
    requirements: ["Top tier academic performance", "French/English skill", "Applied via French University", "Ages under 25/30"],
    checklist: ["Curriculum Vitae", "Motivation Letter", "Professional Project", "Academic Transcripts"]
  },
  { 
    title: "Orange Knowledge Program (OKP)", country: "Netherlands", organization: "Nuffic", category: "Full", deadline: "2026-03-15", link: "https://www.studyinholland.nl", 
    description: "Нидерландад хөгжлийн чиглэлээр магистрт суралцах мэргэжилтнүүдэд зориулсан.",
    requirements: ["Employer Statement", "Passport of OKP country", "English proficiency", "Professional experience"],
    checklist: ["Employer Statement", "Passport Copy", "Motivation Letter", "Admission Letter"]
  },
  { 
    title: "VLIR-UOS Scholarships", country: "Belgium", organization: "VLIR-UOS", category: "Full", deadline: "2026-02-01", link: "https://www.vliruos.be", 
    description: "Бельгид хөгжлийн асуудлаар магистрт суралцах бүрэн тэтгэлэг.",
    requirements: ["Under 35 years old", "Citizen of partner country", "English proficiency", "Academic background"],
    checklist: ["Application Form", "Passport Copy", "Motivation Essay", "Reference Letters"]
  },
  { 
    title: "Stipendium Hungaricum (PhD)", country: "Hungary", organization: "TPF", category: "Full", deadline: "2026-01-15", link: "https://stipendiumhungaricum.hu", 
    description: "Унгарт докторын зэрэг хамгаалахад зориулсан бүрэн тэтгэлэг.",
    requirements: ["Master's degree", "Supervisor Acceptance", "Research Proposal", "English proficiency"],
    checklist: ["Research Plan", "Acceptance from Supervisor", "Transcripts", "Medical Certificate"]
  },
  { 
    title: "Invest Your Talent in Italy", country: "Italy", organization: "MAECI", category: "Full", deadline: "2026-03-01", link: "https://investyourtalentitaly.esteri.it", 
    description: "Италид Инженер, Дизайн, Менежментээр магистрт сурч, дадлага хийх хөтөлбөр.",
    requirements: ["Bachelor degree", "IELTS 6.0+", "Portfolio (if Design)", "Mongolian citizen"],
    checklist: ["Video CV (1 min)", "Motivation Letter", "Admission Proof", "Transcripts"]
  },
  { 
    title: "Swiss Gov Excellence Scholarships", country: "Switzerland", organization: "SBFN", category: "Full", deadline: "2025-11-30", link: "https://www.sbfi.admin.ch", 
    description: "Швейцарийн засгийн газрын судалгаа, докторын тэтгэлэг.",
    requirements: ["Master's degree", "Swiss Professor contact", "Research project", "Under 35 years old"],
    checklist: ["Application Form", "Research Proposal", "Contact with Supervisor", "CV"]
  },
  { 
    title: "Hubert H. Humphrey Fellowship", country: "USA", organization: "US Embassy", category: "Full", deadline: "2026-06-01", link: "https://www.humphreyfellowship.org", 
    description: "АНУ-д мэргэжил дээшлүүлэх, туршлага солилцох 10 сарын хөтөлбөр.",
    requirements: ["5 years work experience", "English proficiency", "Leadership potential", "Bachelor degree"],
    checklist: ["Program Plan", "Employer Support", "Essays", "CV"]
  },
  { 
    title: "Joint Japan/World Bank (JJ/WBGSP)", country: "Global", organization: "World Bank", category: "Full", deadline: "2026-05-20", link: "https://www.worldbank.org", 
    description: "Хөгжлийн бодлогын чиглэлээр магистрт суралцагсдад зориулсан.",
    requirements: ["3 years work experience", "Bachelor degree", "Developing country citizen", "Return to home country"],
    checklist: ["Admission Proof", "Employer Certificate", "2 Recommendation Letters", "Medical Form"]
  },

  // --- 21-30: ТОП ИХ СУРГУУЛИУДЫН ТЭТГЭЛЭГ ---
  { 
    title: "Gates Cambridge Scholarship", country: "UK", organization: "Cambridge", category: "Full", deadline: "2026-01-05", link: "https://www.gatescambridge.org", 
    description: "Кэмбрижийн их сургуулийн дэлхийн манлайлагчдад зориулсан.",
    requirements: ["Outstanding intellect", "Leadership potential", "Cambridge Graduate Admission", "Commitment to others"],
    checklist: ["Gates Statement", "Research Proposal", "3 References", "CV"]
  },
  { 
    title: "Knight-Hennessy Scholars", country: "USA", organization: "Stanford", category: "Full", deadline: "2025-10-10", link: "https://knight-hennessy.stanford.edu", 
    description: "Стэнфордын их сургуулийн шилдэг оюутнуудын тэтгэлэг.",
    requirements: ["Stanford Admission", "Independent thought", "Civic mindset", "Purposeful leadership"],
    checklist: ["Resume", "Essays", "Video Story", "2 Recommendations"]
  },
  { 
    title: "Schwarzman Scholars", country: "China", organization: "Tsinghua", category: "Full", deadline: "2025-09-20", link: "https://www.schwarzmanscholars.org", 
    description: "Хятадын Цинхуа их сургуульд магистрт суралцах олон улсын тэтгэлэг.",
    requirements: ["Ages 18-28", "Bachelor degree", "English proficiency", "Global leadership interest"],
    checklist: ["Essays", "CV", "3 Recommendations", "Video Intro"]
  },
  { 
    title: "Lester B. Pearson Scholarship", country: "Canada", organization: "UofT", category: "Full", deadline: "2026-01-15", link: "https://future.utoronto.ca", 
    description: "Торонтогийн их сургуулийн бакалаврын тэтгэлэг.",
    requirements: ["International student", "School nomination", "Original thinker", "Academic excellence"],
    checklist: ["School Nomination", "Online Application", "Student Essays", "References"]
  },
  { 
    title: "KAIST Undergraduate Scholarship", country: "South Korea", organization: "KAIST", category: "Full", deadline: "2026-01-05", link: "https://admission.kaist.ac.kr", 
    description: "Солонгосын шинжлэх ухаан, технологийн шилдэг сургууль.",
    requirements: ["High school graduate", "English proficiency", "Strong STEM background", "Financial need"],
    checklist: ["Transcript", "Recommendation Letter", "English Score", "Identity Proof"]
  },
  { 
    title: "Rhodes Scholarship", country: "UK", organization: "Oxford", category: "Full", deadline: "2025-10-01", link: "https://www.rhodeshouse.ox.ac.uk", 
    description: "Оксфордын их сургуулийн хамгийн нэр хүндтэй тэтгэлэг.",
    requirements: ["High academic record", "Leadership", "Ages 18-24", "Oxford admission"],
    checklist: ["Personal Statement", "List of Activities", "6 References", "Proof of Identity"]
  },
  { 
    title: "UST PhD Scholarship", country: "South Korea", organization: "UST", category: "Full", deadline: "2026-04-10", link: "https://ust.ac.kr", 
    description: "Солонгосын Эрдэм шинжилгээний хүрээлэнгүүдэд судалгаа хийх PhD.",
    requirements: ["Master's degree", "IELTS/TOEFL score", "STEM field background", "Research interest"],
    checklist: ["Research Proposal", "Master's Thesis", "Transcripts", "Language Certificate"]
  },
  { 
    title: "Clarendon Fund", country: "UK", organization: "Oxford", category: "Full", deadline: "2026-01-20", link: "https://www.ox.ac.uk/clarendon", 
    description: "Оксфордын магистр, докторын бүрэн тэтгэлэг.",
    requirements: ["Academic merit", "Graduate admission in Oxford", "Future potential", "Top GPA"],
    checklist: ["Course Application", "Transcripts", "References", "Personal Statement"]
  },
  { 
    title: "TU Delft Excellence Scholarship", country: "Netherlands", organization: "TU Delft", category: "Full", deadline: "2025-12-01", link: "https://www.tudelft.nl", 
    description: "Инженерийн шилдэг сургуулийн тэтгэлэг.",
    requirements: ["GPA 80%+", "BSc from outside NL", "STEM major", "MSc admission"],
    checklist: ["Scholarship Application Form", "2 Reference Letters", "GRE Score", "Transcripts"]
  },
  { 
    title: "HKU Entrance Scholarship", country: "Hong Kong", organization: "HKU", category: "Full", deadline: "2026-01-30", link: "https://admissions.hku.hk", 
    description: "Хонг Конгийн их сургуулийн бакалаврын тэтгэлэг.",
    requirements: ["Top exam scores (SAT/IB/AP)", "English proficiency", "Co-curricular activities", "Interview"],
    checklist: ["Personal Statement", "Academic Results", "School Reference", "Portfolio (Optional)"]
  },

  // --- 31-40: БУСАД ОРНУУД & ТУСГАЙ ТЭТГЭЛЭГҮҮД ---
  { 
    title: "Australia Awards (Short Courses)", country: "Australia", organization: "DFAT", category: "Full", deadline: "2026-08-30", link: "https://www.australiaawardsmongolia.org", 
    description: "Мэргэжилтнүүдэд зориулсан 2-4 долоо хоногийн эрчимжүүлсэн сургалт.",
    requirements: ["Current employment", "Related field", "English basic skill", "Mongolian citizen"],
    checklist: ["Employer Support", "Application Form", "CV", "Passport"]
  },
  { 
    title: "Manaaki New Zealand Scholarships", country: "New Zealand", organization: "Gov", category: "Full", deadline: "2026-02-28", link: "https://www.nzscholarships.govt.nz", 
    description: "Шинэ Зеландын засгийн газрын бүрэн тэтгэлэг.",
    requirements: ["Ages 18-39", "2 years work experience", "English proficiency", "Related field"],
    checklist: ["Online Form", "Work Proof", "Academic Transcripts", "Passport Copy"]
  },
  { 
    title: "Russian Government Quota", country: "Russia", organization: "Rossotrudnichestvo", category: "Full", deadline: "2026-02-15", link: "https://mng.rs.gov.ru", 
    description: "Оросын холбооны улсын засгийн газрын тэтгэлэг. Монгол дахь РТЦ-ээр дамжуулдаг.",
    requirements: ["Exam success", "Russian language", "Academic record", "All levels"],
    checklist: ["Application Form", "Transcripts", "Passport Translation", "Health Certificate"]
  },
  { 
    title: "ICCR Scholarship", country: "India", organization: "ICCR", category: "Full", deadline: "2026-04-30", link: "https://a2ascholarships.iccr.gov.in", 
    description: "Энэтхэгийн засгийн газрын тэтгэлэг. Бүх шатанд олгодог.",
    requirements: ["English proficiency test (at Embassy)", "Health certificate", "Age limit 18-30/45", "Academic record"],
    checklist: ["Online Form", "Physical Fitness", "Transcripts", "Passport Photo"]
  },
  { 
    title: "Romania Government Scholarship", country: "Romania", organization: "MFA", category: "Full", deadline: "2026-03-01", link: "https://studyinromania.gov.ro", 
    description: "Румын улсад суралцах бүрэн тэтгэлэг. Румын хэлний бэлтгэлтэй.",
    requirements: ["Good GPA", "Any field except Med/Dentistry", "Non-EU citizen", "Academic history"],
    checklist: ["Birth Certificate", "Diplomas", "Passport Copy", "Curriculum Vitae"]
  },
  { 
    title: "Brunei Darussalam Scholarship", country: "Brunei", organization: "MFA", category: "Full", deadline: "2026-02-15", link: "https://www.mfa.gov.bn", 
    description: "Бруней улсын засгийн газрын тэтгэлэг. Магистр, Бакалавр.",
    requirements: ["English proficiency", "Under 25/35 years old", "Academic record", "Health check"],
    checklist: ["Application Form", "Security Clearance", "Medical Form", "Recommendation Letters"]
  },
  { 
    title: "Bologna University Grant", country: "Italy", organization: "UNIBO", category: "Full", deadline: "2026-03-31", link: "https://www.unibo.it", 
    description: "Италийн Болонья их сургуульд суралцах тэтгэлэг.",
    requirements: ["SAT/GRE/TOLC test scores", "Age under 30", "University enrollment", "International student"],
    checklist: ["Test Score Results", "Income Statement", "Passport", "Enrolment Confirmation"]
  },
  { 
    title: "Darmasiswa Scholarship", country: "Indonesia", organization: "Gov", category: "Partial", deadline: "2026-03-01", link: "https://darmasiswa.kemdikbud.go.id", 
    description: "Индонезийн соёл, хэл сурах 1 жилийн хөтөлбөр.",
    requirements: ["Ages 18-27", "High school graduate", "English proficiency", "Interest in Indonesian culture"],
    checklist: ["CV", "Medical Certificate", "Passport", "Language Certificate"]
  },
  { 
    title: "Vietnam-Mongolia Gov Scholarship", country: "Vietnam", organization: "Gov", category: "Full", deadline: "2026-07-30", link: "http://icd.edu.vn", 
    description: "Хоёр орны засгийн газрын хэлэлцээрээр олгодог тэтгэлэг.",
    requirements: ["BShUYa Nomination", "Good GPA", "Health clearance", "Vietnamese language prep"],
    checklist: ["Application Form", "Transcripts", "Medical Record", "Passport"]
  },
  { 
    title: "AAUW International Fellowships", country: "USA", organization: "AAUW", category: "Full", deadline: "2025-11-15", link: "https://www.aauw.org", 
    description: "АНУ-д магистр, докторт суралцах эмэгтэйчүүдийн тэтгэлэг.",
    requirements: ["Non-US citizen woman", "Bachelor degree", "Intent to return home", "Academic excellence"],
    checklist: ["Proposed Program", "3 Reference Letters", "Transcripts", "Online Application"]
  }
];

export default function ImportPage() {
    const [status, setStatus] = useState("Бэлэн");
    const [progress, setProgress] = useState(0);
    const [isImporting, setIsImporting] = useState(false);

    const startImport = async () => {
        if (isImporting) return; // Процесс явж байвал дахин ажиллуулахгүй
        
        setIsImporting(true);
        setStatus("Импорт эхэллээ...");
        let count = 0;

        try {
            const colRef = collection(db, "scholarships");
            
            for (const item of scholarshipsData) {
                await addDoc(colRef, {
                    ...item,
                    deadline: Timestamp.fromDate(new Date(item.deadline)),
                    createdAt: Timestamp.now()
                });
                count++;
                setProgress(Math.round((count / scholarshipsData.length) * 100));
            }
            setStatus("Амжилттай! тэтгэлэг баазад орлоо.");
        } catch (err) {
            console.error("Import error:", err);
            setStatus("Алдаа гарлаа. Firestore Rules-ээ шалгана уу.");
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f172a] text-white p-6">
            <div className="bg-[#1e293b] p-10 rounded-[2.5rem] shadow-2xl border border-white/5 w-full max-w-lg text-center relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
                
                <div className="relative z-10">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                        <Database className="text-emerald-400" size={40} />
                    </div>

                    <h1 className="text-3xl font-black mb-2 tracking-tighter uppercase">
                        Data Seeder
                    </h1>
                    <p className="text-slate-400 text-sm mb-10 font-medium">
                        Firestore-руу тэтгэлгийн өгөгдөл хуулах
                    </p>

                    {/* Progress UI */}
                    <div className="space-y-4 mb-10 text-left">
                        <div className="flex justify-between items-end px-1">
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Явц</span>
                            <span className="text-xl font-mono font-black text-emerald-400">{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-3 p-1">
                            <div 
                                className="bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={startImport}
                        disabled={isImporting}
                        className={`w-full h-16 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                            isImporting 
                            ? "bg-slate-700 text-slate-400 cursor-not-allowed" 
                            : "bg-white text-black hover:bg-emerald-400 active:scale-95 shadow-xl shadow-white/5"
                        }`}
                    >
                        {isImporting ? (
                            <>
                                <RotateCcw className="animate-spin" size={18} />
                                Хуулж байна...
                            </>
                        ) : (
                            "Өгөгдлийг хуулах"
                        )}
                    </button>

                    <div className={`mt-8 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-tight ${
                        status.includes('Амжилттай') ? 'text-emerald-400' : 'text-slate-500'
                    }`}>
                        {status.includes('Амжилттай') ? <CheckCircle2 size={14} /> : status.includes('Алдаа') ? <AlertCircle size={14} /> : null}
                        {status}
                    </div>
                </div>
            </div>

            {/* Hint */}
            <p className="mt-8 text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                Secure Database Management System v2.0
            </p>
        </div>
    );
}