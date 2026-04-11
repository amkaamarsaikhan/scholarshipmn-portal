import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Түлхүүрийг POST дотор шалгах нь илүү найдвартай байдаг
export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            console.error("API Key missing from environment variables");
            return NextResponse.json({ error: "API түлхүүр тохируулагдаагүй байна" }, { status: 500 });
        }

        const { messages } = await req.json();
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // History-г илүү хялбарчилж, хамгийн сүүлийн мессежийг салгаж авна
        const lastMessage = messages[messages.length - 1].content;

        // startChat-ын оронд шууд generateContent ашиглаж үзвэл алдаа гарах магадлал багасна
        const prompt = `Чи бол Scholarship MN-ийн ухаалаг туслах. Чи хэрэглэгчдэд тэтгэлэг, сургалтын төв, гадаад суралцах талаар маш товч бөгөөд тодорхой зөвлөгөө өгөх ёстой. Хэрэглэгчтэй найрсаг харилцаарай. 
        
        Асуулт: ${lastMessage}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        return NextResponse.json({ content: text });
    } catch (error: any) {
        // Терминал дээр яг ямар алдаа гарч байгааг хэвлэх
        console.error("Detailed Gemini Error:", error);
        
        return NextResponse.json({ 
            error: "Алдаа гарлаа", 
            details: error.message 
        }, { status: 500 });
    }
}