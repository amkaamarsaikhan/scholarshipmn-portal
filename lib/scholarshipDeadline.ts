/**
 * Firestore Timestamp, string, эсвэл хоосон утгыг Date руу хувиргана.
 */
export function parseScholarshipDeadline(deadline: unknown): Date | null {
  if (deadline == null || deadline === "") return null;
  if (typeof deadline === "object" && deadline !== null) {
    const anyD = deadline as { toDate?: () => Date; seconds?: number };
    if (typeof anyD.toDate === "function") {
      const d = anyD.toDate();
      return Number.isNaN(d.getTime()) ? null : d;
    }
    if (typeof anyD.seconds === "number") {
      return new Date(anyD.seconds * 1000);
    }
  }
  const parsed = new Date(deadline as string | number);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Дуусах өдөр одоогоос хойш эсэх. Хугацаа тодорхойгүй бол идэвхтэй гэж үзнэ.
 */
export function isScholarshipDeadlineOpen(deadline: unknown, now = new Date()): boolean {
  const d = parseScholarshipDeadline(deadline);
  if (d === null) return true;
  return d.getTime() > now.getTime();
}
