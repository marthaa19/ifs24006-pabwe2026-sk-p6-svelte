import { describe, it, expect } from "vitest";
import {
  fetchApi,
  getAccessToken,
  putAccessToken,
  removeAccessToken,
} from "./apiHelper.js";
import { mockApi, ok, fail } from "../test-utils.js";

describe("token akses", () => {
  it("menyimpan, membaca, dan menghapus token", () => {
    expect(getAccessToken()).toBeNull();
    putAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});

describe("fetchApi", () => {
  it("GET tanpa token dan tanpa body", async () => {
    const fetchMock = mockApi({ "GET /x": ok({ a: 1 }) });
    const res = await fetchApi("/x");
    expect(res.data).toEqual({ a: 1 });
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/api/v1/x", {
      method: "GET",
      headers: {},
      body: undefined,
    });
  });

  it("menyertakan Authorization bila token ada", async () => {
    putAccessToken("tok");
    const fetchMock = mockApi();
    await fetchApi("/x");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer tok");
  });

  it("mengirim body object sebagai JSON", async () => {
    const fetchMock = mockApi();
    await fetchApi("/x", { method: "POST", body: { a: 1 } });
    const options = fetchMock.mock.calls[0][1];
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.body).toBe('{"a":1}');
  });

  it("mengirim FormData apa adanya tanpa Content-Type", async () => {
    const fetchMock = mockApi();
    const form = new FormData();
    await fetchApi("/x", { method: "POST", body: form });
    const options = fetchMock.mock.calls[0][1];
    expect(options.body).toBe(form);
    expect(options.headers["Content-Type"]).toBeUndefined();
  });

  it("melempar error bila jaringan gagal", async () => {
    globalThis.fetch = () => Promise.reject(new Error("offline"));
    await expect(fetchApi("/x")).rejects.toThrow("Tidak dapat terhubung ke server");
  });

  it("melempar error bila respons bukan JSON", async () => {
    globalThis.fetch = () => Promise.resolve({ json: () => Promise.reject(new Error("bad")) });
    await expect(fetchApi("/x")).rejects.toThrow("Tidak dapat terhubung ke server");
  });

  it("menambahkan detail validasi ke pesan error", async () => {
    mockApi({ "GET /x": fail("Data tidak valid", { email: ["Email wajib diisi"], name: ["Nama wajib"] }) });
    await expect(fetchApi("/x")).rejects.toThrow("Data tidak valid: Email wajib diisi, Nama wajib");
  });

  it("memakai pesan bawaan bila server tidak mengirim pesan", async () => {
    mockApi({ "GET /x": { status: "fail" } });
    await expect(fetchApi("/x")).rejects.toThrow("Terjadi kesalahan");
  });

  it("mengabaikan data yang bukan object atau tidak berisi detail", async () => {
    mockApi({
      "GET /a": { status: "fail", message: "Gagal A", data: null },
      "GET /b": { status: "fail", message: "Gagal B", data: "teks" },
      "GET /c": { status: "fail", message: "Gagal C", data: {} },
    });
    await expect(fetchApi("/a")).rejects.toThrow(/^Gagal A$/);
    await expect(fetchApi("/b")).rejects.toThrow(/^Gagal B$/);
    await expect(fetchApi("/c")).rejects.toThrow(/^Gagal C$/);
  });
});
