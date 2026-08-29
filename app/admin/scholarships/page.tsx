"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import AdminGuard from "@/components/admin/AdminGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  addMonthsToInputValue,
  deadlineToInputValue,
  isScholarshipDeadlineOpen,
} from "@/lib/scholarshipDeadline";
import {
  ArrowLeft,
  CalendarPlus,
  CalendarRange,
  Loader2,
  Save,
  Search,
} from "lucide-react";

type Row = {
  id: string;
  title: string;
  country: string;
  link: string;
  deadlineInput: string;
  original: string;
  selected: boolean;
};

function dateFromInput(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export default function AdminScholarshipsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">("all");
  const [shiftMonths, setShiftMonths] = useState(12);
  const [bulkDate, setBulkDate] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const snap = await getDocs(collection(db, "scholarships"));
      const next: Row[] = snap.docs.map((docSnap) => {
        const data = docSnap.data();
        const deadlineInput = deadlineToInputValue(data.deadline);
        return {
          id: docSnap.id,
          title: String(data.title ?? "Нэргүй"),
          country: String(data.country ?? ""),
          link: typeof data.link === "string" ? data.link : "",
          deadlineInput,
          original: deadlineInput,
          selected: false,
        };
      });
      next.sort((a, b) => {
        if (!a.deadlineInput && b.deadlineInput) return 1;
        if (a.deadlineInput && !b.deadlineInput) return -1;
        if (a.deadlineInput !== b.deadlineInput) return a.deadlineInput.localeCompare(b.deadlineInput);
        return a.title.localeCompare(b.title);
      });
      setRows(next);
    } catch (err) {
      console.error(err);
      setMessage({ type: "err", text: "Тэтгэлэг татахад алдаа гарлаа." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesQuery =
        !q ||
        row.title.toLowerCase().includes(q) ||
        row.country.toLowerCase().includes(q);
      const open = isScholarshipDeadlineOpen(row.deadlineInput || null);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "open" && open) ||
        (statusFilter === "closed" && !open);
      return matchesQuery && matchesStatus;
    });
  }, [rows, queryText, statusFilter]);

  const dirtyCount = rows.filter((r) => r.deadlineInput !== r.original).length;
  const selectedCount = filtered.filter((r) => r.selected).length;
  const allVisibleSelected = filtered.length > 0 && filtered.every((r) => r.selected);

  const setDeadline = (id: string, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, deadlineInput: value } : r)));
  };

  const toggleSelected = (id: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)));
  };

  const toggleAllVisible = () => {
    const ids = new Set(filtered.map((r) => r.id));
    const next = !allVisibleSelected;
    setRows((prev) => prev.map((r) => (ids.has(r.id) ? { ...r, selected: next } : r)));
  };

  const selectedIds = () => new Set(filtered.filter((r) => r.selected).map((r) => r.id));

  const bumpSelected = () => {
    const ids = selectedIds();
    if (ids.size === 0) {
      setMessage({ type: "err", text: "Эхлээд мөр сонгоно уу." });
      return;
    }
    const months = Math.trunc(shiftMonths);
    if (!Number.isFinite(months) || months === 0) {
      setMessage({ type: "err", text: "Нэмэх сараа 1, 7 гэх мэт тоогоор бичнэ үү." });
      return;
    }
    setRows((prev) =>
      prev.map((r) => {
        if (!ids.has(r.id) || !r.deadlineInput) return r;
        return { ...r, deadlineInput: addMonthsToInputValue(r.deadlineInput, months) };
      })
    );
    setMessage({
      type: "ok",
      text: `${ids.size} мөрөнд ${months > 0 ? "+" : ""}${months} сар нэмсэн. Хадгалахыг бүү мартаарай.`,
    });
  };

  const applyDateToSelected = () => {
    const ids = selectedIds();
    if (ids.size === 0) {
      setMessage({ type: "err", text: "Эхлээд мөр сонгоно уу." });
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(bulkDate)) {
      setMessage({ type: "err", text: "Тавих огноогоо сонгоно уу." });
      return;
    }
    setRows((prev) => prev.map((r) => (ids.has(r.id) ? { ...r, deadlineInput: bulkDate } : r)));
    setMessage({ type: "ok", text: `${ids.size} мөрөнд ${bulkDate} тавьсан. Хадгалахыг бүү мартаарай.` });
  };

  const saveChanges = async () => {
    const changed = rows.filter((r) => r.deadlineInput !== r.original);
    if (changed.length === 0) return;
    const invalid = changed.find((r) => r.deadlineInput && !/^\d{4}-\d{2}-\d{2}$/.test(r.deadlineInput));
    if (invalid) {
      setMessage({ type: "err", text: `"${invalid.title}" огноо буруу байна.` });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const chunkSize = 400;
      for (let i = 0; i < changed.length; i += chunkSize) {
        const chunk = changed.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        for (const row of chunk) {
          batch.update(doc(db, "scholarships", row.id), {
            deadline: row.deadlineInput ? Timestamp.fromDate(dateFromInput(row.deadlineInput)) : null,
            updatedAt: serverTimestamp(),
          });
        }
        await batch.commit();
      }
      setRows((prev) =>
        prev.map((r) =>
          r.deadlineInput !== r.original ? { ...r, original: r.deadlineInput } : r
        )
      );
      setMessage({
        type: "ok",
        text: `${changed.length} тэтгэлгийн огноо шинэчлэгдлээ. Хадгалсан жагсаалтын ID хэвээр.`,
      });
    } catch (err) {
      console.error(err);
      setMessage({ type: "err", text: "Хадгалахад алдаа гарлаа." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 md:px-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:underline mb-3"
              >
                <ArrowLeft size={16} /> Админ самбар
              </Link>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-4 py-1 rounded-full font-black tracking-widest uppercase text-[10px]">
                Batch update
              </Badge>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mt-3">
                Тэтгэлгийн огноо
              </h1>
              <p className="text-slate-500 font-medium mt-2 max-w-2xl">
                Firestore дээрх бүх тэтгэлгийг хүснэгтээр засна. Document ID солигдохгүй тул хэрэглэгчийн хадгалсан жагсаалт устахгүй.
              </p>
            </div>
            <p className="text-sm font-black text-emerald-800">
              Нийт {rows.length} · Харагдаж буй {filtered.length} · Өөрчилсөн {dirtyCount}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-emerald-50 p-4 md:p-6 space-y-4">
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder="Нэр эсвэл улсаар хайх"
                  className="pl-9 h-12 rounded-2xl"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {([
                  ["all", "Бүгд"],
                  ["open", "Идэвхтэй"],
                  ["closed", "Хаагдсан"],
                ] as const).map(([id, label]) => (
                  <Button
                    key={id}
                    type="button"
                    variant={statusFilter === id ? "default" : "outline"}
                    onClick={() => setStatusFilter(id)}
                    className={`h-11 rounded-xl font-bold ${
                      statusFilter === id ? "bg-emerald-600 hover:bg-emerald-700" : ""
                    }`}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col lg:flex-row gap-2 lg:items-center lg:justify-between">
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={-36}
                      max={36}
                      step={1}
                      value={shiftMonths}
                      onChange={(e) => setShiftMonths(Number(e.target.value))}
                      className="h-11 w-[88px] rounded-xl font-bold"
                      aria-label="Нэмэх сар"
                    />
                    <span className="text-sm font-bold text-slate-600 whitespace-nowrap">сар</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[1, 6, 7, 12].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setShiftMonths(n)}
                        className={`h-9 px-3 rounded-lg text-xs font-black ${
                          shiftMonths === n
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        +{n}
                      </button>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={bumpSelected}
                    disabled={saving || selectedCount === 0}
                    className="h-11 rounded-xl font-bold"
                  >
                    <CalendarPlus size={16} className="mr-2" />
                    Сонгосонд нэмэх ({selectedCount})
                  </Button>
                </div>
                <Button
                  type="button"
                  onClick={() => void saveChanges()}
                  disabled={saving || dirtyCount === 0}
                  className="h-11 rounded-xl font-black bg-emerald-600 hover:bg-emerald-700"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Хадгалж байна...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Өөрчлөлт хадгалах ({dirtyCount})
                    </>
                  )}
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <Input
                  type="date"
                  value={bulkDate}
                  onChange={(e) => setBulkDate(e.target.value)}
                  className="h-11 w-full sm:w-[180px] rounded-xl"
                  aria-label="Сонгосонд тавих огноо"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={applyDateToSelected}
                  disabled={saving || selectedCount === 0}
                  className="h-11 rounded-xl font-bold"
                >
                  <CalendarRange size={16} className="mr-2" />
                  Сонгосонд энэ огноог тавих
                </Button>
                <p className="text-xs text-slate-500 font-medium sm:ml-2">
                  Нэг мөрийн огноо өөр бол хүснэгт дээр шууд засна.
                </p>
              </div>
            </div>

            {message && (
              <p className={`text-sm font-bold ${message.type === "ok" ? "text-emerald-700" : "text-red-600"}`}>
                {message.text}
              </p>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-50">
            {loading ? (
              <div className="py-20 text-center font-black uppercase tracking-widest text-emerald-900 italic">
                Ачааллаж байна...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-slate-500 font-bold">Тэтгэлэг олдсонгүй.</div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-slate-100">
                    <TableHead className="w-12 pl-4">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleAllVisible}
                        aria-label="Харагдаж буй бүгдийг сонгох"
                      />
                    </TableHead>
                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Тэтгэлэг</TableHead>
                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Улс</TableHead>
                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Төлөв</TableHead>
                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Deadline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row) => {
                    const dirty = row.deadlineInput !== row.original;
                    const open = isScholarshipDeadlineOpen(row.deadlineInput || null);
                    return (
                      <TableRow
                        key={row.id}
                        className={`border-slate-50 ${dirty ? "bg-amber-50/70" : ""}`}
                      >
                        <TableCell className="pl-4">
                          <input
                            type="checkbox"
                            checked={row.selected}
                            onChange={() => toggleSelected(row.id)}
                            aria-label={`${row.title} сонгох`}
                          />
                        </TableCell>
                        <TableCell className="min-w-[220px] whitespace-normal">
                          <p className="font-bold text-slate-900 leading-snug">{row.title}</p>
                          {row.link ? (
                            <a
                              href={row.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-bold text-emerald-600 hover:underline"
                            >
                              Албан ёсны холбоос
                            </a>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-slate-600 font-medium">{row.country || "—"}</TableCell>
                        <TableCell>
                          <Badge
                            className={`border-none text-[10px] font-black uppercase ${
                              open ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {open ? "Идэвхтэй" : "Хаагдсан"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={row.deadlineInput}
                            onChange={(e) => setDeadline(row.id, e.target.value)}
                            className="h-10 w-[160px] rounded-xl"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
