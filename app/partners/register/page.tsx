"use client";

import React, { useState } from 'react';
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
    AlertCircle
} from 'lucide-react';

const SUPPORTED_COUNTRIES = [
    "Australia", "USA", "South Korea", "Japan", "Germany", 
    "Canada", "Hungary", "China", "UK", "Russia", 
    "IELTS", "TOPIK", "HSK", "JLPT", "German", "French", 
    "Математик", "Физик", "Нийгэм", "Эссэ бичих"
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB хязгаар

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

    const { register, handleSubmit, reset } = useForm<PartnerFormValues>();

    // Файл хуулах функц (Засагдсан)
    const uploadFile = async (file: File, folder: string) => {
        // Хэмжээ шалгах
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

            // 1. Лого хуулах
            if (data.logo && data.logo.length > 0) {
                logoUrl = await uploadFile(data.logo[0], "logos");
            } else {
                throw new Error("Байгууллагын лого заавал байх ёстой.");
            }

            // 2. Баннер хуулах
            if (data.featuredImage && data.featuredImage.length > 0) {
                featuredImageUrl = await uploadFile(data.featuredImage[0], "banners");
            } else {
                throw new Error("Banner зураг заавал байх ёстой.");
            }

            // 3. Firestore руу хадгалах
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
            console.error("Error:", err);
            setError(err.message || "Алдаа гарлаа. Дахин оролдоно уу.");
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
                    <p className="text-slate-500 mb-8 font-bold">Мэдээллийг админ хянаж үзээд тантай эргэн холбогдох болно.</p>
                    <Button onClick={() => window.location.href = "/"} className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 h-16 rounded-2xl font-black uppercase italic tracking-widest shadow-lg shadow-emerald-200">
                        Нүүр хуудас руу буцах
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
                    <p className="text-slate-400 font-bold italic max-w-xl mx-auto uppercase text-[10px] tracking-[0.2em]">
                        Бүртгүүлээд тэтгэлэг горилогчдод үйлчилгээгээ хүргэж эхлээрэй.
                    </p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 font-bold text-sm italic">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white space-y-8">
                            <h3 className="text-xl font-black flex items-center gap-3 mb-4 uppercase italic text-emerald-900 tracking-tighter">
                                <Building2 size={24} className="text-emerald-600" /> Байгууллагын мэдээлэл
                            </h3>
                            
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic tracking-widest">Байгууллагын нэр</label>
                                <input {...register("name")} required className="w-full h-16 px-8 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-slate-700" placeholder="Global Education LLC" />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic tracking-widest flex items-center gap-2">
                                    <Globe2 size={12} /> Хариуцдаг чиглэл / Улсууд
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-6 rounded-[2rem]">
                                    {SUPPORTED_COUNTRIES.map((country) => (
                                        <label key={country} className="flex items-center gap-3 p-3 bg-white rounded-xl cursor-pointer hover:border-emerald-200 border border-transparent transition-all shadow-sm">
                                            <input 
                                                type="checkbox" 
                                                value={country} 
                                                {...register("selectedCountries")} 
                                                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span className="text-[11px] font-black text-slate-600 uppercase italic tracking-tighter">{country}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic tracking-widest">Танилцуулга</label>
                                <textarea {...register("description")} required className="w-full p-8 bg-slate-50 rounded-[2rem] border-none outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-600 h-44" placeholder="Танай байгууллагын давуу тал юу вэ? (300-аас доош үгэнд багтаах)" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white space-y-6">
                            <h3 className="text-lg font-black flex items-center gap-2 mb-2 uppercase italic text-emerald-900 tracking-tighter">
                                <Mail size={20} className="text-emerald-600" /> Холбоо барих
                            </h3>
                            <div className="space-y-3">
                                <input {...register("email")} type="email" required className="w-full h-14 px-6 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm" placeholder="И-мэйл хаяг" />
                                <input {...register("phone")} required className="w-full h-14 px-6 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm" placeholder="Утасны дугаар" />
                                <input {...register("link")} required className="w-full h-14 px-6 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm" placeholder="Вэбсайт эсвэл FB линк" />
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white space-y-6">
                            <h3 className="text-lg font-black flex items-center gap-2 mb-2 uppercase italic text-emerald-900 tracking-tighter">
                                <ImageIcon size={20} className="text-emerald-600" /> Медиа (Max 2MB)
                            </h3>
                            <div className="space-y-4">
                                <label className="flex flex-col items-center justify-center w-full h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 transition-all group">
                                    <UploadCloud size={28} className="text-slate-400 group-hover:text-emerald-500 mb-2" />
                                    <span className="text-[10px] font-black text-slate-400 group-hover:text-emerald-500 uppercase italic tracking-widest">Лого хуулах</span>
                                    <input {...register("logo")} type="file" accept="image/*" required className="hidden" />
                                </label>

                                <label className="flex flex-col items-center justify-center w-full h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 transition-all group">
                                    <UploadCloud size={28} className="text-slate-400 group-hover:text-emerald-500 mb-2" />
                                    <span className="text-[10px] font-black text-slate-400 group-hover:text-emerald-500 uppercase italic tracking-widest">Banner хуулах</span>
                                    <input {...register("featuredImage")} type="file" accept="image/*" required className="hidden" />
                                </label>
                            </div>
                        </div>

                        <Button 
                            disabled={loading}
                            className="w-full h-20 bg-emerald-950 hover:bg-emerald-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-lg shadow-2xl shadow-emerald-950/20 transition-all active:scale-95 italic"
                        >
                            {loading ? "Илгээж байна..." : "Бүртгүүлэх"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}