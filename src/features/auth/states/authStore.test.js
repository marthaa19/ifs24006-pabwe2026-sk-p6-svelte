import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";
import Swal from "sweetalert2";
import { postLogin, postRegister } from "../api/authApi.js";
import { authToken, isLoggedIn, isAuthLoading, login, register, logout } from "./authStore.js";

vi.mock("../api/authApi.js", () => ({ postLogin: vi.fn(), postRegister: vi.fn() }));

beforeEach(() => {
  authToken.set(null);
  postLogin.mockReset();
  postRegister.mockReset();
});

describe("authStore", () => {
  it("token awal diambil dari localStorage", async () => {
    vi.resetModules();
    localStorage.setItem("accessToken", "tersimpan");
    const fresh = await import("./authStore.js");
    expect(get(fresh.authToken)).toBe("tersimpan");
  });

  it("isLoggedIn mengikuti token", () => {
    expect(get(isLoggedIn)).toBe(false);
    authToken.set("t");
    expect(get(isLoggedIn)).toBe(true);
  });

  it("login berhasil menyimpan token", async () => {
    postLogin.mockResolvedValue({ data: { token: "tok" } });
    expect(await login("a@b.c", "123456")).toBe(true);
    expect(postLogin).toHaveBeenCalledWith({ email: "a@b.c", password: "123456" });
    expect(get(authToken)).toBe("tok");
    expect(localStorage.getItem("accessToken")).toBe("tok");
    expect(get(isAuthLoading)).toBe(false);
  });

  it("login gagal menampilkan dialog error", async () => {
    postLogin.mockRejectedValue(new Error("Email atau kata sandi salah"));
    expect(await login("a@b.c", "x")).toBe(false);
    expect(get(authToken)).toBeNull();
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "error", text: "Email atau kata sandi salah" })
    );
    expect(get(isAuthLoading)).toBe(false);
  });

  it("register berhasil menampilkan pesan sukses", async () => {
    postRegister.mockResolvedValue({ message: "Registrasi berhasil" });
    expect(await register("A", "a@b.c", "123456")).toBe(true);
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "success", text: "Registrasi berhasil" })
    );
  });

  it("register gagal menampilkan dialog error", async () => {
    postRegister.mockRejectedValue(new Error("Email sudah terdaftar"));
    expect(await register("A", "a@b.c", "123456")).toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "error", text: "Email sudah terdaftar" })
    );
  });

  it("logout menghapus token", () => {
    localStorage.setItem("accessToken", "tok");
    authToken.set("tok");
    logout();
    expect(get(authToken)).toBeNull();
    expect(localStorage.getItem("accessToken")).toBeNull();
  });
});
