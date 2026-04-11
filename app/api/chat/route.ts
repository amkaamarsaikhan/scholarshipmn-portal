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
                            1. "country": Улсыг заавал Англиар (South Korea, USA, Australia, Japan, Germany г.м) буцаа. Солонгос = South Korea.
                            2. "ielts": IELTS оноо (жишээ 6.5) — "ielts" key-д тоогоор.
                            3. "gpa": GPA/голч оноо — "gpa" key-д тоогоор.
                            4. "degree": Bachelor, Master, PhD (Англиар).
                            5. "topik": Солонгос хэлний TOPIK түвшин 1–6 (топик, TOPIK гэж бичсэн бол энд тоогоор).
                            6. "german": Герман TestDaF TDN эсвэл түвшин тоогоор (жишээ 4).
                            7. "hsk": Хятад HSK түвшин 1–6.
                            8. "jlpt": Япон JLPT түвшин 1–5 (N1=5 гэх мэт эсвэл шууд тоо).
                            9. "keyword": category-д таарах түлхүүр (Full эсвэл Partial) зөвхөн шаардлагатай бол.
                            10. "isSearch": Тэтгэлэг хайх асуулт бол заавал true.

                            ХАРИУ ӨГӨХ ФОРМАТ (null эсвэл тоо):
                            {
                              "isSearch": true,
                              "country": string | null,
                              "ielts": number | null,
                              "gpa": number | null,
                              "degree": string | null,
                              "keyword": string | null,
                              "topik": number | null,
                              "german": number | null,
                              "hsk": number | null,
                              "jlpt": number | null
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