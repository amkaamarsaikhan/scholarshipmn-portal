import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const db = getAdminDb();
        if (!db) {
            return NextResponse.json(
                {
                    error:
                        "Firebase Admin тохируулаагүй байна. FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY шалгана уу.",
                },
                { status: 503 }
            );
        }

        const zohoUser = process.env.ZOHO_EMAIL?.trim();
        const zohoPass = process.env.ZOHO_PASSWORD;
        if (!zohoUser || !zohoPass) {
            return NextResponse.json(
                { error: "Имэйл (SMTP) тохируулаагүй байна. ZOHO_EMAIL, ZOHO_PASSWORD шалгана уу." },
                { status: 503 }
            );
        }

        const { title, description, link, country } = await req.json();

        const snapshot = await db.collection("subscribers").where("status", "==", "active").get();
        const recipientEmails = snapshot.docs.map(doc => doc.data().email);

        if (recipientEmails.length === 0) {
            return NextResponse.json({ success: true, message: "No subscribers found" });
        }

        const transporter = nodemailer.createTransport({
            host: "smtp.zoho.com",
            port: 465,
            secure: true,
            auth: {
                user: zohoUser,
                pass: zohoPass,
            },
        });

        await transporter.sendMail({
            from: `"Scholarship MN" <${zohoUser}>`,
            to: zohoUser,
            bcc: recipientEmails.join(", "), // Бүх бүртгүүлэгчид рүү нууцаар илгээнэ
            subject: `📢 ШИНЭ ТЭТГЭЛЭГ: ${title}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
                    <div style="background-color: #059669; padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">Шинэ тэтгэлэг зарлагдлаа!</h1>
                    </div>
                    <div style="padding: 30px; color: #1e293b;">
                        <h2 style="color: #059669; margin-top: 0;">${title}</h2>
                        <p><b>📍 Улс:</b> ${country}</p>
                        <p style="line-height: 1.6;">${description}</p>
                        <div style="margin-top: 30px; text-align: center;">
                            <a href="${link}" style="background-color: #059669; color: white; padding: 14px 24px; text-decoration: none; border-radius: 12px; font-weight: bold;">Дэлгэрэнгүй үзэх</a>
                        </div>
                    </div>
                    <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
                        <p>© ${new Date().getFullYear()} Scholarship MN Academy. Бүх эрх хуулиар хамгаалагдсан.</p>
                        <p>Та манай мэдээллийн санд бүртгүүлсэн тул энэхүү имэйлийг хүлээн авч байна.</p>
                    </div>
                </div>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Newsletter Error:", error);
        return NextResponse.json({ error: "Failed to send newsletter" }, { status: 500 });
    }
}