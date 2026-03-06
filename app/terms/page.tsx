"use client";

import React from 'react';
import { ScrollText, ShieldCheck, Info } from 'lucide-react';

const TermsPage = () => {
    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header */}
            <section className="bg-[#022c22] py-20 text-white">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">Үйлчилгээний нөхцөл</h1>
                    <p className="text-emerald-100/60 max-w-2xl mx-auto">
                        SCHOLARSHIPMN платформыг ашиглахаас өмнө та дараах нөхцөлүүдтэй танилцана уу.
                    </p>
                </div>
            </section>

            {/* Content */}
            <div className="container mx-auto px-6 -mt-10">
                <div className="bg-white rounded-[32px] shadow-xl border border-emerald-50 p-8 md:p-12 max-w-4xl mx-auto">
                    <div className="space-y-12 text-gray-600 leading-relaxed">
                        
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-[#022c22] flex items-center gap-2">
                                <Info className="text-emerald-500" size={20} />
                                1. Ерөнхий заалт
                            </h2>
                            <p>
                                Энэхүү нөхцөл нь SCHOLARSHIPMN вэб сайтаар дамжуулан үзүүлж буй тэтгэлгийн мэдээлэл, зөвлөх үйлчилгээ болон бусад контентыг ашиглахтай холбоотой харилцааг зохицуулна. Хэрэглэгч вэб сайтыг ашигласнаар эдгээр нөхцөлийг хүлээн зөвшөөрсөнд тооцогдоно.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-[#022c22] flex items-center gap-2">
                                <ScrollText className="text-emerald-500" size={20} />
                                2. Мэдээллийн үнэн зөв байдал
                            </h2>
                            <p>
                                Бид тэтгэлгийн мэдээллийг албан ёсны эх сурвалжаас авч нийтэлдэг боловч тэтгэлэг олгогч тал мэдээллээ өөрчлөх, цуцлах тохиолдолд SCHOLARSHIPMN хариуцлага хүлээхгүй. Хэрэглэгч албан ёсны сургуулийн вэб сайтаар мэдээллийг нягтлах үүрэгтэй.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-[#022c22] flex items-center gap-2">
                                <ShieldCheck className="text-emerald-500" size={20} />
                                3. Оюуны өмч
                            </h2>
                            <p>
                                Платформ дээрх бүх дизайн, лого, эх код болон зөвлөгөө контентууд нь SCHOLARSHIPMN-ийн өмч бөгөөд зөвшөөрөлгүйгээр хуулбарлах, арилжааны зорилгоор ашиглахыг хориглоно.
                            </p>
                        </section>

                        <div className="pt-8 border-t border-gray-100 text-sm text-gray-400">
                            Сүүлд шинэчилсэн: 2026 оны 3-р сар
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;