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
                            text: `Чи бол тэтгэлэг хайлтын ухаалаг туслах. Хэрэглэгчийн Монгол хэлээр бичсэн хүсэлтийг хайлтын параметрүүд рүү хөрвүүл.

                            ДҮРЭМ:
                            1. Улсын нэрийг Англиар стандарт хэлбэрт оруул (Жишээ нь: Солонгос -> South Korea, АНУ/Америк -> USA, Япон -> Japan, Герман -> Germany, Канад -> Canada).
                            2. IELTS эсвэл TOEFL-ийн оноог "ielts" гэдэг key-д тоогоор хадгал.
                            3. Хэрэв хэрэглэгч боловсролын зэрэг (Бакалавр, Магистр, Доктор) хэлсэн бол "degree" key-д Англиар (Bachelor, Master, PhD) хадгал.
                            4. "isSearch" утгыг хайлт хийх боломжтой үед л true болго.
                            
                            ХАРИУ ӨГӨХ ФОРМАТ (ЗӨВХӨН JSON):
                            {
                              "isSearch": true,
                              "country": "South Korea" | "USA" | "Japan" | null,
                              "ielts": number | null,
                              "degree": "Bachelor" | "Master" | "PhD" | null,
                              "keyword": "Мэргэжил эсвэл бусад түлхүүр үг" | null
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