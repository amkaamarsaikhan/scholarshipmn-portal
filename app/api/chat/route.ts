import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 1. Vercel-ийн серверийг Gemini-г бүрэн дэмждэг Сингапур бүс рүү албадан шилжүүлнэ
export const runtime = 'nodejs';
export const preferredRegion = 'sin1'; 

export async function POST(req: Request) {
    try {
        // 2. API Key байгаа эсэхийг шалгах
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("Error: GEMINI_API_KEY is not defined in environment variables.");
            return NextResponse.json(
                { error: "Сервер дээр API түлхүүр тохируулагдаагүй байна." }, 
                { status: 500 }
            );
        }

        // 3. Хэрэглэгчийн илгээсэн мессежийг унших
        const { messages } = await req.json();
        if (!messages || messages.length === 0) {
            return NextResponse.json(
                { error: "Мессеж хоосон байна." }, 
                { status: 400 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Хамгийн сүүлийн үеийн хурдан модель
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Хамгийн сүүлийн асуултыг салгаж авах
        const lastUserMessage = messages[messages.length - 1].content;

        // 4. AI-д өгөх заавар (System Instructions)
        const prompt = `Чи бол Scholarship MN-ийн ухаалаг туслах байна. 
        Хэрэглэгчийн асуултанд маш товч, тодорхой, эелдэг хариулна уу. 
        Монгол хэлээр хариулт өгөөрэй.
        
        Хэрэглэгчийн асуулт: ${lastUserMessage}`;

        // AI-аас хариулт авах
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 5. Амжилттай хариу буцаах
        return NextResponse.json({ content: text });

    } catch (error: any) {
        // Vercel Logs дээр алдааг нарийн харах зориулалттай
        console.error("DETAILED_GEMINI_ERROR:", error);

        // Хэрэглэгчид илүү ойлгомжтой алдааны мессеж харуулах
        let errorMessage = "Уучлаарай, системд алдаа гарлаа.";
        if (error.message?.includes("location")) {
            errorMessage = "Уучлаарай, энэ бүс нутгаас хандах боломжгүй байна. (Region Error)";
        }

        return NextResponse.json(
            { error: errorMessage, details: error.message }, 
            { status: 500 }
        );
    }
}