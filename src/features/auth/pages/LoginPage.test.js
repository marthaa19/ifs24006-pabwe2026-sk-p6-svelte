import { describe, it, expect } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import LoginPage from "./LoginPage.svelte";
import { authToken } from "../states/authStore.js";
import { renderWithProviders, mockApi, ok, fail } from "../../../test-utils.js";

const fill = async () => {
  await fireEvent.input(screen.getByLabelText("Email"), { target: { value: "a@b.c" } });
  await fireEvent.input(screen.getByLabelText("Kata Sandi"), { target: { value: "123456" } });
};
const submit = () => fireEvent.submit(screen.getByRole("button", { name: /Masuk|Memproses/ }).closest("form"));

describe("LoginPage", () => {
  it("login berhasil menyimpan token dan pindah ke beranda", async () => {
    const fetchMock = mockApi({ "POST /auth/login": ok({ token: "tok" }, "Login berhasil") });
    renderWithProviders(LoginPage, { token: null, path: "/auth/login" });
    await fill();
    await submit();
    await waitFor(() => expect(window.location.pathname).toBe("/"));
    expect(get(authToken)).toBe("tok");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ email: "a@b.c", password: "123456" });
  });

  it("login gagal tetap di halaman login", async () => {
    mockApi({ "POST /auth/login": fail("Data tidak valid") });
    renderWithProviders(LoginPage, { token: null, path: "/auth/login" });
    await fill();
    await submit();
    await waitFor(() => expect(screen.getByRole("button", { name: "Masuk" })).toBeEnabled());
    expect(window.location.pathname).toBe("/auth/login");
    expect(get(authToken)).toBeNull();
  });

  it("menampilkan 'Memproses...' selama permintaan berjalan", async () => {
    let release;
    globalThis.fetch = () =>
      new Promise((resolve) => {
        release = () => resolve({ json: async () => fail() });
      });
    renderWithProviders(LoginPage, { token: null, path: "/auth/login" });
    await fill();
    await submit();
    expect(await screen.findByRole("button", { name: "Memproses..." })).toBeDisabled();
    release();
    await waitFor(() => expect(screen.getByRole("button", { name: "Masuk" })).toBeEnabled());
  });

  it("tautan Daftar membuka halaman registrasi", async () => {
    renderWithProviders(LoginPage, { token: null, path: "/auth/login" });
    await fireEvent.click(screen.getByRole("link", { name: "Daftar" }));
    expect(window.location.pathname).toBe("/auth/register");
  });
});
