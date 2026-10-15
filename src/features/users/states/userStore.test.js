import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";
import Swal from "sweetalert2";
import { getUsers, getMe, putMe, postPhoto, putPassword } from "../api/userApi.js";
import {
  users,
  profile,
  isUserLoading,
  loadUsers,
  loadProfile,
  updateProfile,
  updatePhoto,
  updatePassword,
} from "./userStore.js";

vi.mock("../api/userApi.js", () => ({
  getUsers: vi.fn(),
  getMe: vi.fn(),
  putMe: vi.fn(),
  postPhoto: vi.fn(),
  putPassword: vi.fn(),
}));

const me = { id: 1, name: "Martha" };

beforeEach(() => {
  [getUsers, getMe, putMe, postPhoto, putPassword].forEach((fn) => fn.mockReset());
  users.set([]);
  profile.set(null);
});

describe("userStore", () => {
  it("loadUsers mengisi daftar pengguna", async () => {
    getUsers.mockResolvedValue({ data: { users: [me] } });
    await loadUsers();
    expect(get(users)).toEqual([me]);
    expect(get(isUserLoading)).toBe(false);
  });

  it("loadUsers gagal menampilkan dialog error", async () => {
    getUsers.mockRejectedValue(new Error("Gagal memuat"));
    await loadUsers();
    expect(get(users)).toEqual([]);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: "Gagal memuat" }));
    expect(get(isUserLoading)).toBe(false);
  });

  it("loadProfile mengisi profil", async () => {
    getMe.mockResolvedValue({ data: { user: me } });
    await loadProfile();
    expect(get(profile)).toEqual(me);
  });

  it("loadProfile gagal menampilkan dialog error", async () => {
    getMe.mockRejectedValue(new Error("Unauthenticated."));
    await loadProfile();
    expect(get(profile)).toBeNull();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: "Unauthenticated." }));
  });

  it.each([
    ["updateProfile", () => updateProfile("A", "a@b.c"), putMe, "Profil berhasil diubah"],
    ["updatePhoto", () => updatePhoto(new File(["x"], "f.png")), postPhoto, "Foto berhasil diubah"],
    ["updatePassword", () => updatePassword("lama", "baru"), putPassword, "Kata sandi berhasil diubah"],
  ])("%s berhasil memuat ulang profil", async (_, run, apiFn, fallback) => {
    apiFn.mockResolvedValue({});
    getMe.mockResolvedValue({ data: { user: me } });
    expect(await run()).toBe(true);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: fallback }));
    expect(get(profile)).toEqual(me);
  });

  it("memakai pesan dari server bila tersedia", async () => {
    putMe.mockResolvedValue({ message: "Pesan server" });
    getMe.mockResolvedValue({ data: { user: me } });
    await updateProfile("A", "a@b.c");
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: "Pesan server" }));
  });

  it("mutasi gagal menampilkan dialog error dan mengembalikan false", async () => {
    putMe.mockRejectedValue(new Error("Data tidak valid"));
    expect(await updateProfile("A", "x")).toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Data tidak valid" }));
    expect(getMe).not.toHaveBeenCalled();
  });
});
