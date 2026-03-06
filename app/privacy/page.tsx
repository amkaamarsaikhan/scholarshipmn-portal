"use client";

import React from 'react';
import { ShieldCheck, EyeOff, Lock, UserCheck } from 'lucide-react';

const PrivacyPage = () => {
    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header */}
            <section className="bg-[#022c22] py-20 text-white">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">Нууцлалын бодлого</h1>
                    <p className="text-emerald-100/60 max-w-2xl mx-auto">
                        Бид таны хувийн мэдээллийг хэрхэн цуглуулж, хамгаалдаг талаарх мэдээлэл.
                    </p>
                </div>
            </section>

            {/* Content */}
            <div className="container mx-auto px-6 -mt-10">
                <div className="bg-white rounded-[32px] shadow-xl border border-emerald-50 p-8 md:p-12 max-w-4xl mx-auto">
                    <div className="space-y-12 text-gray-600 leading-relaxed">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <Lock className="text-emerald-600 mb-4" size={24} />
                                <h3 className="font-bold text-[#022c22] mb-2">Мэдээллийн аюулгүй байдал</h3>
                                <p className="text-sm">Таны бүртгүүлсэн имэйл болон хувийн мэдээллийг бид орчин үеийн шифрлэлтийн технологиор хамгаалдаг.</p>
                            </div>
                            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <EyeOff className="text-emerald-600 mb-4" size={24} />
                                <h3 className="font-bold text-[#022c22] mb-2">Гуравдагч тал</h3>
                                <p className="text-sm">Бид таны мэдээллийг хэзээ ч бусад байгууллага, хувь хүнд худалдахгүй бөгөөд зөвхөн тэтгэлгийн мэдээлэл хүргэхэд ашиглана.</p>
                            </div>
                        </div>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-[#022c22] flex items-center gap-2">
                                <UserCheck className="text-emerald-500" size={20} />
                                1. Цуглуулдаг мэдээлэл
                            </h2>
                            <p>
                                Бид хэрэглэгчийг Newsletter-т бүртгүүлэх үед зөвхөн имэйл хаягийг, харин зөвлөгөө авах хүсэлт гаргах үед нэр, утасны дугаар зэрэг мэдээллийг сайн дурын үндсэн дээр цуглуулдаг.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-[#022c22] flex items-center gap-2">
                                <ShieldCheck className="text-emerald-500" size={20} />
                                2. Мэдээллийг устгах эрх
                            </h2>
                            <p>
                                Хэрэглэгч хүссэн үедээ манай Newsletter-ээс татгалзах болон өөрийн бүртгэлтэй мэдээллээ системээс бүрэн устгуулах хүсэлтийг admin@scholarshipmn.academy хаягаар илгээх эрхтэй.
                            </p>
                        </section>

                        <div className="pt-8 border-t border-gray-100 text-sm text-gray-400 text-center">
                            © {new Date().getFullYear()} SCHOLARSHIPMN Платформ.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;