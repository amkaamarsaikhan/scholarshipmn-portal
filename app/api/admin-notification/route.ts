
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const { userEmail, userName, scholarshipTitle } = await req.json();

        const transporter = nodemailer.createTransport({
            host: "smtp.zoho.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.ZOHO_EMAIL,
                pass: process.env.ZOHO_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: `"Scholarship MN System" <${process.env.ZOHO_EMAIL}>`,
            to: process.env.ZOHO_EMAIL, // Өөрийнхөө имэйл рүү (Админ) хүлээн авна
            subject: `✅ Checklist Дууслаа: ${userName}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 2px solid #10b981; border-radius: 10px;">
                    <h2 style="color: #10b981;">Шинэ Checklist Дууслаа!</h2>
                    <p><b>Хэрэглэгч:</b> ${userName}</p>
                    <p><b>Имэйл:</b> ${userEmail}</p>
                    <p><b>Тэтгэлэг:</b> ${scholarshipTitle}</p>
                    <p><b>Төлөв:</b> Хэрэглэгч бүх материалын жагсаалтаа бүрэн чагталж дуусгалаа.</p>
                </div>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Email Error:", error);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
}