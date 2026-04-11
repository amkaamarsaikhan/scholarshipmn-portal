import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const { message } = await req.json();

        // 1. API хүсэлт явуулах (gemini-2.5-flash хэвээр үлдээв)
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Чи бол тэтгэлэг хайлтын туслах. Хэрэглэгчийн өгүүлбэрээс IELTS оноо болон Улсын нэрийг салгаж аваарай.
                            
                            ДҮРЭМ:
                            1. Улсын нэрийг заавал Англиар (жишээ нь: South Korea, USA, Germany, Japan) буцаа.
                            2. IELTS оноог тоогоор буцаа.
                            3. Зөвхөн JSON формат ашигла. Өөр ямар ч тайлбар бичиж болохгүй.
                            
                            Хэрэв хайлт мөн бол: {"isSearch": true, "country": "Country Name", "ielts": 6.5}
                            Хэрэв хайлт биш бол: {"isSearch": false}
                            
                            Хэрэглэгчийн өгүүлбэр: "${message}"`
                        }]
                    }],
                    generationConfig: {
                        // AI-г заавал JSON буцаадаг болгох "түгжээ"
                        response_mime_type: "application/json",
                    }
                })
            }
        );

        const data = await response.json();

        if (!data.candidates || !data.candidates[0]) {
            return NextResponse.json({ isSearch: false, error: "AI хариу өгсөнгүй" });
        }

        let aiRawText = data.candidates[0].content.parts[0].text.trim();

        // AI заримдаа ```json ... ``` дотор хариугаа хийчихдэг тул цэвэрлэх логик
        if (aiRawText.startsWith("```")) {
            aiRawText = aiRawText.replace(/^```json/i, "").replace(/```$/, "").trim();
        }

        try {
            const aiResponse = JSON.parse(aiRawText);
            return NextResponse.json(aiResponse);
        } catch (parseError) {
            console.error("JSON Parse Error:", aiRawText);
            return NextResponse.json({ isSearch: false, error: "Буруу форматтай хариу" });
        }

    } catch (error: any) {
        console.error("API Route Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}