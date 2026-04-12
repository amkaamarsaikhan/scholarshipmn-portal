import * as admin from "firebase-admin";

function getServiceAccountFromEnv() {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  const privateKey = rawKey?.replace(/\\n/g, "\n").trim();
  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }
  return { projectId, clientEmail, privateKey };
}

/** Env бүрэн, credential зөв бол true. Буруу бол false (алдаа гаргахгүй). */
function ensureAdminApp(): boolean {
  if (admin.apps.length > 0) return true;
  const sa = getServiceAccountFromEnv();
  if (!sa) return false;
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: sa.projectId,
        clientEmail: sa.clientEmail,
        privateKey: sa.privateKey,
      }),
    });
    return true;
  } catch (error) {
    console.error("Firebase admin initialization error", error);
    return false;
  }
}

/** Зөвхөн Firebase Admin амжилттай эхэлсэн үед. Бусад тохиолдолд null. */
export function getAdminDb() {
  if (!ensureAdminApp()) return null;
  return admin.firestore();
}
