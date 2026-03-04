import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { db } from "@/lib/firebase"; // Энд firebase-admin ашиглах нь илүү тохиромжтой байдаг
import { collection, getDocs, query, where } from "firebase/firestore";

export async function POST(req: Request) {
    try {
        const { title, description, link } = await req.json();

        // 1. Zoho SMTP тохиргоо
        const transporter = nodemailer.createTransport({
            host: "smtp.zoho.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.ZOHO_EMAIL,
                pass: process.env.ZOHO_PASSWORD,
            },
        });

        // 2. Firestore-оос бүх subscriber-уудыг авах
        const q = query(collection(db, "subscribers"), where("status", "==", "active"));
        const snapshot = await getDocs(q);
        const emails = snapshot.docs.map(doc => doc.data().email);

        if (emails.length === 0) {
            return NextResponse.json({ message: "No subscribers found" });
        }

        // 3. Имэйл илгээх (BCC ашиглавал хүмүүс бие биенийхээ имэйлийг харахгүй)
        await transporter.sendMail({
            from: `"Scholarship MN" <${process.env.ZOHO_EMAIL}>`,
            bcc: emails, 
            subject: `ШИНЭ ТЭТГЭЛЭГ: ${title}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #10b981;">Шинэ тэтгэлэг зарлагдлаа!</h2>
                    <h3>${title}</h3>
                    <p>${description}</p>
                    <a href="${link}" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; rounded: 5px;">Дэлгэрэнгүй үзэх</a>
                </div>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Email error:", error);
        return NextResponse.json({ error: "Failed to send emails" }, { status: 500 });
    }
}