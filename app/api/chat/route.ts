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
        const lastMessage = messages[messages.length - 1].content;

        // SDK-ийн оронд шууд хаягаар нь дуудаж байна
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `Чи бол Scholarship MN-ийн туслах. Монголоор хариул. Асуулт: ${lastMessage}` }] }]
                })
            }
        );

        const data = await response.json();
        
        if (data.error) {
            console.error("Google Error:", data.error);
            return NextResponse.json({ error: data.error.message }, { status: 500 });
        }

        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Хариулт алга.";
        return NextResponse.json({ content: aiText });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}