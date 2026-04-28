"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { 
    Globe, 
    Phone, 
    Mail, 
    CheckCircle2, 
    ArrowLeft, 
    Loader2,
    ExternalLink,
    MapPin
} from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

interface Partner {
    id: string;
    name: string;
    email: string;
    phone: string;
    link: string;
    description: string;
    targetCountries: string[];
    logo: string;
    featuredImage: string;
    approved: boolean;
}

export default function PartnerDetailPage() {
    const params = useParams();
    const [partner, setPartner] = useState<Partner | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPartner = async () => {
            try {
                const docRef = doc(db, "partners", params.id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setPartner({ id: docSnap.id, ...docSnap.data() } as Partner);
                }
            } catch (error) {
                console.error("Error fetching partner:", error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) fetchPartner();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-emerald-600" size={40} />
            </div>
        );
    }

    if (!partner) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h2 className="text-2xl font-black text-slate-900 uppercase italic">Партнер олдсонгүй</h2>
                <Link href="/courses" className="mt-4 text-emerald-600 font-bold hover:underline">Буцах</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header Banner */}
            <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden bg-slate-900">
                <Image
                    src={partner.featuredImage}
                    alt={`${partner.name} байгууллагын нүүр зураг`}
                    fill
                    priority
                    sizes="100vw"
                    className="object-contain"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                
                <div className="absolute inset-0 flex items-end">
                    <div className="container mx-auto px-6 pb-12">
                        <Link href="/courses" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 font-bold text-sm transition-all">
                            <ArrowLeft size={18} /> Буцах
                        </Link>
                        <div className="flex flex-col md:flex-row md:items-end gap-6">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-[2rem] p-1 shadow-2xl overflow-hidden border-4 border-white">
                                <Image
                                    src={partner.logo}
                                    alt={`${partner.name} лого`}
                                    width={128}
                                    height={128}
                                    sizes="(max-width: 768px) 96px, 128px"
                                    className="w-full h-full object-cover rounded-[1.8rem]"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Албан ёсны партнер</span>
                                    {partner.approved && <CheckCircle2 className="text-emerald-400" size={20} />}
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
                                    {partner.name}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    {/* Left Side: Content */}
                    <div className="lg:col-span-2 space-y-10">
                        <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                            <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase italic tracking-tighter">Байгууллагын тухай</h3>
                            <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                                {partner.description}
                            </p>
                        </section>

                        <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                            <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase italic tracking-tighter">Хариуцдаг чиглэлүүд</h3>
                            <div className="flex flex-wrap gap-3">
                                {partner.targetCountries.map((tag) => (
                                    <span key={tag} className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl text-xs font-black uppercase italic tracking-widest border border-emerald-100">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Side: Sidebar / Contact */}
                    <div className="space-y-6">
                        <div className="bg-[#022c22] p-8 rounded-[3rem] text-white shadow-xl">
                            <h3 className="text-xl font-black mb-8 uppercase italic tracking-tighter border-b border-white/10 pb-4">Холбоо барих</h3>
                            
                            <div className="space-y-6">
                                <a href={`mailto:${partner.email}`} className="flex items-center gap-4 group">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 transition-all">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-white/40 tracking-widest">И-мэйл хаяг</p>
                                        <p className="font-bold text-sm">{partner.email}</p>
                                    </div>
                                </a>

                                <a href={`tel:${partner.phone}`} className="flex items-center gap-4 group">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 transition-all">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-white/40 tracking-widest">Утасны дугаар</p>
                                        <p className="font-bold text-sm">{partner.phone}</p>
                                    </div>
                                </a>

                                <div className="flex items-center gap-4 group">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                        <Globe size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-white/40 tracking-widest">Вэбсайт / Сошиал</p>
                                        <a href={partner.link} target="_blank" className="font-bold text-sm hover:text-emerald-400 break-all underline-offset-4 underline transition-all">
                                            Линк үзэх
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <a href={partner.link} target="_blank" rel="noopener noreferrer">
                                <Button className="w-full h-16 mt-10 bg-emerald-500 hover:bg-emerald-400 text-[#022c22] font-black uppercase italic tracking-widest rounded-2xl shadow-lg shadow-emerald-500/20">
                                    Шууд холбогдох <ExternalLink size={18} className="ml-2" />
                                </Button>
                            </a>
                        </div>

                        {/* Professional Tag */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                <CheckCircle2 size={24} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest leading-tight">
                                Scholarship MN-ээр дамжуулан <br />баталгаажсан байгууллага
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}