"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { 
    Building2, 
    Image as ImageIcon, 
    Phone, 
    Mail, 
    CheckCircle2,
    UploadCloud,
    Globe2,
    AlertCircle,
    FileCheck,
    X,
    Eye
} from 'lucide-react';

const SUPPORTED_COUNTRIES = [
    "Australia", "USA", "South Korea", "Japan", "Germany", 
    "Canada", "Hungary", "China", "UK", "Russia", 
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
}

export default function PartnerRegisterPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, reset, watch, setValue } = useForm<PartnerFormValues>();

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
        if (!data.selectedCountries || data.selectedCountries.length === 0) {
            setError("Наад зах нь нэг чиглэл сонгоно уу!");
            return;
        }

        setLoading(true);
        try {
            let logoUrl = "";
            let featuredImageUrl = "";

            if (data.logo?.[0]) logoUrl = await uploadFile(data.logo[0], "logos");
            if (data.featuredImage?.[0]) featuredImageUrl = await uploadFile(data.featuredImage[0], "banners");

            await addDoc(collection(db, "partners"), {
                name: data.name,
                email: data.email,
                phone: data.phone,
                link: data.link,
                description: data.description,
                targetCountries: data.selectedCountries,
                logo: logoUrl,
                featuredImage: featuredImageUrl,
                approved: false,
                createdAt: serverTimestamp(),
            });

            setSuccess(true);
            reset();
        } catch (err: any) {
            setError(err.message || "Алдаа гарлаа.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6 bg-[#F8FAFC]">
                <div className="text-center bg-white p-12 rounded-[3.5rem] shadow-2xl max-w-lg border border-emerald-50 italic">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase italic tracking-tighter">Хүсэлт илгээгдлээ!</h2>
                    <p className="text-slate-500 mb-8 font-bold">Админ хянаад тантай эргэн холбогдох болно.</p>
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
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase mb-4 italic">
                        Партнер <span className="text-emerald-600">болох</span>
                    </h1>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 font-bold text-sm italic">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
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
                    </div>

                    <div className="space-y-8">
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
                                            <img src={logoPreview} className="w-full h-32 object-cover" />
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
                                    {bannerPreview ? (
                                        <div className="relative group rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-lg shadow-emerald-500/10">
                                            <img src={bannerPreview} className="w-full h-32 object-cover" />
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

                        <Button 
                            disabled={loading}
                            className="w-full h-20 bg-emerald-950 hover:bg-emerald-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-lg shadow-2xl transition-all italic"
                        >
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Илгээж байна...
                                </div>
                            ) : "Бүртгүүлэх"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}