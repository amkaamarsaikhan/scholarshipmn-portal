import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Системд өгөх заавар - AI-г "Тэтгэлгийн зөвлөх" болгож тохируулж байна
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "Чи бол Scholarship MN-ийн ухаалаг туслах. Чи хэрэглэгчдэд тэтгэлэг, сургалтын төв, гадаад суралцах талаар маш товч бөгөөд тодорхой зөвлөгөө өгөх ёстой. Хэрэглэгчтэй найрсаг харилцаарай." }],
                },
                {
                    role: "model",
                    parts: [{ text: "Ойлголоо. Би Scholarship MN-ийн зөвлөх байна." }],
                },
            ],
        });

        // Хамгийн сүүлийн мессежийг илгээх
        const lastMessage = messages[messages.length - 1].content;
        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;
        
        return NextResponse.json({ content: response.text() });
    } catch (error) {
        console.error("Chat Error:", error);
        return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
    }
}