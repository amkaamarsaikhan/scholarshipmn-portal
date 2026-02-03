"use client";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useState } from "react";
import { Database, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";

const scholarshipsData = [
  // 1-10: Government Full Scholarships
  { 
    title: "Global Korea Scholarship (GKS)", country: "South Korea", organization: "NIIED", category: "Full", deadline: "2026-03-15", link: "https://www.studyinkorea.go.kr", description: "БНСУ-ын Засгийн газрын бүрэн тэтгэлэг. Төлбөр, амьжиргаа багтсан.",
    requirements: ["GPA 80%+", "TOEPIK level 3+", "Bachelor degree", "Under 25/40 age"],
    checklist: ["GKS Application Form", "Personal Statement", "Study Plan", "2 Letters of Recommendation", "Medical Assessment"]
  },
  { 
    title: "MEXT Scholarship", country: "Japan", organization: "MEXT", category: "Full", deadline: "2026-05-20", link: "https://www.mn.emb-japan.go.jp", description: "Японы Засгийн газрын тэтгэлэг. Бүх шатанд олгогдоно.",
    requirements: ["Japanese or English skills", "High GPA", "Passed Exam", "Research Plan"],
    checklist: ["Placement Preference Form", "Research Plan", "Official Transcripts", "Medical Certificate", "Thesis Abstract"]
  },
  { 
    title: "Fulbright Student Program", country: "USA", organization: "US Embassy", category: "Full", deadline: "2026-05-15", link: "https://mn.usembassy.gov", description: "АНУ-д магистрт суралцах нэр хүндтэй тэтгэлэг.",
    requirements: ["IELTS 7.0+", "2 years work experience", "Bachelor degree", "Mongolian citizen"],
    checklist: ["Online Application", "TOEFL/IELTS Score", "3 Essays", "Diplomas", "3 References"]
  },
  { 
    title: "Chevening Scholarship", country: "UK", organization: "UK Gov", category: "Full", deadline: "2026-11-01", link: "https://www.chevening.org", description: "Их Британид магистрт суралцах манлайлагчдын тэтгэлэг.",
    requirements: ["Work experience (2,800 hrs)", "Bachelor degree", "Return to home country", "3 UK University choices"],
    checklist: ["4 Essays", "Passport", "Education Documents", "2 References"]
  },
  { 
    title: "Stipendium Hungaricum", country: "Hungary", organization: "TPF", category: "Full", deadline: "2026-01-15", link: "https://stipendiumhungaricum.hu", description: "Унгарын засгийн газрын тэтгэлэг. Монголчуудад хамгийн их квоттой.",
    requirements: ["IELTS 5.5+", "High School/Bachelor diploma", "Medical checkup", "Motivation letter"],
    checklist: ["DreamApply Application", "Study Plan", "Transcript of Records", "Passport Copy", "Medical Certificate"]
  },
  { 
    title: "Australia Awards", country: "Australia", organization: "DFAT", category: "Full", deadline: "2026-04-30", link: "https://www.australiaawardsmongolia.org", description: "Австралид суралцах бүрэн тэтгэлэг.",
    requirements: ["IELTS 6.5+", "2 years work experience", "Mongolian citizen", "Development focus"],
    checklist: ["OASIS Application", "Employer Support Letter", "Relevance Statement", "Proof of Citizenship"]
  },
  { 
    title: "DAAD Scholarship", country: "Germany", organization: "DAAD", category: "Full", deadline: "2026-08-31", link: "https://www.daad.de", description: "Германд магистр, докторт суралцах тэтгэлэг.",
    requirements: ["2 years experience", "English or German skills", "Bachelor degree", "Academic excellence"],
    checklist: ["DAAD Form", "CV (Europass)", "Motivation Letter", "Reference from Professor"]
  },
  { 
    title: "Erasmus Mundus Masters", country: "EU", organization: "EU Commission", category: "Full", deadline: "2026-02-15", link: "https://erasmus-plus.ec.europa.eu", description: "Европын 2-оос дээш улсад суралцах хөтөлбөр.",
    requirements: ["Bachelor degree", "IELTS 6.5+", "Research interest", "EU Mobility"],
    checklist: ["Combined Application", "Motivation Letter", "CV", "English Certificate"]
  },
  { 
    title: "Turkiye Burslari", country: "Turkey", organization: "YTB", category: "Full", deadline: "2026-02-20", link: "https://www.turkiyeburslari.gov.tr", description: "Туркийн бүх шатны бүрэн тэтгэлэг.",
    requirements: ["GPA 70/75/90%", "Under age limit", "Not in Turkey", "Entrance exam"],
    checklist: ["ID/Passport", "Transcript", "Intent Letter", "Exam Scores"]
  },
  { 
    title: "Taiwan ICDF Scholarship", country: "Taiwan", organization: "ICDF", category: "Full", deadline: "2026-03-15", link: "https://www.icdf.org.tw", description: "Тайваньд магистр, докторт суралцах тэтгэлэг.",
    requirements: ["English proficiency", "ROC Partner Uni admission", "Health certificate", "No other scholarship"],
    checklist: ["Online Form", "Diploma", "Health Report", "2 Recommendation Letters"]
  },

  // 11-20: Top University Scholarships
  { 
    title: "Gates Cambridge Scholarship", country: "UK", organization: "Cambridge", category: "Full", deadline: "2026-01-05", link: "https://www.gatescambridge.org", description: "Кэмбрижийн их сургуулийн дэлхийн шилдэг тэтгэлэг.",
    requirements: ["Outstanding intellect", "Leadership potential", "Commitment to others", "Cambridge admission"],
    checklist: ["Uni Application", "Gates Statement", "Research Proposal", "References"]
  },
  { 
    title: "Rhodes Scholarship", country: "UK", organization: "Oxford", category: "Full", deadline: "2025-10-01", link: "https://www.rhodeshouse.ox.ac.uk", description: "Оксфордын их сургуулийн элит тэтгэлэг.",
    requirements: ["Ages 18-24", "High academic standing", "Sporting/Social activity", "Oxford admission"],
    checklist: ["Personal Statement", "List of Activities", "6 References", "Proof of Identity"]
  },
  { 
    title: "Knight-Hennessy Scholars", country: "USA", organization: "Stanford", category: "Full", deadline: "2025-10-10", link: "https://knight-hennessy.stanford.edu", description: "Стэнфордын их сургуулийн манлайллын тэтгэлэг.",
    requirements: ["Independent thought", "Purposeful leadership", "Civic mindset", "Stanford graduate admission"],
    checklist: ["Online Application", "Resume", "Two Recommendation Letters", "Video Story"]
  },
  { 
    title: "Schwarzman Scholars", country: "China", organization: "Tsinghua", category: "Full", deadline: "2025-09-20", link: "https://www.schwarzmanscholars.org", description: "Цинхуа их сургуулийн магистрын тэтгэлэг.",
    requirements: ["Undergraduate degree", "Ages 18-28", "English proficiency", "Leadership skills"],
    checklist: ["Essays", "CV", "3 Recommendation Letters", "Video Introduction"]
  },
  { 
    title: "Lester B. Pearson", country: "Canada", organization: "UofT", category: "Full", deadline: "2026-01-15", link: "https://future.utoronto.ca", description: "Торонтогийн их сургуулийн бакалаврын тэтгэлэг.",
    requirements: ["International student", "School nomination", "Original/Creative thinker", "Leadership skills"],
    checklist: ["School Nomination", "Student Application", "Essay", "Teacher Reference"]
  },
  { 
    title: "KAIST Undergraduate", country: "South Korea", organization: "KAIST", category: "Full", deadline: "2026-01-05", link: "https://admission.kaist.ac.kr", description: "Солонгосын шинжлэх ухааны шилдэг сургууль.",
    requirements: ["International status", "High school graduation", "English/Korean skills", "Strong STEM background"],
    checklist: ["Online Form", "Recommendation Letter", "Transcript", "English Score"]
  },
  { 
    title: "SNU President Fellowship", country: "South Korea", organization: "SNU", category: "Full", deadline: "2026-03-30", link: "https://en.snu.ac.kr", description: "Сөүлийн үндэсний сургуулийн докторын тэтгэлэг.",
    requirements: ["Faculty member without PhD", "Developing country citizen", "SNU PhD admission", "Language skill"],
    checklist: ["Fellowship Form", "Certificate of Employment", "PhD Admission Doc", "Research Plan"]
  },
  { 
    title: "UST PhD Scholarship", country: "South Korea", organization: "UST", category: "Full", deadline: "2026-04-10", link: "https://ust.ac.kr", description: "Шинжлэх ухаан, технологийн нэгдсэн сургууль.",
    requirements: ["Master's degree", "English score (TOEFL/IELTS)", "Research proposal", "STEM field"],
    checklist: ["Application Form", "Transcripts", "Master's Thesis", "English Certificate"]
  },
  { 
    title: "ADB-Japan Scholarship", country: "Japan", organization: "ADB", category: "Full", deadline: "2026-06-30", link: "https://www.adb.org", description: "Азийн хөгжлийн банкны магистрын тэтгэлэг.",
    requirements: ["ADB member country citizen", "2 years work experience", "Under 35 years old", "Return to home country"],
    checklist: ["Admission Letter", "Income Tax Return", "Employer Certificate", "Application Form"]
  },
  { 
    title: "Clarendon Fund", country: "UK", organization: "Oxford", category: "Full", deadline: "2026-01-20", link: "https://www.ox.ac.uk", description: "Оксфордын их сургуулийн магистр, докторын тэтгэлэг.",
    requirements: ["High academic score", "Potential for research", "Oxford graduate application", "Top-tier GPA"],
    checklist: ["University Application Form", "Research Proposal", "References", "Transcripts"]
  },

  // 21-30: EU & International
  { 
    title: "Swiss Gov Excellence", country: "Switzerland", organization: "SBFN", category: "Full", deadline: "2025-11-30", link: "https://www.sbfi.admin.ch", description: "Швейцарийн засгийн газрын судалгааны тэтгэлэг.",
    requirements: ["Master's degree", "Research proposal", "Swiss Professor contact", "Under age limit"],
    checklist: ["Application Form", "CV", "Research Proposal", "2 Recommendation Letters"]
  },
  { 
    title: "Swedish Institute SISGP", country: "Sweden", organization: "SI", category: "Full", deadline: "2026-02-10", link: "https://si.se", description: "Шведийн манлайлагчдын тэтгэлэг.",
    requirements: ["3,000 hrs work experience", "Citizen of SI country", "Leadership experience", "Master's admission"],
    checklist: ["Motivation Letter", "CV", "Proof of Work/Leadership", "Copy of Passport"]
  },
  { 
    title: "Eiffel Excellence", country: "France", organization: "Gov", category: "Full", deadline: "2026-01-10", link: "https://www.campusfrance.org", description: "Францын магистр, докторын тэтгэлэг.",
    requirements: ["Top academic record", "Ages under 25 (Master)", "Applied to French Uni", "International focus"],
    checklist: ["Resume", "Motivation Letter", "Transcripts", "Language Certificate"]
  },
  { 
    title: "Orange Knowledge Program", country: "Netherlands", organization: "Nuffic", category: "Full", deadline: "2026-03-15", link: "https://www.studyinholland.nl", description: "Нидерландад суралцах богино хугацааны тэтгэлэг.",
    requirements: ["Professional experience", "Employer statement", "Passport of OKP country", "Course admission"],
    checklist: ["Employer Statement", "Passport", "Admission Letter", "Motivation Form"]
  },
  { 
    title: "VLIR-UOS Scholarship", country: "Belgium", organization: "Gov", category: "Full", deadline: "2026-02-01", link: "https://www.vliruos.be", description: "Бельгид магистрт суралцах тэтгэлэг.",
    requirements: ["Under 35 years old", "Citizen of partner country", "English skill", "Development theme"],
    checklist: ["Application Form", "Passport Copy", "Diplomas", "Transcript of Records"]
  },
  { 
    title: "Stipendium Hungaricum (Med)", country: "Hungary", organization: "TPF", category: "Full", deadline: "2026-01-15", link: "https://stipendiumhungaricum.hu", description: "Унгарт анагаахын чиглэлээр суралцах тэтгэлэг.",
    requirements: ["IELTS 6.0+", "High GPA", "Medical checkup", "Biology/Chemistry knowledge"],
    checklist: ["Application Form", "Study Plan", "Health Certificate", "Transcript"]
  },
  { 
    title: "Bologna Uni Grant", country: "Italy", organization: "UNIBO", category: "Full", deadline: "2026-03-31", link: "https://www.unibo.it", description: "Италийн хамгийн эртний сургуулийн тэтгэлэг.",
    requirements: ["SAT/GRE/TOLC scores", "International status", "Under age 30", "University enrollment"],
    checklist: ["Exam Certificates", "Income Statement", "Passport", "Enrolment Form"]
  },
  { 
    title: "Lund Global Scholarship", country: "Sweden", organization: "Lund", category: "Partial", deadline: "2026-02-15", link: "https://www.lunduniversity.lu.se", description: "Лунд их сургуулийн сургалтын төлбөрийн тэтгэлэг.",
    requirements: ["Non-EU citizen", "Academic excellence", "Master's admission", "Applied via UniAdmissions"],
    checklist: ["Online Application", "Personal Statement", "Admission Docs", "Scholarship Essay"]
  },
  { 
    title: "TU Delft Excellence", country: "Netherlands", organization: "TU Delft", category: "Full", deadline: "2025-12-01", link: "https://www.tudelft.nl", description: "Инженерийн шилдэг сургуулийн тэтгэлэг.",
    requirements: ["GPA 80%+", "BSc from outside NL", "Applied to MSc program", "STEM background"],
    checklist: ["Scholarship Form", "MSc Admission Form", "Reference Letters", "GRE Score"]
  },
  { 
    title: "ETH Zurich Excellence", country: "Switzerland", organization: "ETH", category: "Full", deadline: "2025-12-15", link: "https://ethz.ch", description: "Дэлхийн шилдэг техникийн сургуулийн тэтгэлэг.",
    requirements: ["Top tier academic performance", "Bachelor GPA 3.5+", "Contact with professor", "Master's admission"],
    checklist: ["Pre-Proposal for Thesis", "CV", "2 Letters of Reference", "Transcripts"]
  },

  // 31-40: North America & Tech
  { 
    title: "Vanier Canada Graduate", country: "Canada", organization: "Gov", category: "Full", deadline: "2025-10-30", link: "https://vanier.gc.ca", description: "Канадын докторын зэргийн дээд тэтгэлэг.",
    requirements: ["PhD student", "Academic excellence", "Research potential", "Leadership"],
    checklist: ["CCV", "Research Proposal", "Project References", "3 Transcripts"]
  },
  { 
    title: "Pierre Trudeau Foundation", country: "Canada", organization: "Foundation", category: "Full", deadline: "2025-12-01", link: "https://www.trudeaufoundation.ca", description: "Канадын хүмүүнлэгийн ухааны тэтгэлэг.",
    requirements: ["PhD in Humanities", "Civic engagement", "Leadership", "Canadian/International PhD"],
    checklist: ["Foundation Application", "Transcripts", "3 Letters of Reference", "Sample of Work"]
  },
  { 
    title: "Google Generation Scholarship", country: "APAC", organization: "Google", category: "Partial", deadline: "2026-04-10", link: "https://buildyourfuture.withgoogle.com", description: "Технологийн чиглэлийн оюутнуудад зориулсан тэтгэлэг.",
    requirements: ["Computer Science student", "Academic record", "Passion for tech", "Underrepresented group"],
    checklist: ["Resume", "Transcript", "2 Essays", "Reference Letter"]
  },
  { 
    title: "Microsoft PhD Fellowship", country: "Global", organization: "Microsoft", category: "Full", deadline: "2025-06-30", link: "https://www.microsoft.com", description: "Компьютерийн шинжлэх ухааны докторын тэтгэлэг.",
    requirements: ["PhD student (2nd year+)", "Research Excellence", "Computer Science/Math", "University Nomination"],
    checklist: ["Research Statement", "CV", "3 Letters of Reference", "Thesis Abstract"]
  },
  { 
    title: "Hubert Humphrey Fellowship", country: "USA", organization: "Gov", category: "Full", deadline: "2025-08-01", link: "https://www.humphreyfellowship.org", description: "Мэргэжил дээшлүүлэх солилцооны хөтөлбөр.",
    requirements: ["Undergraduate degree", "5 years experience", "English proficiency", "Leadership potential"],
    checklist: ["Application Form", "Program Plan", "References", "Language Score"]
  },
  { 
    title: "AAUW International Fellow", country: "USA", organization: "AAUW", category: "Full", deadline: "2025-11-15", link: "https://www.aauw.org", description: "АНУ-д суралцах эмэгтэйчүүдийн тэтгэлэг.",
    requirements: ["Non-US citizen women", "Bachelor degree", "Intent to return home", "Academic excellence"],
    checklist: ["Application Form", "Proposed Program", "3 References", "Transcripts"]
  },
  { 
    title: "Joint Japan/World Bank", country: "Global", organization: "World Bank", category: "Full", deadline: "2026-05-20", link: "https://www.worldbank.org", description: "Хөгжлийн салбарт ажиллагсдад зориулсан тэтгэлэг.",
    requirements: ["WB member country citizen", "3 years experience", "Bachelor degree", "Development field"],
    checklist: ["Admission Letter", "Proof of Experience", "References", "Application Form"]
  },
  { 
    title: "OPEC Fund Scholarship", country: "Global", organization: "OPEC", category: "Full", deadline: "2026-04-15", link: "https://opecfund.org", description: "Магистрт суралцах олон улсын тэтгэлэг.",
    requirements: ["Bachelor degree", "Ages 23-32", "Development related field", "Academic excellence"],
    checklist: ["Online Form", "Diploma", "Motivation Essay", "Passport Copy"]
  },
  { 
    title: "Aga Khan Foundation", country: "Global", organization: "AKF", category: "Partial", deadline: "2026-03-31", link: "https://www.akdn.org", description: "Магистр, докторын сургалтын зээл тусламж.",
    requirements: ["Citizen of AKF country", "Under 30 years old", "Master/PhD admission", "Financial need"],
    checklist: ["Application Form", "Financial Statement", "Admission Proof", "Interview"]
  },
  { 
    title: "Rotary Peace Fellowship", country: "Global", organization: "Rotary", category: "Full", deadline: "2025-05-15", link: "https://www.rotary.org", description: "Энх тайван, аюулгүй байдлын магистр.",
    requirements: ["3 years work experience", "English proficiency", "Bachelor degree", "Peace/Conflict focus"],
    checklist: ["Online Application", "Rotary District Nomination", "3 References", "CV"]
  },

  // 41-50: Asia & Oceania
  { 
    title: "Manaaki New Zealand", country: "New Zealand", organization: "Gov", category: "Full", deadline: "2026-02-28", link: "https://www.nzscholarships.govt.nz", description: "Шинэ Зеландын бүрэн тэтгэлэг.",
    requirements: ["18-39 years old", "Return to home country", "1 yr work experience", "English proficiency"],
    checklist: ["Online Application", "English Scores", "Work Proof", "Health Clearance"]
  },
  { 
    title: "Turkiye Graduate Scholarship", country: "Turkey", organization: "YTB", category: "Full", deadline: "2026-02-20", link: "https://www.turkiyeburslari.gov.tr", description: "Туркт магистр, докторт суралцах.",
    requirements: ["GPA 75%+", "Ages under 30/35", "English/Turkish skill", "National Exam results"],
    checklist: ["Diploma", "Transcripts", "Intent Letter", "Exam Scores"]
  },
  { 
    title: "CSC Type B Scholarship", country: "China", organization: "University", category: "Full", deadline: "2026-04-15", link: "https://www.campuschina.org", description: "Хятадын их сургуулийн нэрэмжит тэтгэлэг.",
    requirements: ["Non-Chinese citizen", "Good health", "HSK score (optional)", "Bachelor/Master degree"],
    checklist: ["CSC Form", "Study Plan", "2 Recommendation Letters", "Medical Form"]
  },
  { 
    title: "HKU Entrance Scholarship", country: "Hong Kong", organization: "HKU", category: "Full", deadline: "2026-01-30", link: "https://admissions.hku.hk", description: "Хонг Конгийн их сургуулийн тэтгэлэг.",
    requirements: ["Top exam scores (SAT/IB)", "English proficiency", "Interview success", "Admission application"],
    checklist: ["Personal Statement", "Public Exam Results", "Referee Report", "School Profile"]
  },
  { 
    title: "Nanyang Scholarship", country: "Singapore", organization: "NTU", category: "Full", deadline: "2026-01-15", link: "https://www.ntu.edu.sg", description: "Наняны технологийн сургуулийн тэтгэлэг.",
    requirements: ["Outstanding results", "Leadership potential", "Co-curricular record", "NTU admission"],
    checklist: ["Personal Statement", "Appraisal Form", "Passport Photo", "Academic Results"]
  },
  { 
    title: "Khalifa University Research", country: "UAE", organization: "Khalifa", category: "Full", deadline: "2026-04-30", link: "https://www.ku.ac.ae", description: "Арабын эмират улсын судалгааны тэтгэлэг.",
    requirements: ["STEM Bachelor/Master", "High GPA", "English proficiency", "Research capability"],
    checklist: ["Transcripts", "CV", "Research Statement", "2 References"]
  },
  { 
    title: "Yenching Academy Fellowship", country: "China", organization: "Peking", category: "Full", deadline: "2025-12-01", link: "https://yenchingacademy.pku.edu.cn", description: "Бээжингийн их сургуулийн Хятад судлал.",
    requirements: ["Bachelor degree", "Academic excellence", "English proficiency", "Under age 25/28"],
    checklist: ["Personal Statement", "Research Proposal", "CV", "2 Letters of Recommendation"]
  },
  { 
    title: "Stipendium Hungaricum (Vocational)", country: "Hungary", organization: "TPF", category: "Full", deadline: "2026-01-15", link: "https://stipendiumhungaricum.hu", description: "Унгарт мэргэжлийн боловсрол эзэмших.",
    requirements: ["HS diploma", "Language skills", "Partner country nomination", "Health clearance"],
    checklist: ["DreamApply form", "Medical report", "Diploma", "Motivation Letter"]
  },
  { 
    title: "Darmasiswa Scholarship", country: "Indonesia", organization: "Gov", category: "Partial", deadline: "2026-03-01", link: "https://darmasiswa.kemdikbud.go.id", description: "Индонезийн соёл, хэлний тэтгэлэг.",
    requirements: ["Ages 18-27", "High school graduate", "Interest in culture", "Language ability"],
    checklist: ["Curriculum Vitae", "Medical Certificate", "Passport", "Language Certificate"]
  },
  { 
    title: "Brunei Darussalam Gov", country: "Brunei", organization: "Gov", category: "Full", deadline: "2026-02-15", link: "https://www.mfa.gov.bn", description: "Брунейн засгийн газрын тэтгэлэг.",
    requirements: ["Ages 18-25 (Bachelor)", "ASEAN/OIC citizens preferred", "English skill", "Police clearance"],
    checklist: ["Application Form", "Security Clearance", "Diplomas", "Passport Copy"]
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
            setStatus("Амжилттай! 100 тэтгэлэг баазад орлоо.");
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
                        Firestore-руу 100 ширхэг тэтгэлгийн өгөгдөл хуулах
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