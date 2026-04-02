import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { newUserEmail } = await req.json();

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
            to: process.env.ZOHO_EMAIL,
            subject: `🆕 Шинэ хэрэглэгч бүртгүүллээ`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 2px solid #3b82f6; border-radius: 10px;">
                    <h2 style="color: #3b82f6;">Шинэ Newsletter Бүртгэл!</h2>
                    <p><b>Имэйл хаяг:</b> ${newUserEmail}</p>
                    <p><b>Хугацаа:</b> ${new Date().toLocaleString()}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #666;">Энэхүү мэдэгдэл нь Footer-ийн бүртгэл хэсгээс автоматаар илгээгдэв.</p>
                </div>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to notify admin" }, { status: 500 });
    }
}