import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Бүс нутгийн асуудлыг шийдэх (Сингапур)
export const runtime = 'nodejs';
export const preferredRegion = 'sin1';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API Key missing" }, { status: 500 });
        }

        const { messages } = await req.json();
        
        // 1. API хувилбарыг v1 гэж зааж өгөх нь 404 алдааг засах гол арга
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // 2. Моделийг авахдаа apiVersion-ийг v1 гэж заавал бичиж өгнө
        const model = genAI.getGenerativeModel(
            { model: "gemini-1.5-flash" },
            { apiVersion: 'v1' } 
        );

        const lastMessage = messages[messages.length - 1].content;

        // 3. generateContent ашиглах нь хамгийн тогтвортой
        const result = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [{ text: `Чи бол Scholarship MN-ийн туслах. Монголоор хариулаарай. Асуулт: ${lastMessage}` }]
                }
            ]
        });

        const response = await result.response;
        return NextResponse.json({ content: response.text() });

    } catch (error: any) {
        console.error("Detailed Gemini Error:", error);
        return NextResponse.json({ 
            error: "Chat API Error", 
            message: error.message 
        }, { status: 500 });
    }
}