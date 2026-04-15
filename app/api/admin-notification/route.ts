import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const subject = body?.subject || "🆕 Шинэ мэдэгдэл";
        const email = body?.newUserEmail || body?.email || "Тодорхойгүй";
        const phone = body?.phone || null;
        const scholarship = body?.scholarship || null;
        const description =
            body?.description ||
            "Энэхүү мэдэгдэл нь системээс автоматаар илгээгдэв.";

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
            subject: String(subject),
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 2px solid #3b82f6; border-radius: 10px;">
                    <h2 style="color: #3b82f6;">Админ мэдэгдэл</h2>
                    <p><b>Имэйл хаяг:</b> ${email}</p>
                    ${phone ? `<p><b>Утас:</b> ${phone}</p>` : ""}
                    ${scholarship ? `<p><b>Тэтгэлэг:</b> ${scholarship}</p>` : ""}
                    <p><b>Хугацаа:</b> ${new Date().toLocaleString()}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #666;">${description}</p>
                </div>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to notify admin" }, { status: 500 });
    }
}