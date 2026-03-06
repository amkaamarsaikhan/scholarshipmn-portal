"use client";

import React from 'react';
import { 
    BookOpen, 
    Star, 
    Clock, 
    Users, 
    ArrowRight, 
    CheckCircle2,
    GraduationCap,
    Languages
} from 'lucide-react';
import Link from 'next/link';

const CoursesPage = () => {
    // Хамтрагч сургалтын төвүүдийн дата (Жишээ)
    const courses = [
        {
            id: 1,
            title: "IELTS Эрчимжүүлсэн хөтөлбөр",
            center: "Global Education Center",
            price: "450,000₮",
            duration: "4 долоо хоног",
            rating: 4.9,
            image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
            tags: ["IELTS", "Эрчимжүүлсэн"]
        },
        {
            id: 2,
            title: "Солонгос хэлний TOPIK бэлтгэл",
            center: "K-Study Institute",
            price: "380,000₮",
            duration: "8 долоо хоног",
            rating: 4.8,
            image: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=800&q=80",
            tags: ["TOPIK", "Хэлний бэлтгэл"]
        },
        {
            id: 3,
            title: "Эссэ бичих ур чадвар (Masterclass)",
            center: "ScholarshipMN Academy",
            price: "250,000₮",
            duration: "2 долоо хоног",
            rating: 5.0,
            image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
            tags: ["Эссэ", "Тэтгэлэг"]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Hero Section */}
            <section className="bg-[#022c22] py-24 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-500/5 blur-3xl rounded-full"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <span className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-sm font-semibold mb-6 inline-block border border-emerald-500/20">
                        Мэргэжлийн сургалтын төвүүд
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black mb-6">
                        Ур чадвараа ахиулж, <br/>
                        <span className="text-emerald-400">Тэтгэлэгт ойрт</span>
                    </h1>
                    <p className="text-emerald-100/60 max-w-2xl mx-auto text-lg">
                        Бид зөвхөн шилдэг хөтөлбөртэй, төлбөрөө төлж баталгаажсан 
                        мэргэжлийн сургалтын төвүүдийг танд санал болгож байна.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-20 container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <h2 className="text-3xl font-bold text-[#022c22] mb-2">Идэвхтэй сургалтууд</h2>
                        <p className="text-gray-500">Танд зориулсан шилдэг хэлний болон бэлтгэл курсууд</p>
                    </div>
                    <div className="flex gap-2">
                        {["Бүгд", "Англи хэл", "Солонгос хэл", "Зөвлөх үйлчилгээ"].map((cat) => (
                            <button key={cat} className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm hover:border-emerald-500 hover:text-emerald-600 transition-all">
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course) => (
                        <div key={course.id} className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                            <div className="relative h-52 overflow-hidden">
                                <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute top-4 left-4 flex gap-2">
                                    {course.tags.map(tag => (
                                        <span key={tag} className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-[#022c22] uppercase tracking-wider">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex text-amber-400"><Star size={14} fill="currentColor" /></div>
                                    <span className="text-xs font-bold text-gray-600">{course.rating}</span>
                                    <span className="text-gray-300">|</span>
                                    <span className="text-xs text-gray-500">{course.center}</span>
                                </div>
                                
                                <h3 className="text-xl font-bold text-[#022c22] mb-4 group-hover:text-emerald-600 transition-colors">
                                    {course.title}
                                </h3>

                                <div className="flex items-center justify-between py-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <Clock size={16} />
                                        <span>{course.duration}</span>
                                    </div>
                                    <div className="text-lg font-black text-emerald-600">
                                        {course.price}
                                    </div>
                                </div>

                                <button className="w-full mt-2 bg-gray-50 hover:bg-emerald-500 hover:text-white text-[#022c22] font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
                                    Дэлгэрэнгүй <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Partnership Section */}
            <section className="pb-24 container mx-auto px-6">
                <div className="bg-emerald-600 rounded-[40px] p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="max-w-xl">
                        <h2 className="text-3xl font-bold mb-6 text-center lg:text-left">Та сургалтын төв ажиллуулдаг уу?</h2>
                        <ul className="space-y-4">
                            {[
                                "Зорилтот хэрэглэгчдэд шууд хүрэх",
                                "Тэтгэлэг горилогчдын нэгдсэн платформд байрших",
                                "Сургалтын бүртгэлийг системээр дамжуулан авах"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <CheckCircle2 className="text-emerald-300 shrink-0" size={20} />
                                    <span className="text-emerald-50 text-sm md:text-base">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white/10 p-8 rounded-3xl border border-white/20 backdrop-blur-sm text-center">
                        <p className="text-sm mb-6 text-emerald-100 italic">"Манай платформтой хамтран ажиллаж, чанартай боловсролыг түгээцгээе."</p>
                        <a href="tel:99198805" className="bg-white text-emerald-600 px-10 py-4 rounded-2xl font-black hover:bg-emerald-50 transition-all inline-block">
                            Холбоо барих: 99198805
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CoursesPage;