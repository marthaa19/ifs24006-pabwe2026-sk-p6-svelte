import { describe, it, expect } from "vitest";
import { TYPE_OPTIONS, typeMeta } from "./constants.js";

describe("typeMeta", () => {
  it("mengembalikan label untuk setiap tipe", () => {
    expect(TYPE_OPTIONS.map((o) => o.value)).toEqual(["public", "unlisted", "private"]);
    expect(typeMeta("public").label).toBe("Publik");
    expect(typeMeta("unlisted").label).toBe("Tidak terdaftar");
    expect(typeMeta("private").label).toBe("Privat");
  });

  it("memakai nilai apa adanya untuk tipe yang tidak dikenal", () => {
    expect(typeMeta("lain")).toEqual({ label: "lain", class: "bg-slate-100 text-slate-600" });
  });
});
