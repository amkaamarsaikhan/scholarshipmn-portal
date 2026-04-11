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
                            text: `Чи бол тэтгэлэг хайлтын ухаалаг туслах. Хэрэглэгчийн хүсэлтээс параметрүүдийг салгаж JSON буцаа.

                            ДҮРЭМ:
                            1. "country": Улсыг заавал Англиар (South Korea, USA, Australia, Japan, Germany г.м) буцаа.
                            2. "ielts": IELTS-ийн оноог "ielts" key-д тоогоор хадгал.
                            3. "gpa": Хэрэв хэрэглэгч GPA (голч оноо) хэлбэл "gpa" key-д тоогоор хадгал.
                            4. "degree": Боловсролын зэргийг Англиар (Bachelor, Master, PhD) хадгал.
                            5. "isSearch": Хайлт хийх боломжтой бол true.

                            ХАРИУ ӨГӨХ ФОРМАТ:
                            {
                              "isSearch": true,
                              "country": string | null,
                              "ielts": number | null,
                              "gpa": number | null,
                              "degree": string | null,
                              "keyword": string | null
                            }

                            Хэрэглэгчийн өгүүлбэр: "${message}"`
                        }]
                    }],
                    generationConfig: {
                        response_mime_type: "application/json",
                    }
                })
            }
        );

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0]) {
            return NextResponse.json({ isSearch: false });
        }

        const aiRawText = data.candidates[0].content.parts[0].text;
        const aiResponse = JSON.parse(aiRawText);
        
        return NextResponse.json(aiResponse);

    } catch (error: any) {
        console.error("AI API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}