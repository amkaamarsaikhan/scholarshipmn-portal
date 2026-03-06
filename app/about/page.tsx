"use client";

import React from 'react';
import {
    Target,
    Users,
    Award,
    Globe2,
    ChevronRight,
    GraduationCap,
    Lightbulb
} from 'lucide-react';
import Link from 'next/link';

const AboutPage = () => {
    const stats = [
        { label: "Нийт тэтгэлэг", value: "500+", icon: Award },
        { label: "Амжилттай суралцагчид", value: "1,200+", icon: GraduationCap },
        { label: "Хамтрагч их сургуулиуд", value: "50+", icon: Globe2 },
        { label: "Мэргэжлийн менторууд", value: "30+", icon: Users },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative py-24 bg-[#022c22] overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
                        Дэлхийн боловсролыг <br />
                        <span className="text-emerald-400">Монгол залууст</span>
                    </h1>
                    <p className="text-emerald-100/70 text-lg max-w-2xl mx-auto mb-10">
                        ScholarshipMN бол Монгол залуусын мэдлэг чадварыг дэлхийн хэмжээнд хүргэх гүүр юм.
                        Бид Монгол залуусыг дэлхийн хэмжээний боловсролтой холбох эрхэм зорилгыг өвөртлөн,
                        дэлхийн шилдэг сургуулиудад хүссэн мэргэжлээрээ суралцах үүд хаалгыг нээж, олон улсын тэтгэлэгт
                        хөтөлбөрүүдэд амжилттай хамрагдахад нь бодит дэмжлэг, найдвартай хөтөч болж,
                        тэдний өмнө хязгааргүй боломжуудыг бий болгохыг эрмэлзэж байна.
                    </p>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-emerald-50 border-y border-emerald-100">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="text-center space-y-2">
                                <div className="text-emerald-600 flex justify-center mb-2">
                                    <stat.icon size={28} />
                                </div>
                                <div className="text-3xl font-black text-[#022c22]">{stat.value}</div>
                                <div className="text-sm text-emerald-800/60 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Vision & Mission */}
            <section className="py-24">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="relative">
                            <div className="aspect-square bg-emerald-100 rounded-[40px] overflow-hidden">
                                <img
                                    src="/hero2.png"
                                    alt="ScholarshipMN Hero"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center text-emerald-200">
                                    <Target size={200} strokeWidth={0.5} />
                                </div>
                            </div>
                            <div className="absolute -bottom-6 -right-6 bg-white p-8 rounded-3xl shadow-xl border border-emerald-50 max-w-[280px]">
                                <p className="text-[#022c22] font-medium leading-relaxed italic">
                                    "Боловсрол бол Монголыг өөрчлөх хамгийн хүчтэй зэвсэг юм."
                                </p>
                            </div>
                        </div>

                        <div className="space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold text-[#022c22] flex items-center gap-3">
                                    <Target className="text-emerald-500" /> Мөрөөдөл
                                </h2>
                                <p className="text-gray-600 leading-relaxed">
                                    Яг таны сонирхож буй улсад тэтгэлэг авч суралцсан туршлагатай ах, эгч нартай
                                    холбох 'Mentor-Mentee' хэлхээ холбоог үүсгэж, хилийн чанадад сурч төгссөн болон
                                    суралцахаар зорьж буй бүх Монголчууд улс орноо хөгжүүлэх шинэлэг санаа, алсын хараагаа
                                    хуваалцдаг нэгдсэн 'Уулзах цэг' болохыг мөрөөдөж байна. Монгол залуу хүн бүр санхүүгийн
                                    саад бэрхшээлгүйгээр дэлхийн хаана ч сурч боловсрох, өөрийгөө хөгжүүлэх боломжийг
                                    олгохын төлөө хичээж байна.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold text-[#022c22] flex items-center gap-3">
                                    <Lightbulb className="text-emerald-500" /> Бид юу хийдэг вэ?
                                </h2>
                                <ul className="space-y-4">
                                    {[
                                        "Сонирхож буй улс, тэтгэлгээ сонгох",
                                        "Материалын жагсаалтыг (Checklist) хянах",
                                        "Бүрдүүлсэн материалаа имэйлээр илгээх",
                                        "Материал шалгагдсаны дараа Ментортой холбогдох"
                                    ].map((text, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-600">
                                            <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                <ChevronRight size={14} className="text-emerald-600" />
                                            </div>
                                            {text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 container mx-auto px-6">
                <div className="bg-[#022c22] rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>

                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">
                        Таны ирээдүйн аялал эндээс эхэлнэ
                    </h2>
                    <p className="text-emerald-100/60 mb-10 max-w-xl mx-auto relative z-10">
                        Өнөөдөр бүртгүүлээд мэдээлэл авч эхлээрэй.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                        <Link href="/" className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-xl font-bold transition-all">
                            Тэтгэлэг харах
                        </Link>
                        <Link href="mailto:admin@scholarshipmn.academy" className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-xl font-bold transition-all">
                            Холбоо барих
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;