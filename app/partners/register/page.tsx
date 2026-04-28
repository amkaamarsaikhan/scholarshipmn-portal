"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { useForm } from "react-hook-form";
import { sendEmailVerification } from "firebase/auth";
import { auth, db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, where, limit, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { 
    Building2, 
    Image as ImageIcon, 
    Mail, 
    CheckCircle2,
    UploadCloud,
    AlertCircle,
    FileCheck,
    X,
    Eye,
    ChevronDown,
    PenLine,
    ReceiptText
} from 'lucide-react';

const SUPPORTED_COUNTRIES = [
    "Australia", "USA", "South Korea", "Japan", "Germany", 
    "Canada", "Hungary", "Ireland", "China", "UK", "Russia", 
    "IELTS", "TOPIK", "HSK", "JLPT", "German", "French", 
    "Математик", "Физик", "Нийгэм", "Эссэ бичих"
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

interface PartnerFormValues {
    name: string;
    email: string;
    phone: string;
    link: string;
    description: string;
    selectedCountries: string[];
    logo: FileList;
    featuredImage: FileList;
    contractAccepted: boolean;
    billingPlan: "monthly" | "yearly";
}

const BILLING_OPTIONS = {
    monthly: { label: "1 сар", amount: 100000, discountLabel: "" },
    yearly: { label: "1 жил", amount: 1000000, discountLabel: "17% хэмнэлт" },
} as const;

type InvoiceData = {
    invoiceNumber: string;
    amount: number;
    billingPlanLabel: string;
    partnerName: string;
    partnerEmail: string;
    issuedAtISO: string;
    signatureImage: string;
};

type ExistingPartnerDoc = {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    link?: string;
    description?: string;
    targetCountries?: string[];
    logo?: string;
    featuredImage?: string;
    approved?: boolean;
    billingPlan?: "monthly" | "yearly";
    eSignatureImage?: string;
};

function generateInvoiceNumber() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const random = Math.floor(10000 + Math.random() * 90000);
    return `INV-${y}${m}${d}-${random}`;
}

function formatMnt(amount: number) {
    return `${amount.toLocaleString("mn-MN")}₮`;
}

function escapeHtml(input: string) {
    return input
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function downloadInvoicePdf(invoice: InvoiceData) {
    const issued = new Date(invoice.issuedAtISO).toLocaleString("mn-MN");
    const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${invoice.invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #0f172a; margin: 32px; }
    .box { border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; }
    h1 { margin: 0 0 8px; color: #047857; }
    .muted { color: #64748b; font-size: 12px; }
    .row { margin: 8px 0; }
    .label { display: inline-block; width: 170px; font-weight: 700; }
    .amount { margin-top: 16px; padding: 12px; background: #ecfdf5; border-radius: 8px; font-weight: 700; font-size: 18px; }
  </style>
</head>
<body>
  <div class="box">
    <h1>ScholarshipMN Partner Invoice</h1>
    <p class="muted">Invoice Number: ${escapeHtml(invoice.invoiceNumber)}</p>
    <div class="row"><span class="label">Түнш байгууллага:</span> ${escapeHtml(invoice.partnerName)}</div>
    <div class="row"><span class="label">И-мэйл:</span> ${escapeHtml(invoice.partnerEmail)}</div>
    <div class="row"><span class="label">Багц:</span> ${escapeHtml(invoice.billingPlanLabel)}</div>
    <div class="row"><span class="label">Үүсгэсэн огноо:</span> ${escapeHtml(issued)}</div>
    <div class="row"><span class="label">Цахим гарын үсэг:</span></div>
    <div class="row"><img src="${invoice.signatureImage}" alt="signature" style="max-width: 280px; max-height: 100px; border-bottom: 1px solid #334155;" /></div>
    <div class="amount">Төлөх дүн: ${escapeHtml(formatMnt(invoice.amount))}</div>
    <p class="muted" style="margin-top: 20px;">
      Данс: MN810015001105591438 | Голомт банк | А.Амаржаргал
    </p>
  </div>
  <script>window.print();</script>
</body>
</html>
`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    if (!w) {
        alert("PDF нээх боломжгүй байна. Browser popup тохиргоогоо шалгана уу.");
    }
    setTimeout(() => URL.revokeObjectURL(url), 15000);
}

export default function PartnerRegisterPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showContractDetails, setShowContractDetails] = useState(false);
    const [savedInvoice, setSavedInvoice] = useState<InvoiceData | null>(null);
    const [emailVerifyNotice, setEmailVerifyNotice] = useState<string | null>(null);
    const [isResendingVerification, setIsResendingVerification] = useState(false);
    const [signatureDataUrl, setSignatureDataUrl] = useState("");
    const [isDrawing, setIsDrawing] = useState(false);
    const [existingPartner, setExistingPartner] = useState<ExistingPartnerDoc | null>(null);
    const [isPreloadingPartner, setIsPreloadingPartner] = useState(true);
    const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const { user } = useAuth();

    const { register, handleSubmit, reset, watch, setValue } = useForm<PartnerFormValues>({
        defaultValues: {
            billingPlan: "monthly",
            contractAccepted: false,
        },
    });

    // Сонгосон файлуудыг хянах
    const watchedLogo = watch("logo");
    const watchedBanner = watch("featuredImage");

    // Preview URL-уудыг хадгалах (Memory leak-ээс сэргийлж useEffect ашиглана)
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    useEffect(() => {
        if (watchedLogo && watchedLogo.length > 0) {
            const url = URL.createObjectURL(watchedLogo[0]);
            setLogoPreview(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setLogoPreview(null);
        }
    }, [watchedLogo]);

    useEffect(() => {
        if (watchedBanner && watchedBanner.length > 0) {
            const url = URL.createObjectURL(watchedBanner[0]);
            setBannerPreview(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setBannerPreview(null);
        }
    }, [watchedBanner]);

    useEffect(() => {
        const preloadPartner = async () => {
            if (!user) {
                setExistingPartner(null);
                setIsPreloadingPartner(false);
                return;
            }
            try {
                setIsPreloadingPartner(true);
                const partnerQuery = query(
                    collection(db, "partners"),
                    where("ownerUid", "==", user.uid),
                    limit(1)
                );
                const snap = await getDocs(partnerQuery);
                if (snap.empty) {
                    setExistingPartner(null);
                } else {
                    const found = snap.docs[0];
                    const partnerData = { id: found.id, ...(found.data() as Omit<ExistingPartnerDoc, "id">) };
                    setExistingPartner(partnerData);
                    setValue("name", partnerData.name || "");
                    setValue("email", partnerData.email || user.email || "");
                    setValue("phone", partnerData.phone || "");
                    setValue("link", partnerData.link || "");
                    setValue("description", partnerData.description || "");
                    setValue("selectedCountries", Array.isArray(partnerData.targetCountries) ? partnerData.targetCountries : []);
                    setValue("billingPlan", partnerData.billingPlan || "monthly");
                    if (partnerData.logo) setLogoPreview(partnerData.logo);
                    if (partnerData.featuredImage) setBannerPreview(partnerData.featuredImage);
                    if (partnerData.eSignatureImage) {
                        setSignatureDataUrl(partnerData.eSignatureImage);
                    }
                }
            } catch (err) {
                console.error("Partner preload error:", err);
            } finally {
                setIsPreloadingPartner(false);
            }
        };
        void preloadPartner();
    }, [user, setValue]);

    useEffect(() => {
        if (!signatureDataUrl) return;
        const canvas = signatureCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const padding = 12;
            const maxW = canvas.width - padding * 2;
            const maxH = canvas.height - padding * 2;
            const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
            const drawW = img.width * ratio;
            const drawH = img.height * ratio;
            const x = (canvas.width - drawW) / 2;
            const y = (canvas.height - drawH) / 2;
            ctx.drawImage(img, x, y, drawW, drawH);
        };
        img.src = signatureDataUrl;
    }, [signatureDataUrl]);

    const uploadFile = async (file: File, folder: string) => {
        if (file.size > MAX_FILE_SIZE) {
            throw new Error(`${file.name} - Зургийн хэмжээ 2MB-аас их байна!`);
        }
        const storageRef = ref(storage, `partners/${folder}/${Date.now()}_${file.name}`);
        const metadata = { contentType: file.type };
        const snapshot = await uploadBytes(storageRef, file, metadata);
        return await getDownloadURL(snapshot.ref);
    };

    const onSubmit = async (data: PartnerFormValues) => {
        setError(null);
        setEmailVerifyNotice(null);
        if (!user) {
            setError("Эхлээд хэрэглэгчээр бүртгүүлж, нэвтэрсний дараа partner хүсэлт илгээнэ үү.");
            return;
        }
        await user.reload();
        const refreshedUser = auth.currentUser;
        if (!refreshedUser?.emailVerified) {
            setError("Мэйлээ баталгаажуулаад дахин оролдоно уу.");
            setEmailVerifyNotice("Таны бүртгэлтэй мэйл баталгаажаагүй байна.");
            return;
        }
        if (!data.selectedCountries || data.selectedCountries.length === 0) {
            setError("Наад зах нь нэг чиглэл сонгоно уу!");
            return;
        }
        if (!existingPartner && !data.contractAccepted) {
            setError("Гэрээг зөвшөөрөх шаардлагатай.");
            return;
        }
        if (!existingPartner && !signatureDataUrl) {
            setError("Цахим гарын үсгээ зурна уу.");
            return;
        }

        setLoading(true);
        try {
            let logoUrl = existingPartner?.logo || "";
            let featuredImageUrl = existingPartner?.featuredImage || "";

            if (data.logo?.[0]) logoUrl = await uploadFile(data.logo[0], "logos");
            if (data.featuredImage?.[0]) featuredImageUrl = await uploadFile(data.featuredImage[0], "banners");

            if (existingPartner?.id) {
                await updateDoc(doc(db, "partners", existingPartner.id), {
                    name: data.name,
                    email: data.email,
                    ownerUid: refreshedUser.uid,
                    ownerEmail: refreshedUser.email || data.email,
                    phone: data.phone,
                    link: data.link,
                    description: data.description,
                    targetCountries: data.selectedCountries,
                    logo: logoUrl,
                    featuredImage: featuredImageUrl,
                    approved: false,
                    pendingReview: true,
                    updatedAt: serverTimestamp(),
                });
                setSavedInvoice(null);
            } else {
                const partnerRef = await addDoc(collection(db, "partners"), {
                    name: data.name,
                    email: data.email,
                    ownerUid: refreshedUser.uid,
                    ownerEmail: refreshedUser.email || data.email,
                    phone: data.phone,
                    link: data.link,
                    description: data.description,
                    targetCountries: data.selectedCountries,
                    logo: logoUrl,
                    featuredImage: featuredImageUrl,
                    approved: false,
                    contractAccepted: true,
                    eSignatureImage: signatureDataUrl,
                    billingPlan: data.billingPlan,
                    createdAt: serverTimestamp(),
                });

                const selectedPlan = BILLING_OPTIONS[data.billingPlan];
                const invoiceNumber = generateInvoiceNumber();
                const issuedAtISO = new Date().toISOString();
                const invoicePayload: InvoiceData = {
                    invoiceNumber,
                    amount: selectedPlan.amount,
                    billingPlanLabel: `${selectedPlan.label}${selectedPlan.discountLabel ? ` (${selectedPlan.discountLabel})` : ""}`,
                    partnerName: data.name,
                    partnerEmail: data.email,
                    issuedAtISO,
                    signatureImage: signatureDataUrl,
                };

                await addDoc(collection(db, "partnerInvoices"), {
                    ...invoicePayload,
                    partnerId: partnerRef.id,
                    bankAccount: "MN810015001105591438",
                    bankName: "ГОЛОМТ БАНК",
                    receiverName: "А.Амаржаргал",
                    status: "unpaid",
                    createdAt: serverTimestamp(),
                });

                setSavedInvoice(invoicePayload);
            }
            setSuccess(true);
            reset();
            setSignatureDataUrl("");
            clearSignaturePad();
        } catch (err: any) {
            setError(err.message || "Алдаа гарлаа.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setError(null);
        setEmailVerifyNotice(null);
        if (!user) {
            setError("Нэвтэрсний дараа баталгаажуулах мэйл илгээх боломжтой.");
            return;
        }
        try {
            setIsResendingVerification(true);
            await sendEmailVerification(user);
            setEmailVerifyNotice("Баталгаажуулах мэйл амжилттай илгээгдлээ. Inbox/Spam шалгана уу.");
        } catch (err: any) {
            const code = typeof err?.code === "string" ? err.code : "";
            if (code.includes("too-many-requests")) {
                setError("Түр хүлээгээд дахин оролдоно уу. Хэт олон хүсэлт илгээгдсэн байна.");
            } else {
                setError("Баталгаажуулах мэйл илгээхэд алдаа гарлаа.");
            }
        } finally {
            setIsResendingVerification(false);
        }
    };

    const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = signatureCanvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    };

    const beginSignature = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = signatureCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const point = getCanvasPoint(e);
        if (!ctx || !point) return;
        setIsDrawing(true);
        canvas.setPointerCapture(e.pointerId);
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
    };

    const drawSignature = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = signatureCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const point = getCanvasPoint(e);
        if (!ctx || !point) return;
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
    };

    const endSignature = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = signatureCanvasRef.current;
        if (!canvas) return;
        if (isDrawing) {
            const ctx = canvas.getContext("2d");
            ctx?.closePath();
            setSignatureDataUrl(canvas.toDataURL("image/png"));
        }
        setIsDrawing(false);
        if (canvas.hasPointerCapture(e.pointerId)) {
            canvas.releasePointerCapture(e.pointerId);
        }
    };

    const clearSignaturePad = () => {
        const canvas = signatureCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignatureDataUrl("");
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6 bg-[#F8FAFC]">
                <div className="text-center bg-white p-12 rounded-[3.5rem] shadow-2xl max-w-lg border border-emerald-50 italic">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase italic tracking-tighter">
                        {existingPartner ? "Мэдээлэл шинэчлэгдлээ!" : "Хүсэлт илгээгдлээ!"}
                    </h2>
                    <p className="text-slate-500 mb-8 font-bold">
                        {existingPartner
                            ? "Таны шинэчлэлт review төлөвт орлоо. Админ баталгаажуулсны дараа нийтлэгдэнэ."
                            : "Админ хянаад тантай эргэн холбогдох болно."}
                    </p>
                    {savedInvoice && (
                        <div className="mb-8 text-left bg-emerald-50 border border-emerald-100 p-5 rounded-2xl">
                            <p className="text-xs font-black text-emerald-700 mb-2 uppercase">Invoice</p>
                            <p className="text-sm font-bold text-slate-700">№ {savedInvoice.invoiceNumber}</p>
                            <p className="text-sm text-slate-600">Төлөх дүн: {formatMnt(savedInvoice.amount)}</p>
                            <Button
                                type="button"
                                onClick={() => downloadInvoicePdf(savedInvoice)}
                                className="mt-3 w-full bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl font-black"
                            >
                                <ReceiptText size={16} className="mr-2" />
                                PDF нэхэмжлэл татах
                            </Button>
                        </div>
                    )}
                    <Button onClick={() => window.location.href = "/"} className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 h-16 rounded-2xl font-black uppercase italic tracking-widest shadow-lg shadow-emerald-200">
                        Нүүр хуудас
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 px-6">
            <div className="max-w-5xl mx-auto">
                {isPreloadingPartner ? (
                    <div className="text-center py-20 text-slate-400 font-bold">Партнер мэдээлэл ачааллаж байна...</div>
                ) : (
                <>
                <section className="text-center mb-16" aria-labelledby="partner-register-title">
                    <h1 id="partner-register-title" className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase mb-4 italic">
                        Партнер <span className="text-emerald-600">{existingPartner ? "мэдээлэл шинэчлэх" : "болох"}</span>
                    </h1>
                    <p className="text-slate-500 font-medium max-w-2xl mx-auto">
                        Байгууллагын профайлаа бөглөж илгээсний дараа админ баг хянаж баталгаажуулна. Мөн{" "}
                        <Link href="/about" className="text-emerald-700 underline underline-offset-4">
                            Бидний тухай
                        </Link>{" "}
                        болон{" "}
                        <Link href="/privacy" className="text-emerald-700 underline underline-offset-4">
                            Нууцлалын бодлого
                        </Link>
                        -той танилцана уу.
                    </p>
                </section>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 font-bold text-sm italic">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}
                {emailVerifyNotice && (
                    <div className="mb-8 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl text-sm">
                        <p className="font-bold">{emailVerifyNotice}</p>
                        <button
                            type="button"
                            onClick={handleResendVerification}
                            disabled={isResendingVerification}
                            className="mt-2 text-xs font-black uppercase tracking-wider text-amber-800 hover:text-amber-900 disabled:opacity-60"
                        >
                            {isResendingVerification ? "Илгээж байна..." : "Баталгаажуулах мэйл дахин илгээх"}
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" aria-label="Партнер бүртгэлийн маягт">
                    {/* Байгууллагын үндсэн мэдээлэл */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-white space-y-8">
                        <h3 className="text-xl font-black flex items-center gap-3 uppercase italic text-emerald-900 tracking-tighter">
                            <Building2 size={24} className="text-emerald-600" /> Ерөнхий мэдээлэл
                        </h3>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic tracking-widest">Байгууллагын нэр</label>
                            <input {...register("name")} required className="w-full h-16 px-8 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold transition-all" placeholder="Нэрээ бичнэ үү..." />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic tracking-widest">Хариуцдаг чиглэлүүд</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-6 rounded-[2rem]">
                                {SUPPORTED_COUNTRIES.map((country) => (
                                    <label key={country} className="flex items-center gap-3 p-3 bg-white rounded-xl cursor-pointer hover:border-emerald-200 border border-transparent transition-all shadow-sm">
                                        <input type="checkbox" value={country} {...register("selectedCountries")} className="w-4 h-4 rounded border-slate-300 text-emerald-600" />
                                        <span className="text-[11px] font-black text-slate-600 uppercase italic tracking-tighter">{country}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic tracking-widest">Танилцуулга</label>
                            <textarea {...register("description")} required className="w-full p-8 bg-slate-50 rounded-[2rem] outline-none focus:ring-2 focus:ring-emerald-500 font-medium h-44" placeholder="Давуу талуудаа бичнэ үү..." />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Холбоо барих */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white space-y-6">
                            <h3 className="text-lg font-black flex items-center gap-2 uppercase italic text-emerald-900 tracking-tighter"><Mail size={20} className="text-emerald-600" /> Холбоо барих</h3>
                            <div className="space-y-3">
                                <input {...register("email")} type="email" required className="w-full h-14 px-6 bg-slate-50 rounded-xl outline-none font-bold text-sm" placeholder="И-мэйл" />
                                <input {...register("phone")} required className="w-full h-14 px-6 bg-slate-50 rounded-xl outline-none font-bold text-sm" placeholder="Утасны дугаар" />
                                <input {...register("link")} required className="w-full h-14 px-6 bg-slate-50 rounded-xl outline-none font-bold text-sm" placeholder="FB эсвэл Вэбсайт линк" />
                            </div>
                        </div>

                        {/* Зураг Upload & Preview */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white space-y-6">
                            <h3 className="text-lg font-black flex items-center gap-2 uppercase italic text-emerald-900 tracking-tighter"><ImageIcon size={20} className="text-emerald-600" /> Медиа</h3>
                            
                            <div className="space-y-6">
                                {/* Лого Preview Хэсэг */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase text-slate-400 italic tracking-widest ml-2">Байгууллагын Лого</p>
                                    {logoPreview ? (
                                        <div className="relative group rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-lg shadow-emerald-500/10">
                                            <img
                                                src={logoPreview}
                                                alt="Байгууллагын лого урьдчилж харах зураг"
                                                loading="lazy"
                                                className="w-full h-32 object-cover"
                                            />
                                            <div className="absolute inset-0 bg-emerald-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                <button type="button" onClick={() => setValue("logo", [] as any)} className="bg-white text-emerald-600 p-2 rounded-full hover:scale-110 transition-transform"><X size={20}/></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 transition-all group">
                                            <UploadCloud size={24} className="text-slate-400 group-hover:text-emerald-500 mb-1" />
                                            <span className="text-[10px] font-black text-slate-400 group-hover:text-emerald-500 uppercase italic">Лого сонгох</span>
                                            <input {...register("logo")} type="file" accept="image/*" className="hidden" />
                                        </label>
                                    )}
                                </div>

                                {/* Banner Preview Хэсэг */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase text-slate-400 italic tracking-widest ml-2">Үндсэн Banner зураг</p>
                                    <p className="text-[11px] text-slate-500 ml-2">Санал: 16:9 харьцаатай зураг (жишээ нь 1600x900) хамгийн сайн тохирно.</p>
                                    {bannerPreview ? (
                                        <div className="relative group rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-lg shadow-emerald-500/10">
                                            <img
                                                src={bannerPreview}
                                                alt="Партнер байгууллагын баннер урьдчилж харах зураг"
                                                loading="lazy"
                                                className="w-full h-32 object-cover"
                                            />
                                            <div className="absolute inset-0 bg-emerald-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                <button type="button" onClick={() => setValue("featuredImage", [] as any)} className="bg-white text-emerald-600 p-2 rounded-full hover:scale-110 transition-transform"><X size={20}/></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 transition-all group">
                                            <UploadCloud size={24} className="text-slate-400 group-hover:text-emerald-500 mb-1" />
                                            <span className="text-[10px] font-black text-slate-400 group-hover:text-emerald-500 uppercase italic">Banner сонгох</span>
                                            <input {...register("featuredImage")} type="file" accept="image/*" className="hidden" />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        {!existingPartner && (
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white space-y-6">
                                <h3 className="text-lg font-black flex items-center gap-2 uppercase italic text-emerald-900 tracking-tighter">
                                    <ReceiptText size={20} className="text-emerald-600" /> Төлбөрийн багц
                                </h3>
                                <div className="space-y-3">
                                    <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
                                        <input type="radio" value="monthly" {...register("billingPlan")} className="mt-1" />
                                        <span>
                                            <span className="block font-black text-slate-800">1 сар — {formatMnt(BILLING_OPTIONS.monthly.amount)}</span>
                                            <span className="text-xs text-slate-500">Сарын багц төлбөр</span>
                                        </span>
                                    </label>
                                    <label className="flex items-start gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50">
                                        <input type="radio" value="yearly" {...register("billingPlan")} className="mt-1" />
                                        <span>
                                            <span className="block font-black text-emerald-800">1 жил — {formatMnt(BILLING_OPTIONS.yearly.amount)}</span>
                                            <span className="text-xs text-emerald-700">17% хэмнэлт</span>
                                        </span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {!existingPartner && (
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white space-y-4">
                            <h3 className="text-lg font-black flex items-center gap-2 uppercase italic text-emerald-900 tracking-tighter">
                                <FileCheck size={20} className="text-emerald-600" /> Гэрээ ба баталгаажуулалт
                            </h3>
                            <label className="flex items-start gap-3 text-sm text-slate-700">
                                <input type="checkbox" {...register("contractAccepted")} className="mt-1" />
                                <span>Гэрээний нөхцөлийг зөвшөөрөв.</span>
                            </label>

                            <button
                                type="button"
                                onClick={() => setShowContractDetails((v) => !v)}
                                className="w-full text-left flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                                <span className="font-bold text-slate-700">Гэрээг дэлгэрэнгүй харах</span>
                                <ChevronDown size={16} className={`transition-transform ${showContractDetails ? "rotate-180" : ""}`} />
                            </button>

                            {showContractDetails && (
                                <div className="text-xs leading-6 text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-4 max-h-64 overflow-auto">
                                    <p><b>Нэг. Ерөнхий зүйл</b></p>
                                    <p><b>1.1.</b> Нэг талаас ScholarshipMN.academy платформыг өмчлөгч, иргэн А.Амаржаргал (РД: 86012765) (цаашид “Платформ” гэх), нөгөө талаас Түнш (цаашид “Түнш” гэх) нар харилцан тохиролцож, оюутан залууст боловсролын боломж, тэтгэлэг, сургалтын мэдээллийг хүргэх зорилгоор энэхүү гэрээг байгуулав.</p>
                                    <p><b>Хоёр. Платформын эрх, үүрэг</b></p>
                                    <p><b>2.1.</b> Платформ нь Түншээс ирүүлсэн мэдээллийг өөрийн вэбсайт болон сошиал сувгуудаар тохиролцсон хугацаанд байршуулна.</p>
                                    <p><b>2.2.</b> Платформ нь Түншийн мэдээллийг өөрчлөхгүйгээр нийтлэх үүрэгтэй. Гэвч найруулга, дизайны алдаатай мэдээллийг засахыг шаардах эрхтэй.</p>
                                    <p><b>2.3.</b> Хамгаалалт: Платформ нь Түншийн оруулсан мэдээллийн агуулга, тэтгэлгийн бодит байдал болон Түнш байгууллагын үйлчилгээнээс үүдэх аливаа хариуцлагыг хүлээхгүй.</p>
                                    <p><b>Гурав. Түнш байгууллагын эрх, үүрэг</b></p>
                                    <p><b>3.1.</b> Түнш нь Платформд нийлүүлж буй бүх мэдээлэл (сургалтын хөтөлбөр, тэтгэлгийн нөхцөл, хаяг байршил) нь үнэн зөв, бодит байхыг бүрэн хариуцна.</p>
                                    <p><b>3.2.</b> Түнш нь Платформын лого, оюуны өмчийг зөвшөөрөлгүйгээр гуравдагч талд ашиглуулахгүй байх үүрэгтэй.</p>
                                    <p><b>3.3.</b> Түнш нь Платформоор дамжуулан бүртгүүлсэн оюутнуудын хувийн мэдээллийг (Lead) зөвхөн сургалтын зорилгоор ашиглах ба бусдад дамжуулах, задруулахыг хатуу хориглоно.</p>
                                    <p><b>Дөрөв. Төлбөр тооцоо ба Хугацаа</b></p>
                                    <p><b>4.1.</b> Хамтын ажиллагааны үйлчилгээний төлбөр нь сарын 100,000 (нэг зуун мянга) төгрөг байна.</p>
                                    <p><b>4.2.</b> Түнш нь үйлчилгээний төлбөрийг 12 сараар (нэг жил) багцлан урьдчилж төлсөн тохиолдолд жилийн нийт төлбөр 1,000,000 (нэг сая) төгрөг байна.</p>
                                    <p><b>4.3.</b> Түнш нь сонгосон багцын төлбөрийг Платформ эзэмшигчийн нэхэмжлэлийн дагуу ажлын 3 хоногт багтаан доорх дансанд шилжүүлнэ:</p>
                                    <p>Хүлээн авагч данс: MN810015001105591438</p>
                                    <p>Банкны нэр: ГОЛОМТ БАНК</p>
                                    <p>Хүлээн авагчийн нэр: А.Амаржаргал</p>
                                    <p><b>4.4.</b> Төлбөр шилжсэнээр гэрээ хүчин төгөлдөр болж, мэдээлэл байршуулах хугацаа тоологдож эхэлнэ.</p>
                                    <p><b>Тав. Хариуцлага ба Гэрээ цуцлах</b></p>
                                    <p><b>5.1.</b> Түнш нь худал мэдээлэл өгсөн, эсвэл оюутан залуусыг хохироосон үйлдэл гаргавал Платформ нь гэрээг нэг талын санаачилгаар шууд цуцалж, мэдээллийг устгах эрхтэй. Энэ тохиолдолд урьдчилж төлсөн төлбөрийг буцаан олгохгүй.</p>
                                    <p><b>5.2.</b> Платформ нь иргэний өмчлөлд суурилсан тул техникийн саатал (сервер унах, давагдашгүй хүчин зүйл) тохиолдоход Платформ хариуцлага хүлээхгүй боловч алдааг засварлах үүрэг хүлээнэ.</p>
                                    <p><b>Зургаа. Нууцлал</b></p>
                                    <p><b>6.1.</b> Талууд гэрээний хүрээнд олж авсан бизнесийн болон хэрэглэгчдийн хувийн мэдээллийг гэрээ дууссанаас хойш 2 жилийн хугацаанд чандлан хадгална.</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 italic tracking-widest">Цахим гарын үсэг</label>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                    <canvas
                                        ref={signatureCanvasRef}
                                        width={640}
                                        height={180}
                                        onPointerDown={beginSignature}
                                        onPointerMove={drawSignature}
                                        onPointerUp={endSignature}
                                        onPointerLeave={endSignature}
                                        className="w-full h-36 bg-white rounded-lg border border-slate-200 touch-none cursor-crosshair"
                                    />
                                    <div className="mt-2 flex items-center justify-between">
                                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                            <PenLine size={12} /> Cursor эсвэл touch-оор зурна уу.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={clearSignaturePad}
                                            className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
                                        >
                                            Арилгах
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        )}

                    </div>

                    <Button 
                        disabled={loading}
                        className="w-full h-20 bg-emerald-950 hover:bg-emerald-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-lg shadow-2xl transition-all italic"
                    >
                        {loading ? (
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Илгээж байна...
                            </div>
                        ) : existingPartner ? "Шинэчлэлт хадгалах" : "Бүртгүүлэх"}
                    </Button>
                </form>
                </>
                )}
            </div>
        </div>
    );
}