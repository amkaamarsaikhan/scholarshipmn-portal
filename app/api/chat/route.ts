import { NextResponse } from "next/server";

// Vercel-ийн серверийг Сингапур руу чиглүүлснээр Google API-тай илүү хурдан холбогдоно
export const runtime = 'nodejs';
export const preferredRegion = 'sin1';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            return NextResponse.json({ error: "API Key missing" }, { status: 500 });
        }

        const { messages } = await req.json();
        const lastMessage = messages[messages.length - 1].content;

        // SDK ашиглахгүйгээр шууд Google-ийн Stable (v1) хаяг руу хандах
        // Энэ нь 404 (Not Found) болон v1beta-ийн алдааг бүрэн засна
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    text: `Чи бол Scholarship MN-ийн ухаалаг туслах. Хэрэглэгчийн асуултанд маш товч, тодорхой, эелдэг хариулна уу. Монгол хэлээр хариулаарай. \n\nАсуулт: ${lastMessage}`
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 800,
                    }
                })
            }
        );

        const data = await response.json();

        // Google-ээс алдаа ирвэл барьж авах
        if (data.error) {
            console.error("Google API Error Details:", data.error);
            return NextResponse.json(
                { error: data.error.message }, 
                { status: data.error.code || 500 }
            );
        }

        // AI-ийн хариултыг салгаж авах
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Уучлаарай, хариулт үүсгэхэд алдаа гарлаа.";

        return NextResponse.json({ content: aiText });

    } catch (error: any) {
        console.error("Network or Server Error:", error);
        return NextResponse.json(
            { error: "Систем ачааллахад алдаа гарлаа.", details: error.message }, 
            { status: 500 }
        );
    }
}