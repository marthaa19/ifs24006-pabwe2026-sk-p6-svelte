import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import TypeSelect from "./TypeSelect.svelte";

describe("TypeSelect", () => {
  it("menampilkan tiga tipe bawaan dengan 'public' terpilih", () => {
    render(TypeSelect, { props: { id: "tipe" } });
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("public");
    expect([...select.options].map((o) => o.textContent)).toEqual(["Publik", "Tidak terdaftar", "Privat"]);
  });

  it("dapat mengganti pilihan", async () => {
    render(TypeSelect, { props: { id: "tipe" } });
    const select = screen.getByRole("combobox");
    await fireEvent.change(select, { target: { value: "private" } });
    expect(select).toHaveValue("private");
  });

  it("memperbarui opsi bila prop options berubah", async () => {
    const { rerender } = render(TypeSelect, { props: { id: "tipe" } });
    await rerender({ options: [{ value: "public", label: "Terbuka" }, { value: "private", label: "Rahasia" }] });
    const labels = [...screen.getByRole("combobox").options].map((o) => o.textContent);
    expect(labels).toEqual(["Terbuka", "Rahasia"]);
  });
});
