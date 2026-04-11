import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';
export const preferredRegion = 'sin1';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

        // API хувилбарыг v1 гэж зааж өгөх
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
        }, { apiVersion: 'v1' }); // <--- Энийг нэмээд үзээрэй

        const { messages } = await req.json();
        const lastMessage = messages[messages.length - 1].content;

        const result = await model.generateContent(lastMessage);
        const response = await result.response;
        
        return NextResponse.json({ content: response.text() });

    } catch (error: any) {
        console.error("Detailed Gemini Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}