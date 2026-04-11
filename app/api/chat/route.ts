import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';
export const preferredRegion = 'sin1';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API Key missing" }, { status: 500 });
        }

        const { messages } = await req.json();
        const genAI = new GoogleGenerativeAI(apiKey);

        // МОДЕЛИЙН НЭРИЙГ ИНГЭЖ ӨӨРЧЛӨӨД ҮЗ (БҮРЭН НЭРЭЭР НЬ)
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash-latest" // Эсвэл "gemini-1.5-flash"
        });

        const lastMessage = messages[messages.length - 1].content;

        // Content бүтэц нь хамгийн найдвартай формат
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: lastMessage }] }],
        });

        const response = await result.response;
        return NextResponse.json({ content: response.text() });

    } catch (error: any) {
        console.error("Detailed Gemini Error:", error);
        return NextResponse.json({ 
            error: "Model error", 
            details: error.message 
        }, { status: 500 });
    }
}