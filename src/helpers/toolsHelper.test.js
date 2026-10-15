import { describe, it, expect } from "vitest";
import Swal from "sweetalert2";
import {
  showSuccessDialog,
  showErrorDialog,
  showWarningDialog,
  showConfirmDialog,
  formatDate,
  hasImage,
} from "./toolsHelper.js";

describe("dialog", () => {
  it("menampilkan dialog sukses, error, dan peringatan", async () => {
    await showSuccessDialog("ok");
    await showErrorDialog("buruk");
    await showWarningDialog("awas");
    expect(Swal.fire).toHaveBeenNthCalledWith(1, { icon: "success", title: "Berhasil", text: "ok" });
    expect(Swal.fire).toHaveBeenNthCalledWith(2, { icon: "error", title: "Gagal", text: "buruk" });
    expect(Swal.fire).toHaveBeenNthCalledWith(3, { icon: "warning", title: "Perhatian", text: "awas" });
  });

  it("konfirmasi mengembalikan true saat disetujui", async () => {
    expect(await showConfirmDialog("Hapus?", "Yakin")).toBe(true);
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Hapus?", text: "Yakin", showCancelButton: true })
    );
  });

  it("konfirmasi mengembalikan false saat dibatalkan dan teks bawaan kosong", async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    expect(await showConfirmDialog("Hapus?")).toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: "" }));
  });
});

describe("formatDate", () => {
  it("memformat tanggal ke bahasa Indonesia", () => {
    expect(formatDate("2025-03-09T01:32:33.000000Z")).toContain("2025");
  });
  it("mengembalikan tanda hubung bila kosong", () => {
    expect(formatDate(null)).toBe("-");
  });
});

describe("hasImage", () => {
  it("mengenali URL gambar yang sudah diunggah", () => {
    expect(hasImage("http://x/cover.png")).toBe(true);
  });
  it("menolak URL kosong atau berakhiran garis miring", () => {
    expect(hasImage("")).toBe(false);
    expect(hasImage(null)).toBe(false);
    expect(hasImage("http://x/")).toBe(false);
  });
});
