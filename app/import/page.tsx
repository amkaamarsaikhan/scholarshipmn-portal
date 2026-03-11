"use client";

import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useState, useEffect } from "react"; // useEffect нэмэв
import { Database, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";

const scholarshipsData = [
  // --- 1-10: ЗАСГИЙН ГАЗРЫН БҮРЭН ТЭТГЭЛЭГҮҮД ---
  { 
    title: "Stipendium Hungaricum", country: "Hungary", organization: "Tempus Public Foundation", category: "Full", deadline: "2026-01-15", link: "https://stipendiumhungaricum.hu", 
    description: "Унгарын засгийн газрын тэтгэлэг. Жил бүр Монголд 200 квот олгодог.",
    requirements: ["IELTS 5.5+", "GPA 3.0+", "БШУЯ-ны бүртгэл", "Эрүүл мэндийн шинжилгээ"],
    checklist: ["DreamApply Online Account", "Motivation Letter", "Study Plan", "Medical Certificate", "Transcript Translation"]
  },
  { 
    title: "Australia Awards Mongolia", country: "Australia", organization: "DFAT", category: "Full", deadline: "2026-04-30", link: "https://www.australiaawardsmongolia.org", 
    description: "Австралид магистрт суралцах бүрэн тэтгэлэг. Төрийн болон хувийн хэвшлийнхэнд тусдаа квоттой.",
    requirements: ["IELTS 6.5+ (no band < 6.0)", "2 жил ажилласан туршлага", "Бакалаврын зэрэг"],
    checklist: ["OASIS Application", "Employer Support Letter", "Relevance Statement", "Research Proposal"]
  },
  { 
    title: "Global Korea Scholarship (GKS)", country: "South Korea", organization: "NIIED", category: "Full", deadline: "2026-03-15", link: "https://www.studyinkorea.go.kr", 
    description: "БНСУ-ын Засгийн газрын тэтгэлэг. ЭСЯ болон Их сургуулийн квот гэсэн 2 замтай.",
    requirements: ["GPA 80%+", "Нас 25/40-өөс доош", "1 жил хэлний бэлтгэл"],
    checklist: ["Application Forms (1-10)", "Personal Statement", "Study Plan", "2 Recommendation Letters", "Medical Assessment"]
  },
  { 
    title: "MEXT (Monbukagakusho)", country: "Japan", organization: "MEXT", category: "Full", deadline: "2026-05-20", link: "https://www.mn.emb-japan.go.jp", 
    description: "Японы засгийн газрын тэтгэлэг. Шалгалт дээр суурилдаг бөгөөд судалгааны ажил маш чухал.",
    requirements: ["Япон эсвэл Англи хэлний мэдлэг", "Математикийн шалгалт", "Судалгааны төлөвлөгөө"],
    checklist: ["Application Form", "Field of Study Plan", "Placement Preference Form", "Medical Certificate"]
  },
  { 
    title: "Chevening Scholarship", country: "UK", organization: "FCDO", category: "Full", deadline: "2026-11-01", link: "https://www.chevening.org", 
    description: "Их Британийн магистрын бүрэн тэтгэлэг. Манлайлагчдад зориулсан.",
    requirements: ["2 жил ажилласан туршлага", "Британийн 3 сургууль сонгох", "Бакалаврын зэрэг"],
    checklist: ["4 Essays (Leadership, Networking, Study in UK, Career Plan)", "2 Reference Letters", "Passport", "Education Docs"]
  },
  { 
    title: "Fulbright Foreign Student Program", country: "USA", organization: "State Department", category: "Full", deadline: "2026-05-15", link: "https://mn.usembassy.gov", 
    description: "АНУ-ын Засгийн газрын магистрын тэтгэлэг. Монгол дахь ЭСЯ-аар дамжуулан авдаг.",
    requirements: ["IELTS 7.0+ / TOEFL 80+", "2 жил ажилласан туршлага", "Монголд оршин сууж байх"],
    checklist: ["Online Application", "Personal Statement", "Study Objectives Essay", "3 Recommendation Letters"]
  },
  { 
    title: "DAAD EPOS Scholarship", country: "Germany", organization: "DAAD", category: "Full", deadline: "2026-10-31", link: "https://www.daad.de", 
    description: "Германд хөгжлийн чиглэлээр магистр, докторт суралцах мэргэжилтнүүдэд.",
    requirements: ["2 жил мэргэжлээрээ ажилласан", "IELTS/TOEFL эсвэл Герман хэлний оноо"],
    checklist: ["DAAD Application Form", "CV Europass", "Motivation Letter", "Employer Reference"]
  },
  { 
    title: "Chinese Government Scholarship (CSC)", country: "China", organization: "CSC", category: "Full", deadline: "2026-03-31", link: "https://www.campuschina.org", 
    description: "Хятадын засгийн газрын тэтгэлэг. БШУЯ-аар дамжуулах эсвэл сургуульдаа шууд хандана.",
    requirements: ["HSK 4+ (Хятад хэл дээр бол)", "GPA 3.0+", "Эрүүл мэнд сайн байх"],
    checklist: ["CSC Online Form", "Physical Examination Form", "Non-criminal Record", "Study Plan"]
  },
  { 
    title: "Türkiye Bursları", country: "Turkey", organization: "YTB", category: "Full", deadline: "2026-02-20", link: "https://www.turkiyeburslari.gov.tr", 
    description: "Туркийн бүх шатны (Бакалавр, Магистр, Доктор) бүрэн тэтгэлэг.",
    requirements: ["GPA 70%+ (Bachelor) / 75%+ (Graduate)", "Турк хэлний бэлтгэл 1 жил"],
    checklist: ["ID/Passport", "Transcript", "Diploma", "Letter of Intent"]
  },
  { 
    title: "Taiwan MOE Scholarship", country: "Taiwan", organization: "MOE", category: "Full", deadline: "2026-03-31", link: "https://www.roc-taiwan.org/mn_mn/", 
    description: "Тайванийн Төлөөлөгчийн газраар дамжуулан Монголчуудад олгодог.",
    requirements: ["English or Chinese proficiency", "Partner University admission required"],
    checklist: ["Online Application", "Diploma", "Transcripts", "2 Recommendation Letters", "Study Plan"]
  },

  // --- 11-20: ЕВРОПЫН САНГУУД & ОЛОН УЛСЫН ТЭТГЭЛЭГҮҮД ---
  { 
    title: "Erasmus Mundus Joint Masters", country: "Europe", organization: "EU Commission", category: "Full", deadline: "2026-02-15", link: "https://erasmus-plus.ec.europa.eu", 
    description: "Европын 2-оос дээш улсад суралцах магистрын тэтгэлэг.",
    requirements: ["Academic excellence", "International mindset", "Bachelor degree"],
    checklist: ["CV Europass", "Motivation Letter", "2 Reference Letters", "Proof of Residence"]
  },
  { 
    title: "Swedish Institute SISGP", country: "Sweden", organization: "Swedish Institute", category: "Full", deadline: "2026-02-15", link: "https://si.se", 
    description: "Шведийн засгийн газрын магистрын тэтгэлэг.",
    requirements: ["3,000 hours of work experience", "Leadership experience", "Master's admission"],
    checklist: ["CV (SI Template)", "Proof of Work Experience", "2 Reference Letters", "Motivation Letter"]
  },
  { 
    title: "Eiffel Excellence Scholarship", country: "France", organization: "Campus France", category: "Full", deadline: "2026-01-10", link: "https://www.campusfrance.org", 
    description: "Францын засгийн газрын магистр, докторын тэтгэлэг.",
    requirements: ["Top tier academic performance", "Under 25 for Master, 30 for PhD"],
    checklist: ["Applied via French University", "Motivation Letter", "Professional Project", "CV"]
  },
  { 
    title: "Orange Knowledge Program (OKP)", country: "Netherlands", organization: "Nuffic", category: "Full", deadline: "2026-03-15", link: "https://www.studyinholland.nl", 
    description: "Нидерландад хөгжлийн чиглэлээр магистрт суралцах мэргэжилтнүүдэд.",
    requirements: ["Employer Statement", "Passport of OKP country", "English proficiency"],
    checklist: ["Employer Support Letter", "Admission Letter", "Motivation Essay", "Passport Copy"]
  },
  { 
    title: "VLIR-UOS Scholarships", country: "Belgium", organization: "VLIR-UOS", category: "Full", deadline: "2026-02-01", link: "https://www.vliruos.be", 
    description: "Бельгид хөгжлийн асуудлаар магистрт суралцах бүрэн тэтгэлэг.",
    requirements: ["Under 35 years old", "Citizen of partner country", "English proficiency"],
    checklist: ["Application Form", "Transcripts", "Motivation Essay", "Reference Letter"]
  },
  { 
    title: "Swiss Gov Excellence Scholarships", country: "Switzerland", organization: "SBFN", category: "Full", deadline: "2026-11-30", link: "https://www.sbfi.admin.ch", 
    description: "Швейцарийн засгийн газрын судалгаа, докторын тэтгэлэг.",
    requirements: ["Master's degree", "Swiss Professor contact", "Research project"],
    checklist: ["Application Form", "Research Proposal", "Contact with Supervisor", "CV"]
  },
  { 
    title: "Invest Your Talent in Italy", country: "Italy", organization: "MAECI", category: "Full", deadline: "2026-03-01", link: "https://investyourtalentitaly.esteri.it", 
    description: "Италид магистрт сурч, дадлага хийх хөтөлбөр.",
    requirements: ["Bachelor degree", "IELTS 6.0+", "Mongolian citizen"],
    checklist: ["Video CV (1 min)", "Motivation Letter", "Admission Proof", "Transcripts"]
  },
  { 
    title: "Manaaki New Zealand Scholarships", country: "New Zealand", organization: "Gov", category: "Full", deadline: "2026-02-28", link: "https://www.nzscholarships.govt.nz", 
    description: "Шинэ Зеландын засгийн газрын бүрэн тэтгэлэг.",
    requirements: ["2 years work experience", "Ages 18-39", "English proficiency"],
    checklist: ["Online Form", "Work Proof", "Academic Transcripts", "Passport Copy"]
  },
  { 
    title: "Russian Government Quota", country: "Russia", organization: "Rossotrudnichestvo", category: "Full", deadline: "2026-02-15", link: "https://mng.rs.gov.ru", 
    description: "Оросын холбооны улсын засгийн газрын тэтгэлэг.",
    requirements: ["Exam success", "Russian language", "Academic record"],
    checklist: ["Application Form", "Transcripts", "Passport Translation", "Health Certificate"]
  },
  { 
    title: "ICCR Scholarship", country: "India", organization: "ICCR", category: "Full", deadline: "2026-04-30", link: "https://a2ascholarships.iccr.gov.in", 
    description: "Энэтхэгийн засгийн газрын тэтгэлэг. Бүх шатанд олгодог.",
    requirements: ["English proficiency test", "Health certificate", "Age limit 18-30"],
    checklist: ["Online Form", "Physical Fitness", "Transcripts", "Passport Photo"]
  },

  // --- 21-30: АНУ-ЫН ТОП ИХ СУРГУУЛИУД ---
  { 
    title: "Stanford Knight-Hennessy Scholars", country: "USA", organization: "Stanford University", category: "Full", deadline: "2025-10-10", link: "https://knight-hennessy.stanford.edu", 
    description: "Стэнфордын бүх чиглэлийн магистр, докторын тэтгэлэг.",
    requirements: ["Stanford Graduate Admission", "Independence of Thought", "Civic Mindset"],
    checklist: ["Online Application", "Video Story", "Two Recommendation Letters", "Resume"]
  },
  { 
    title: "Oxford Clarendon Fund", country: "UK", organization: "University of Oxford", category: "Full", deadline: "2026-01-20", link: "https://www.ox.ac.uk", 
    description: "Оксфордын магистр, докторын хамгийн нэр хүндтэй тэтгэлэг.",
    requirements: ["Outstanding academic record", "Graduate admission in Oxford"],
    checklist: ["Course Application", "Academic Transcripts", "References"]
  },
  { 
    title: "Cambridge Gates Scholarship", country: "UK", organization: "University of Cambridge", category: "Full", deadline: "2026-01-05", link: "https://www.gatescambridge.org", 
    description: "Кэмбрижийн дэлхийн шилдэг оюутнуудад зориулсан.",
    requirements: ["Outstanding intellect", "Leadership potential", "Commitment to others"],
    checklist: ["Gates Statement", "Research Proposal", "References"]
  },
  { 
    title: "Harvard Academy Scholars", country: "USA", organization: "Harvard University", category: "Full", deadline: "2025-09-22", link: "https://academy.wcfia.harvard.edu", 
    description: "Харвардын академийн нийгмийн ухааны судалгааны тэтгэлэг.",
    requirements: ["PhD candidates", "Exceptional academic record"],
    checklist: ["Cover Letter", "CV", "Research Proposal", "Writing Sample"]
  },
  { 
    title: "Yale University Financial Aid", country: "USA", organization: "Yale University", category: "Full", deadline: "2026-02-15", link: "https://finaid.yale.edu", 
    description: "Иел их сургуулийн хэрэгцээнд суурилсан бүрэн тэтгэлэг.",
    requirements: ["Admitted student", "Financial need documentation"],
    checklist: ["CSS Profile", "Tax Returns", "Family Income Certificate"]
  },
  { 
    title: "NYU Abu Dhabi Scholarship", country: "UAE", organization: "New York University", category: "Full", deadline: "2026-01-01", link: "https://nyuad.nyu.edu", 
    description: "NYU Абу Даби дахь салбарын бүрэн тэтгэлэг.",
    requirements: ["Competitive SAT/ACT", "High School Diploma"],
    checklist: ["Common App", "CSS Profile", "School Report", "Teacher Recommendation"]
  },
  { 
    title: "UBC International Scholars", country: "Canada", organization: "University of British Columbia", category: "Full", deadline: "2025-12-01", link: "https://you.ubc.ca", 
    description: "Канадын UBC-ийн манлайлагч оюутны тэтгэлэг.",
    requirements: ["Financial need", "Academic excellence", "Leadership"],
    checklist: ["Application for Admission", "Financial Profile", "Reference Letters"]
  },
  { 
    title: "Dartmouth Financial Aid", country: "USA", organization: "Dartmouth College", category: "Full", deadline: "2026-01-02", link: "https://admissions.dartmouth.edu", 
    description: "Олон улсын оюутнуудад зориулсан Need-blind тэтгэлэг.",
    requirements: ["Admitted to Dartmouth", "Demonstrated financial need"],
    checklist: ["Common App", "CSS Profile", "IDOC documents"]
  },
  { 
    title: "Princeton Aid Program", country: "USA", organization: "Princeton University", category: "Full", deadline: "2026-01-01", link: "https://admission.princeton.edu", 
    description: "Принстоны бакалаврын бүрэн санхүүгийн тусламж.",
    requirements: ["Top academic scores", "Strong personal statement"],
    checklist: ["Princeton Supplement", "CSS Profile", "School Recommendation"]
  },
  { 
    title: "MIT Scholarship", country: "USA", organization: "MIT", category: "Full", deadline: "2026-02-15", link: "https://sfs.mit.edu", 
    description: "Технологийн шилдэг сургууль MIT-ийн тэтгэлэг.",
    requirements: ["Admitted to MIT", "Financial documents"],
    checklist: ["CSS Profile", "Parent Income Tax", "International Student Form"]
  },

  // --- 31-40: АЗИЙН ИХ СУРГУУЛИУД ---
  { 
    title: "KAIST International Scholarship", country: "South Korea", organization: "KAIST", category: "Full", deadline: "2026-01-05", link: "https://admission.kaist.ac.kr", 
    description: "KAIST-д бакалаврт суралцах олон улсын тэтгэлэг.",
    requirements: ["STEM major interest", "English proficiency", "Top GPA"],
    checklist: ["Online Application", "Recommendation Letter", "High School Profile"]
  },
  { 
    title: "Yonsei UIC Scholarship", country: "South Korea", organization: "Yonsei University", category: "Full", deadline: "2026-05-30", link: "https://uic.yonsei.ac.kr", 
    description: "Ёнсей олон улсын коллежийн бакалаврын тэтгэлэг.",
    requirements: ["English proficiency (IELTS/TOEFL)", "Interview success"],
    checklist: ["UIC Application Form", "Transcripts", "Personal Statement"]
  },
  { 
    title: "HKU Entrance Scholarship", country: "Hong Kong", organization: "HKU", category: "Full", deadline: "2026-01-30", link: "https://admissions.hku.hk", 
    description: "Хонг Конгийн их сургуулийн шилдэг элсэгчдэд зориулсан.",
    requirements: ["IB 43+ / SAT 1500+", "Interview performance"],
    checklist: ["Online Application", "Personal Statement", "School Reference"]
  },
  { 
    title: "NUS ASEAN Undergraduate", country: "Singapore", organization: "NUS", category: "Full", deadline: "2026-01-01", link: "https://www.nus.edu.sg", 
    description: "Сингапурын үндэсний их сургуулийн Азийн оюутны тэтгэлэг.",
    requirements: ["Asian citizen", "Strong leadership potential"],
    checklist: ["Admission Application", "Activity List", "Personal Statement"]
  },
  { 
    title: "NTU Nanyang Scholarship", country: "Singapore", organization: "NTU", category: "Full", deadline: "2026-01-15", link: "https://www.ntu.edu.sg", 
    description: "Сингапурын Наньян технологийн сургуулийн тэтгэлэг.",
    requirements: ["Excellent academic results", "Leadership qualities"],
    checklist: ["Scholarship Application", "Referee Appraisal", "Personal Essay"]
  },
  { 
    title: "Tsinghua University Scholarship", country: "China", organization: "Tsinghua University", category: "Full", deadline: "2025-12-15", link: "https://www.tsinghua.edu.cn", 
    description: "Хятадын топ сургууль Цинхуа-ийн тэтгэлэг.",
    requirements: ["Academic merit", "HSK 5 for Chinese track"],
    checklist: ["Online Application", "Research Plan", "2 Recommendation Letters"]
  },
  { 
    title: "Peking University Scholarship", country: "China", organization: "Peking University", category: "Full", deadline: "2026-03-31", link: "https://www.pku.edu.cn", 
    description: "Бээжин их сургуулийн олон улсын оюутны тэтгэлэг.",
    requirements: ["High academic standing", "Language proficiency"],
    checklist: ["Application Form", "Transcripts", "Letter of Motivation"]
  },
  { 
    title: "Nagoya G30 Scholarship", country: "Japan", organization: "Nagoya University", category: "Full", deadline: "2026-01-20", link: "https://admissions.g30.nagoya-u.ac.jp", 
    description: "Нагоя их сургуулийн Англи хэл дээрх хөтөлбөрийн тэтгэлэг.",
    requirements: ["Excellent grades", "SAT/ACT preferred"],
    checklist: ["Application Form", "Essays", "Standardized Test Scores"]
  },
  { 
    title: "APU Tuition Reduction", country: "Japan", organization: "Ritsumeikan APU", category: "Partial", deadline: "2026-03-15", link: "https://admissions.apu.ac.jp", 
    description: "Японы APU сургуулийн 30-100% төлбөрийн хөнгөлөлт.",
    requirements: ["Application quality", "Interview performance"],
    checklist: ["Assessment Essay", "Language Certificate", "Reference"]
  },
  { 
    title: "Hokkaido President's Scholarship", country: "Japan", organization: "Hokkaido University", category: "Full", deadline: "2026-01-10", link: "https://www.global.hokudai.ac.jp", 
    description: "Хоккайдо их сургуулийн шилдэг магистрантуудад.",
    requirements: ["Top of class", "Master's applicant"],
    checklist: ["Research Plan", "Recommendation Letter", "Transcript"]
  },

  // --- 41-50: КАНАД & АВСТРАЛИЙН ИХ СУРГУУЛИУД ---
  { 
    title: "Lester B. Pearson Scholarship", country: "Canada", organization: "University of Toronto", category: "Full", deadline: "2026-01-15", link: "https://future.utoronto.ca", 
    description: "Торонтогийн их сургуулийн бакалаврын шилдэг тэтгэлэг.",
    requirements: ["School nomination", "Original thinker"],
    checklist: ["Nomination Form", "Student Application", "Essays"]
  },
  { 
    title: "University of Melbourne International", country: "Australia", organization: "Melbourne Uni", category: "Full", deadline: "2026-10-31", link: "https://scholarships.unimelb.edu.au", 
    description: "Мельбурн их сургуулийн бакалаврын төлбөрийн 100% тэтгэлэг.",
    requirements: ["Top 3% of results", "International student"],
    checklist: ["Automatic assessment", "No separate application"]
  },
  { 
    title: "Sydney Vice-Chancellor's", country: "Australia", organization: "University of Sydney", category: "Partial", deadline: "2026-01-15", link: "https://www.sydney.edu.au", 
    description: "Сиднейн их сургуулийн 40,000$ хүртэлх тэтгэлэг.",
    requirements: ["High academic achievement", "Unconditional offer"],
    checklist: ["Admissions Offer", "Scholarship Letter"]
  },
  { 
    title: "Monash International Leadership", country: "Australia", organization: "Monash University", category: "Full", deadline: "2026-01-15", link: "https://www.monash.edu", 
    description: "Монаш их сургуулийн бүрэн тэтгэлэг.",
    requirements: ["Leadership potential", "Top academic record"],
    checklist: ["Scholarship Application", "Statement of Purpose"]
  },
  { 
    title: "ANU Chancellor's", country: "Australia", organization: "ANU", category: "Partial", deadline: "2025-12-30", link: "https://www.anu.edu.au", 
    description: "Австралийн үндэсний их сургуулийн төлбөрийн хөнгөлөлт.",
    requirements: ["International applicant", "High ATAR equivalent"],
    checklist: ["Admission Offer", "Automatic consideration"]
  },
  { 
    title: "McGill Merit Scholarship", country: "Canada", organization: "McGill University", category: "Partial", deadline: "2026-01-20", link: "https://www.mcgill.ca", 
    description: "МакГилл их сургуулийн академик тэтгэлэг.",
    requirements: ["Top grades", "International student"],
    checklist: ["Separate Application", "Letter of Recommendation"]
  },
  { 
    title: "Alberta Global Citizen", country: "Canada", organization: "University of Alberta", category: "Full", deadline: "2025-12-15", link: "https://www.ualberta.ca", 
    description: "Альберта их сургуулийн бүрэн тэтгэлэг.",
    requirements: ["Leadership", "Academic excellence", "Financial need"],
    checklist: ["Awards Application", "References", "Essay"]
  },
  { 
    title: "UNSW Future of Change", country: "Australia", organization: "UNSW", category: "Partial", deadline: "2026-03-31", link: "https://www.unsw.edu.au", 
    description: "UNSW-ийн олон улсын оюутны тэтгэлэг.",
    requirements: ["Admitted to UNSW", "Personal statement"],
    checklist: ["Scholarship Essay", "CV"]
  },
  { 
    title: "Adelaide Global Excellence", country: "Australia", organization: "University of Adelaide", category: "Partial", deadline: "2026-01-01", link: "https://www.adelaide.edu.au", 
    description: "Аделаид их сургуулийн төлбөрийн 50% хөнгөлөлт.",
    requirements: ["GPA 6.8/7.0", "International student"],
    checklist: ["Automatic assessment", "Offer letter"]
  },
  { 
    title: "Western University International", country: "Canada", organization: "Western University", category: "Full", deadline: "2026-02-14", link: "https://registrar.uwo.ca", 
    description: "Канадын Вестерн их сургуулийн ерөнхийлөгчийн тэтгэлэг.",
    requirements: ["95%+ GPA", "Exceptional leadership"],
    checklist: ["Nomination Form", "Personal Essay"]
  },

  // --- 51-100 хүртэлх бүх өгөгдлийг нэг бүрчлэн үргэлжлүүлж байна ---
  { 
    title: "ETH Zurich Excellence", country: "Switzerland", organization: "ETH Zurich", category: "Full", deadline: "2025-12-15", link: "https://ethz.ch", 
    description: "Европын техникийн топ сургууль ETH-ийн магистрын тэтгэлэг.",
    requirements: ["Top 10% Bachelor", "Research proposal"],
    checklist: ["Pre-proposal", "Motivation Letter", "CV"]
  },
  { 
    title: "TU Delft Excellence", country: "Netherlands", organization: "TU Delft", category: "Full", deadline: "2025-12-01", link: "https://www.tudelft.nl", 
    description: "Нидерландын Делфтийн технологийн сургуулийн тэтгэлэг.",
    requirements: ["GPA 80%+", "English score"],
    checklist: ["Application Form", "2 Reference Letters"]
  },
  { 
    title: "Leiden Excellence Scholarship", country: "Netherlands", organization: "Leiden University", category: "Partial", deadline: "2026-02-01", link: "https://www.universiteitleiden.nl", 
    description: "Лейден их сургуулийн магистрын тэтгэлэг.",
    requirements: ["Non-EU student", "Academic excellence"],
    checklist: ["Motivation Letter", "Online Application"]
  },
  { 
    title: "Utrecht Excellence", country: "Netherlands", organization: "Utrecht University", category: "Full", deadline: "2026-02-01", link: "https://www.uu.nl", 
    description: "Утрехт их сургуулийн магистрын тэтгэлэг.",
    requirements: ["Top 10% of class", "Master's applicant"],
    checklist: ["Scholarship Request", "Reference Letter"]
  },
  { 
    title: "Bologna University Grant", country: "Italy", organization: "Uni Bologna", category: "Full", deadline: "2026-03-31", link: "https://www.unibo.it", 
    description: "Италийн Болонья их сургуулийн тэтгэлэг.",
    requirements: ["SAT/GRE test scores", "Under 30 years old"],
    checklist: ["Test Score Report", "ID Copy"]
  },
  { 
    title: "Politecnico di Milano Gold", country: "Italy", organization: "Polimi", category: "Full", deadline: "2026-02-15", link: "https://www.polimi.it", 
    description: "Миланы Политехникийн сургуулийн магистрын тэтгэлэг.",
    requirements: ["Outstanding GPA", "English proficiency"],
    checklist: ["Online Application", "Portfolio (for Design)"]
  },
  { 
    title: "Lund University Global", country: "Sweden", organization: "Lund University", category: "Partial", deadline: "2026-02-01", link: "https://www.lunduniversity.lu.se", 
    description: "Шведийн Лунд их сургуулийн төлбөрийн хөнгөлөлт.",
    requirements: ["Top academic record", "Non-EU student"],
    checklist: ["Scholarship Essay", "University Application"]
  },
  { 
    title: "KTH Royal Institute Grant", country: "Sweden", organization: "KTH", category: "Partial", deadline: "2026-01-15", link: "https://www.kth.se", 
    description: "Шведийн техникийн топ сургууль KTH-ийн тэтгэлэг.",
    requirements: ["Master's applicant", "Merit-based selection"],
    checklist: ["Motivation Essay", "CV", "Transcripts"]
  },
  { 
    title: "Aalto University Full", country: "Finland", organization: "Aalto University", category: "Full", deadline: "2026-01-15", link: "https://www.aalto.fi", 
    description: "Финландын Аалто их сургуулийн төлбөрийн 100% тэтгэлэг.",
    requirements: ["Academic merit", "Successful admission"],
    checklist: ["Admission Application", "Scholarship Choice"]
  },
  { 
    title: "University of Oulu Aid", country: "Finland", organization: "Oulu University", category: "Partial", deadline: "2026-01-20", link: "https://www.oulu.fi", 
    description: "Оулу их сургуулийн олон улсын оюутны тэтгэлэг.",
    requirements: ["Academic record", "English skill"],
    checklist: ["Application Form", "Transcripts"]
  },
  { 
    title: "Ghent Master's Grant", country: "Belgium", organization: "Ghent University", category: "Full", deadline: "2026-02-01", link: "https://www.ugent.be", 
    description: "Бельгийн Гент их сургуулийн магистрын тэтгэлэг.",
    requirements: ["Developing country student", "Good GPA"],
    checklist: ["Application Portal", "Recommendation Letter"]
  },
  { 
    title: "University of Vienna Aid", country: "Austria", organization: "Uni Vienna", category: "Partial", deadline: "2026-03-01", link: "https://www.univie.ac.at", 
    description: "Венийн их сургуулийн төлбөрийн хөнгөлөлт.",
    requirements: ["Academic merit", "Language skill"],
    checklist: ["Scholarship Request", "ID"]
  },
  { 
    title: "Copenhagen University Grant", country: "Denmark", organization: "UCPH", category: "Full", deadline: "2026-01-15", link: "https://www.ku.dk", 
    description: "Данийн Копенгагены их сургуулийн магистрын тэтгэлэг.",
    requirements: ["Non-EU student", "Outstanding academic record"],
    checklist: ["Admission Application", "Motivation Essay"]
  },
  { 
    title: "Berea College Full Tuition", country: "USA", organization: "Berea College", category: "Full", deadline: "2026-01-15", link: "https://www.berea.edu", 
    description: "АНУ-д 4 жил үнэгүй суралцах боломжтой коллеж.",
    requirements: ["Financial need", "Strong grades"],
    checklist: ["Financial Statement", "Essays", "Transcripts"]
  },
  { 
    title: "Rhodes Scholarship Oxford", country: "UK", organization: "Oxford University", category: "Full", deadline: "2025-10-01", link: "https://www.rhodeshouse.ox.ac.uk", 
    description: "Оксфордод суралцах хамгийн нэр хүндтэй тэтгэлэг.",
    requirements: ["Academic leadership", "Ages 18-24"],
    checklist: ["Personal Statement", "6 References", "List of Activities"]
  },
  { 
    title: "Schwarzman Scholars", country: "China", organization: "Tsinghua", category: "Full", deadline: "2025-09-20", link: "https://www.schwarzmanscholars.org", 
    description: "Цинхуа их сургуулийн дэлхийн манлайлагчдад зориулсан.",
    requirements: ["Leadership potential", "Ages 18-28"],
    checklist: ["Video Intro", "Essays", "3 Recommendations"]
  },
  { 
    title: "Gates Cambridge Scholarship", country: "UK", organization: "Cambridge", category: "Full", deadline: "2026-01-05", link: "https://www.gatescambridge.org", 
    description: "Кэмбрижийн их сургуулийн бүрэн тэтгэлэг.",
    requirements: ["Non-UK citizen", "Academic intellect"],
    checklist: ["Gates Statement", "Research Proposal", "References"]
  },
  { 
    title: "ADB Japan Scholarship", country: "Global", organization: "ADB", category: "Full", deadline: "2026-05-31", link: "https://www.adb.org", 
    description: "Азийн хөгжлийн банкны магистрын тэтгэлэг.",
    requirements: ["2 years work experience", "Under 35 years old"],
    checklist: ["Income Proof", "Work Certificate", "Admission Offer"]
  },
  { 
    title: "World Bank Scholarship", country: "Global", organization: "World Bank", category: "Full", deadline: "2026-05-20", link: "https://www.worldbank.org", 
    description: "Дэлхийн банкны хөгжлийн чиглэлийн магистрын тэтгэлэг.",
    requirements: ["3 years work experience", "Bachelor degree"],
    checklist: ["Admission Letter", "Employer Certificate", "2 References"]
  },
  { 
    title: "AAUW International Fellowships", country: "USA", organization: "AAUW", category: "Full", deadline: "2025-11-15", link: "https://www.aauw.org", 
    description: "АНУ-д суралцах эмэгтэйчүүдийн тэтгэлэг.",
    requirements: ["Non-US citizen woman", "Academic excellence"],
    checklist: ["Online Application", "Project Plan", "3 References"]
  },
  { 
    title: "Hubert Humphrey Fellowship", country: "USA", organization: "State Dept", category: "Full", deadline: "2026-06-01", link: "https://www.humphreyfellowship.org", 
    description: "АНУ-д мэргэжил дээшлүүлэх 10 сарын хөтөлбөр.",
    requirements: ["5 years work experience", "Leadership skill"],
    checklist: ["Program Plan", "Employer Support", "CV"]
  },
  { 
    title: "Insead MBA Scholarship", country: "Global", organization: "Insead", category: "Partial", deadline: "2026-02-15", link: "https://www.insead.edu", 
    description: "Дэлхийн топ бизнесийн сургууль Insead-ийн тэтгэлэг.",
    requirements: ["Insead Admission", "Financial need/Merit"],
    checklist: ["Scholarship Essay", "Financial Profile"]
  },
  { 
    title: "Knight-Hennessy Scholars", country: "USA", organization: "Stanford", category: "Full", deadline: "2025-10-10", link: "https://knight-hennessy.stanford.edu", 
    description: "Стэнфордын их сургуулийн шилдэг оюутны тэтгэлэг.",
    requirements: ["Stanford Admission", "Purposeful leadership"],
    checklist: ["Video Story", "Essays", "Resume"]
  },
  { 
    title: "Duke Robertson Scholars", country: "USA", organization: "Duke Uni", category: "Full", deadline: "2025-11-15", link: "https://robertsonscholars.org", 
    description: "Дьюк их сургуулийн манлайллын тэтгэлэг.",
    requirements: ["Outstanding leadership", "Top grades"],
    checklist: ["Separate Application", "Essays", "References"]
  },
  { 
    title: "Emory University Scholars", country: "USA", organization: "Emory", category: "Full", deadline: "2025-11-15", link: "https://apply.emory.edu", 
    description: "Эмори их сургуулийн академик тэтгэлэг.",
    requirements: ["Early application", "Outstanding grades"],
    checklist: ["Scholarship Choice in Common App"]
  },
  { 
    title: "USC Trustee Scholarship", country: "USA", organization: "USC", category: "Full", deadline: "2025-12-01", link: "https://admission.usc.edu", 
    description: "Өмнөд Калифорнийн сургуулийн бүрэн тэтгэлэг.",
    requirements: ["Admitted to USC", "Top academic performance"],
    checklist: ["Automatic consideration via Common App"]
  },
  { 
    title: "Boston Presidential Scholarship", country: "USA", organization: "BU", category: "Partial", deadline: "2025-12-01", link: "https://www.bu.edu", 
    description: "Бостоны их сургуулийн төлбөрийн хөнгөлөлт.",
    requirements: ["95%+ GPA", "Exceptional merit"],
    checklist: ["Admission Application", "Scholarship Choice"]
  },
  { 
    title: "Notre Dame Hesburgh-Yusko", country: "USA", organization: "Notre Dame", category: "Full", deadline: "2026-01-01", link: "https://hesburgh-yusko.nd.edu", 
    description: "Нотр Дам сургуулийн манлайллын тэтгэлэг.",
    requirements: ["Commitment to service", "Academic Excellence"],
    checklist: ["Application", "References", "Interview"]
  },
  { 
    title: "Vanderbilt Cornelius Scholarship", country: "USA", organization: "Vanderbilt", category: "Full", deadline: "2025-12-01", link: "https://www.vanderbilt.edu", 
    description: "Вандербильтийн шилдэг оюутны тэтгэлэг.",
    requirements: ["Academic merit", "Leadership potential"],
    checklist: ["Application for Scholarship", "Reference"]
  },
  { 
    title: "WashU Rodriguez Scholars", country: "USA", organization: "WashU", category: "Full", deadline: "2026-01-05", link: "https://admissions.wustl.edu", 
    description: "Вашингтон их сургуулийн манлайллын тэтгэлэг.",
    requirements: ["Service commitment", "Leadership"],
    checklist: ["Scholarship Application", "Essays"]
  },
  { 
    title: "Rice Trustee Distinguished", country: "USA", organization: "Rice Uni", category: "Full", deadline: "2026-01-01", link: "https://admission.rice.edu", 
    description: "Райс их сургуулийн академик тэтгэлэг.",
    requirements: ["Top grades", "High test scores"],
    checklist: ["Automatic consideration via Common App"]
  },
  { 
    title: "Johns Hopkins Hodson", country: "USA", organization: "JHU", category: "Full", deadline: "2026-01-02", link: "https://apply.jhu.edu", 
    description: "Жонс Хопкинсийн шилдэг элсэгчдийн тэтгэлэг.",
    requirements: ["Academic excellence", "Leadership"],
    checklist: ["Automatic assessment", "Review of Common App"]
  },
  { 
    title: "Davidson Belk Scholarship", country: "USA", organization: "Davidson", category: "Full", deadline: "2025-12-15", link: "https://www.davidson.edu", 
    description: "Дэвидсон коллежийн бүрэн тэтгэлэг.",
    requirements: ["School nomination", "Unique leadership"],
    checklist: ["Nomination Form", "Student Essays"]
  },
  { 
    title: "Richmond Scholars", country: "USA", organization: "Uni Richmond", category: "Full", deadline: "2025-12-01", link: "https://scholars.richmond.edu", 
    description: "Ричмонд их сургуулийн нэрэмжит тэтгэлэг.",
    requirements: ["Top of class", "Diverse interests"],
    checklist: ["Automatic via Common App"]
  },
  { 
    title: "Wake Forest Reynolds", country: "USA", organization: "Wake Forest", category: "Full", deadline: "2026-01-01", link: "https://admissions.wfu.edu", 
    description: "Уэйк Форест сургуулийн бүрэн тэтгэлэг.",
    requirements: ["Academic intellect", "Social consciousness"],
    checklist: ["Application Form", "Essays", "Interview"]
  },
  { 
    title: "UChicago Odyssey Scholarship", country: "USA", organization: "UChicago", category: "Full", deadline: "2026-01-02", link: "https://collegeadmissions.uchicago.edu", 
    description: "Чикаго их сургуулийн санхүүгийн дэмжлэг.",
    requirements: ["Financial need", "First-gen college student preferred"],
    checklist: ["CSS Profile", "FAFSA (for US)", "Tax Docs"]
  },
  { 
    title: "Brown University Financial Aid", country: "USA", organization: "Brown Uni", category: "Full", deadline: "2026-01-05", link: "https://finaid.brown.edu", 
    description: "Браун их сургуулийн санхүүгийн тусламж.",
    requirements: ["Demonstrated need", "Admitted student"],
    checklist: ["CSS Profile", "Income Statement"]
  },
  { 
    title: "Caltech Aid Program", country: "USA", organization: "Caltech", category: "Full", deadline: "2026-01-03", link: "https://finaid.caltech.edu", 
    description: "Калтехийн хэрэгцээнд суурилсан тэтгэлэг.",
    requirements: ["Admitted to Caltech", "Financial documentation"],
    checklist: ["CSS Profile", "Tax Returns"]
  },
  { 
    title: "Rochester Prince Street", country: "USA", organization: "Uni Rochester", category: "Partial", deadline: "2026-01-05", link: "https://www.rochester.edu", 
    description: "Рочестер их сургуулийн академик тэтгэлэг.",
    requirements: ["High grades", "Strong extracurriculars"],
    checklist: ["Common App", "Optional Portfolio"]
  },
  { 
    title: "Case Western Presidential", country: "USA", organization: "CWRU", category: "Full", deadline: "2026-01-15", link: "https://case.edu", 
    description: "Кэйс Вестерн их сургуулийн тэтгэлэг.",
    requirements: ["Top academic standing", "Leadership"],
    checklist: ["Automatic via Common App"]
  },
  { 
    title: "Tulane Dean's Honor Scholarship", country: "USA", organization: "Tulane University", category: "Full", deadline: "2025-12-05", link: "https://admission.tulane.edu", 
    description: "Тулейн их сургуулийн бүрэн тэтгэлэг.",
    requirements: ["Outstanding academics", "Separate scholarship application"],
    checklist: ["Scholarship Essay", "Standardized Test Scores"]
  },
  { 
    title: "Wellesley College Financial Aid", country: "USA", organization: "Wellesley", category: "Full", deadline: "2026-01-15", link: "https://www.wellesley.edu", 
    description: "Эмэгтэйчүүдийн шилдэг коллежийн тэтгэлэг.",
    requirements: ["Female student", "Demonstrated need"],
    checklist: ["CSS Profile", "Tax Forms"]
  },
  { 
    title: "Smith College Aid", country: "USA", organization: "Smith College", category: "Full", deadline: "2026-01-15", link: "https://www.smith.edu", 
    description: "Смит коллежийн олон улсын тэтгэлэг.",
    requirements: ["International female", "Financial need"],
    checklist: ["CSS Profile", "Financial Aid Form"]
  },
  { 
    title: "Amherst College Aid", country: "USA", organization: "Amherst", category: "Full", deadline: "2026-01-01", link: "https://www.amherst.edu", 
    description: "Амхерст коллежийн хэрэгцээнд суурилсан тэтгэлэг.",
    requirements: ["Need-blind admission", "All nationalities"],
    checklist: ["CSS Profile", "Income Docs"]
  },
  { 
    title: "Williams College Aid", country: "USA", organization: "Williams", category: "Full", deadline: "2026-01-01", link: "https://www.williams.edu", 
    description: "Уильямс коллежийн бүрэн санхүүгийн тусламж.",
    requirements: ["Admitted student", "Financial need"],
    checklist: ["CSS Profile", "Tax Statement"]
  },
  { 
    title: "Pomona College Financial Aid", country: "USA", organization: "Pomona", category: "Full", deadline: "2026-01-01", link: "https://www.pomona.edu", 
    description: "Помона коллежийн тэтгэлэг.",
    requirements: ["Demonstrated need", "Top grades"],
    checklist: ["CSS Profile", "Financial Docs"]
  },
  { 
    title: "Swarthmore College Aid", country: "USA", organization: "Swarthmore", category: "Full", deadline: "2026-01-01", link: "https://www.swarthmore.edu", 
    description: "Суартмор коллежийн олон улсын тэтгэлэг.",
    requirements: ["Academic merit", "Financial need"],
    checklist: ["CSS Profile", "Income Proof"]
  },
  { 
    title: "Bowdoin College Aid", country: "USA", organization: "Bowdoin", category: "Full", deadline: "2026-01-01", link: "https://www.bowdoin.edu", 
    description: "Боудин коллежийн Need-blind тэтгэлэг.",
    requirements: ["International applicant", "Admitted status"],
    checklist: ["CSS Profile", "Financial Aid Docs"]
  },
  { 
    title: "Carleton College Aid", country: "USA", organization: "Carleton", category: "Full", deadline: "2026-01-15", link: "https://www.carleton.edu", 
    description: "Карлетон коллежийн санхүүгийн дэмжлэг.",
    requirements: ["Top results", "Financial need"],
    checklist: ["CSS Profile", "Income Statement"]
  },
  { 
    title: "Claremont McKenna Aid", country: "USA", organization: "CMC", category: "Full", deadline: "2026-01-01", link: "https://www.cmc.edu", 
    description: "CMC коллежийн тэтгэлэг.",
    requirements: ["Leadership", "Academic merit"],
    checklist: ["Common App", "CSS Profile"]
  },
  // --- БНХАУ: МУЖИЙН БОЛОН СУРГУУЛИЙН ТЭТГЭЛЭГҮҮД ---
  { 
    title: "Shanghai Government Scholarship (SGS)", country: "China", organization: "Shanghai Municipal Government", category: "Full", deadline: "2026-05-15", link: "http://study.shmec.gov.cn", 
    description: "Шанхай хотын их сургуулиудад суралцах олон улсын оюутнуудад олгодог тэтгэлэг.",
    requirements: ["GPA 3.0+", "HSK 4+ (for Chinese track)", "Under 35 for Masters"],
    checklist: ["SGS Online Form", "Study Plan", "2 Recommendation Letters", "Medical Form"]
  },
  { 
    title: "Beijing Government Scholarship", country: "China", organization: "Beijing Municipality", category: "Partial", deadline: "2026-04-30", link: "http://www.ebeijing.gov.cn", 
    description: "Бээжин хотын их сургуулиудад суралцаж буй гадаад оюутнуудын сургалтын төлбөрийг санхүүжүүлнэ.",
    requirements: ["Admitted to a Beijing University", "Good academic standing"],
    checklist: ["Application Form", "Transcripts", "Foreigner Physical Examination"]
  },
  { 
    title: "Jiangsu Provincial Government Scholarship", country: "China", organization: "Jiangsu Province", category: "Full", deadline: "2026-05-31", link: "http://www.studyinjiangsu.org", 
    description: "Нанжин болон Зянсу мужийн сургуулиудад суралцах шилдэг оюутнуудад.",
    requirements: ["Excellent academic record", "Non-Chinese citizen"],
    checklist: ["Online Application", "Diploma Translation", "Personal Statement"]
  },
  { 
    title: "Zhejiang University Scholarship", country: "China", organization: "Zhejiang University", category: "Full", deadline: "2026-03-31", link: "https://iczu.zju.edu.cn", 
    description: "Хятадын шилдэг 3 сургуулийн нэг болох Жөжянь их сургуулийн нэрэмжит тэтгэлэг.",
    requirements: ["High GPA", "Competitive HSK or TOEFL scores"],
    checklist: ["ZJU Online Application", "Two Reference Letters", "Study Research Plan"]
  },
  { 
    title: "SJTU University Scholarship", country: "China", organization: "Shanghai Jiao Tong University", category: "Full", deadline: "2026-03-31", link: "https://isc.sjtu.edu.cn", 
    description: "Шанхай Жяо Тонг их сургуулийн магистр, докторын бүрэн тэтгэлэг.",
    requirements: ["Top tier Bachelor degree", "Strong research background"],
    checklist: ["SJTU Apply Form", "Research Proposal", "CV", "Language Certificate"]
  },

  // --- ТАЙВАНЬ: СУРГУУЛИУДЫН ТЭТГЭЛЭГ ---
  { 
    title: "NTU International Student Scholarship", country: "Taiwan", organization: "National Taiwan University", category: "Full", deadline: "2026-02-28", link: "https://admissions.ntu.edu.tw", 
    description: "Тайванийн үндэсний их сургуулийн (NTU) олон улсын шилдэг элсэгчдэд зориулсан.",
    requirements: ["Outstanding academic record", "English or Chinese proficiency"],
    checklist: ["NTU Online Portal", "Financial Statement", "Study Plan", "2 Recommendations"]
  },
  { 
    title: "NTHU International Student Scholarship", country: "Taiwan", organization: "National Tsing Hua University", category: "Full", deadline: "2026-03-15", link: "https://oga.site.nthu.edu.tw", 
    description: "Технологийн шилдэг сургууль NTHU-ийн сар бүрийн тэтгэмжтэй тэтгэлэг.",
    requirements: ["Top 10% of class", "Strong research interest"],
    checklist: ["Application Form", "Transcripts", "Statement of Purpose"]
  },

  // --- ӨМНӨД СОЛОНГОС: СУРГУУЛИУДЫН ТЭТГЭЛЭГ ---
  { 
    title: "Korea University International Scholarship", country: "South Korea", organization: "Korea University", category: "Full", deadline: "2026-04-15", link: "https://oia.korea.ac.kr", 
    description: "Солонгосын 'SKY' сургуулийн нэг болох Korea University-ийн тэтгэлэг.",
    requirements: ["GPA 3.5+", "TOPIK 4+ or IELTS 6.5+"],
    checklist: ["Online Application", "Letter of Recommendation", "Academic Honors Proof"]
  },
  { 
    title: "Sungkyunkwan (SKKU) International Excellence", country: "South Korea", organization: "SKKU", category: "Full", deadline: "2026-03-30", link: "https://www.skku.edu", 
    description: "Самсунг корпорациар дэмжигддэг SKKU-ийн төлбөрийн 100% тэтгэлэг.",
    requirements: ["Admission interview success", "High academic standing"],
    checklist: ["Application Form", "Self-introduction Essay", "Parental Support Proof"]
  },
  { 
    title: "Hanyang University International Excellence", country: "South Korea", organization: "Hanyang University", category: "Partial", deadline: "2026-04-20", link: "https://study.hanyang.ac.kr", 
    description: "Ханян их сургуулийн төлбөрийн 30%, 50%, 100% хөнгөлөлтүүд.",
    requirements: ["TOPIK level 5 or 6", "GPA 3.0+ from previous school"],
    checklist: ["Scholarship Application", "TOPIK Score Report", "Portfolio (for Arts)"]
  },

  // --- ЯПОН: СУРГУУЛИУДЫН ТЭТГЭЛЭГ (MEXT-ЭЭС ГАДНА) ---
  { 
    title: "Waseda University Reserved Scholarship", country: "Japan", organization: "Waseda University", category: "Full", deadline: "2025-12-15", link: "https://www.waseda.jp", 
    description: "Васеда их сургуульд элсэхээс өмнө олгодог нэрэмжит тэтгэлэг.",
    requirements: ["Excellent admission score", "International student status"],
    checklist: ["Admission Application", "Scholarship Choice Form", "Reference Letters"]
  },
  { 
    title: "Keio University Design the Future", country: "Japan", organization: "Keio University", category: "Full", deadline: "2026-01-20", link: "https://www.keio.ac.jp", 
    description: "Японы хамгийн эртний хувийн сургууль Кэйио-ийн бүрэн тэтгэлэг.",
    requirements: ["Strong leadership record", "Exceptional academic background"],
    checklist: ["Special Application Form", "Essay on Future Goals", "Research Proposal"]
  },
  { 
    title: "University of Tokyo PEAK Scholarship", country: "Japan", organization: "University of Tokyo", category: "Full", deadline: "2025-11-30", link: "https://peak.c.u-tokyo.ac.jp", 
    description: "Токиогийн их сургуулийн Англи хэл дээрх бакалаврын хөтөлбөрт олгодог.",
    requirements: ["Standardized test scores (SAT/IB/ACT)", "Exceptional grades"],
    checklist: ["Application via PEAK portal", "Two Essays", "Teacher Evaluations"]
  },
  { 
    title: "Osaka University University-Recommended", country: "Japan", organization: "Osaka University", category: "Full", deadline: "2026-01-10", link: "https://www.osaka-u.ac.jp", 
    description: "Осака их сургуулийн судалгааны ажил болон сургалтын төлбөрийг даах тэтгэлэг.",
    requirements: ["Research track Master/PhD", "High GPA"],
    checklist: ["Research Plan", "Acceptance Letter from Supervisor", "Transcripts"]
  },
  { 
    title: "Kyushu University MEXT-University track", country: "Japan", organization: "Kyushu University", category: "Full", deadline: "2026-02-15", link: "https://www.kyushu-u.ac.jp", 
    description: "Кюүшү их сургуулиас шууд санал болгодог MEXT-ийн квоттой тэтгэлэг.",
    requirements: ["English or Japanese proficiency", "Strong interview"],
    checklist: ["MEXT Application Form", "Study Proposal", "Official Transcripts"]
  },

  // --- ОХУ БОЛОН ТӨВ АЗИ ---
  { 
    title: "Open Doors: Russian Scholarship Project", country: "Russia", organization: "Global Universities Association", category: "Full", deadline: "2025-12-10", link: "https://od.globaluni.ru", 
    description: "Оросын шилдэг сургуулиудад шалгалтгүйгээр магистр, докторт суралцах олон улсын олимпиад.",
    requirements: ["Bachelor or Master degree", "Online portfolio competition", "Subject exam"],
    checklist: ["Portfolio (Certificates, Research)", "Online Test", "Identity Document"]
  },
  { 
    title: "Nazarbayev University International Award", country: "Kazakhstan", organization: "Nazarbayev University", category: "Full", deadline: "2026-04-01", link: "https://nu.edu.kz", 
    description: "Төв Азийн шилдэг сургуульд бакалавр, магистрт Англи хэл дээр үнэгүй суралцах боломж.",
    requirements: ["IELTS 6.5+", "SAT or Graduate Tests", "Strong GPA"],
    checklist: ["Online Application", "Personal Statement", "2 Reference Letters"]
  },

  // --- ЕВРОПЫН БУСАД УЛСУУД ---
  { 
    title: "Visegrad Scholarship", country: "Czech/Hungary/Poland/Slovakia", organization: "International Visegrad Fund", category: "Full", deadline: "2026-03-15", link: "https://www.visegradfund.org", 
    description: "Визеградын дөрвөл улсад магистр, докторт суралцах тэтгэлэг.",
    requirements: ["Bachelor degree", "Acceptance letter from host university"],
    checklist: ["Scan of Diploma", "Acceptance Letter", "Research/Study Plan"]
  },
  { 
    title: "Government of Ireland International Education", country: "Ireland", organization: "Higher Education Authority", category: "Full", deadline: "2026-03-25", link: "https://euraxess.ie", 
    description: "Ирландад 1 жил магистрт суралцахад 10,000 еврогийн тэтгэмж олгоно.",
    requirements: ["Exceptional academic record", "Excellent communication skills"],
    checklist: ["Application Form", "2 Reference Letters", "Admission Offer"]
  },

  // --- УРЛАГ, СПОРТ, ТУСГАЙ ЧИГЛЭЛ ---
  { 
    title: "AMA+ (Art Major Asian Plus)", country: "South Korea", organization: "K-Arts", category: "Full", deadline: "2026-03-31", link: "https://www.karts.ac.kr", 
    description: "Солонгосын үндэсний урлагийн их сургуульд хөгжим, бүжиг, кино, дүрслэх урлагаар суралцах бүрэн тэтгэлэг.",
    requirements: ["Portfolio (Required)", "Health Certificate", "Artistic talent"],
    checklist: ["Portfolio", "3 Recommendation Letters", "Medical Exam", "Personal Statement"]
  },
  { 
    title: "FIFA Master Scholarship", country: "Europe", organization: "CIES", category: "Full", deadline: "2026-01-10", link: "https://www.cies.ch", 
    description: "Спортын менежмент, хууль, хүмүүнлэгийн ухаанаар Европт суралцах дэлхийн топ хөтөлбөр.",
    requirements: ["Interest in Sports Industry", "University degree", "English proficiency"],
    checklist: ["Online Form", "Reference from Sports Org", "Degree Copy"]
  },

  // --- КАНАД БОЛОН АНУ (НЭМЭЛТ) ---
  { 
    title: "Vanier Canada Graduate Scholarships", country: "Canada", organization: "Government of Canada", category: "Full", deadline: "2025-11-01", link: "https://vanier.gc.ca", 
    description: "Канадад докторын зэрэг хамгаалахад олгодог жилийн 50,000 долларын тэтгэлэг.",
    requirements: ["Academic excellence", "Research potential", "Leadership"],
    checklist: ["Nomination by University", "Research Proposal", "CCV (Canadian Common CV)"]
  },
  { 
    title: "World Nomads Travel Scholarship", country: "Global", organization: "World Nomads", category: "Partial", deadline: "2026-04-20", link: "https://www.worldnomads.com", 
    description: "Аялал жуулчлал, гэрэл зураг, видео контент бүтээх сонирхолтой залууст зориулсан.",
    requirements: ["Portfolio (Video/Photos)", "18+ years old", "English skill"],
    checklist: ["Link to Work", "Short Essay", "Application Form"]
  },

  // --- ТАЙЛАНД БОЛОН ЗҮҮН ӨМНӨД АЗИ ---
  { 
    title: "Chulalongkorn University Scholarship", country: "Thailand", organization: "Chulalongkorn University", category: "Full", deadline: "2026-05-15", link: "https://www.chula.ac.th", 
    description: "Тайландын топ сургуульд олон улсын оюутан суралцах бүрэн тэтгэлэг.",
    requirements: ["GPA 3.0+", "Under 35 years old", "English proficiency"],
    checklist: ["Application Form", "Medical Report", "Study Plan"]
  },
  { 
    title: "SIIT Scholarship (Thammasat)", country: "Thailand", organization: "SIIT", category: "Full", deadline: "2025-09-30", link: "https://www.siit.tu.ac.th", 
    description: "Инженер, технологийн чиглэлээр Тайландад Англи хэл дээр үнэгүй суралцах.",
    requirements: ["Outstanding academic record", "Strong interest in Engineering"],
    checklist: ["Online Application", "Transcripts", "Personal Statement"]
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
                    deadline: Timestamp.fromDate(new Date(item.deadline)),
                    createdAt: Timestamp.now()
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