import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const NEWSLETTER_COLLECTION = "newsletter";
const LEGACY_COLLECTION = "subscribers";

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

    const body = await req.json();
    const rawEmail = typeof body?.email === "string" ? body.email : "";
    const email = rawEmail.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Имэйл хаяг шаардлагатай." }, { status: 400 });
    }

    const existingInNewsletter = await db
      .collection(NEWSLETTER_COLLECTION)
      .where("email", "==", email)
      .limit(1)
      .get();
    if (!existingInNewsletter.empty) {
      return NextResponse.json({ success: true, alreadySubscribed: true });
    }

    const existingInLegacy = await db
      .collection(LEGACY_COLLECTION)
      .where("email", "==", email)
      .limit(1)
      .get();
    if (!existingInLegacy.empty) {
      return NextResponse.json({ success: true, alreadySubscribed: true });
    }

    await db.collection(NEWSLETTER_COLLECTION).add({
      email,
      subscribedAt: new Date(),
      status: "active",
      source: "public-footer",
    });

    return NextResponse.json({ success: true, alreadySubscribed: false });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}
