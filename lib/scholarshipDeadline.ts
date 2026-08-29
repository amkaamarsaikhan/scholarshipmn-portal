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

/** `<input type="date">`-д зориулсан YYYY-MM-DD (орон нутгийн өдөр, UTC шилжилтгүй). */
export function deadlineToInputValue(deadline: unknown): string {
  const d = parseScholarshipDeadline(deadline);
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addMonthsToInputValue(iso: string, months: number): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso) || !Number.isFinite(months)) return iso;
  const [y, m, d] = iso.split("-").map(Number);
  const next = new Date(y, m - 1, d);
  next.setMonth(next.getMonth() + months);
  const ny = next.getFullYear();
  const nm = String(next.getMonth() + 1).padStart(2, "0");
  const nd = String(next.getDate()).padStart(2, "0");
  return `${ny}-${nm}-${nd}`;
}

export function addOneYearToInputValue(iso: string): string {
  return addMonthsToInputValue(iso, 12);
}

/**
 * Дуусах өдөр одоогоос хойш эсэх. Хугацаа тодорхойгүй бол идэвхтэй гэж үзнэ.
 */
export function isScholarshipDeadlineOpen(deadline: unknown, now = new Date()): boolean {
  const d = parseScholarshipDeadline(deadline);
  if (d === null) return true;
  return d.getTime() > now.getTime();
}
