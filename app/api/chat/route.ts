import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const { message } = await req.json();

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Хэрэглэгчийн өгүүлбэрээс хайлтын параметрүүдийг салгаж зөвхөн JSON хэлбэрээр буцаа. 
                            Жишээ формат: {"ielts": 6, "country": "South Korea", "isSearch": true}
                            Хэрэв хайлт биш бол {"isSearch": false} гэж буцаа.
                            
                            Өгүүлбэр: "${message}"`
                        }]
                    }],
                    // AI-г заавал JSON буцаадаг болгох тохиргоо
                    generationConfig: {
                        response_mime_type: "application/json",
                    }
                })
            }
        );

        const data = await response.json();
        const aiResponse = JSON.parse(data.candidates[0].content.parts[0].text);
        
        return NextResponse.json(aiResponse);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}