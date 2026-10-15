export const TYPE_OPTIONS = [
  { value: "public", label: "Publik", class: "bg-emerald-100 text-emerald-700" },
  { value: "unlisted", label: "Tidak terdaftar", class: "bg-amber-100 text-amber-700" },
  { value: "private", label: "Privat", class: "bg-slate-200 text-slate-700" },
];

export function typeMeta(value) {
  return (
    TYPE_OPTIONS.find((o) => o.value === value) ?? {
      label: value,
      class: "bg-slate-100 text-slate-600",
    }
  );
}

export const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";
export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60";
export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60";
export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60";
