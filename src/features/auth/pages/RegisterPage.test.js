import { describe, it, expect } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import RegisterPage from "./RegisterPage.svelte";
import { renderWithProviders, mockApi, ok, fail } from "../../../test-utils.js";

const fill = async () => {
  await fireEvent.input(screen.getByLabelText("Nama"), { target: { value: "Martha" } });
  await fireEvent.input(screen.getByLabelText("Email"), { target: { value: "a@b.c" } });
  await fireEvent.input(screen.getByLabelText("Kata Sandi"), { target: { value: "123456" } });
};
const submit = () => fireEvent.submit(screen.getByRole("button", { name: /Daftar|Memproses/ }).closest("form"));

describe("RegisterPage", () => {
  it("registrasi berhasil pindah ke halaman login", async () => {
    const fetchMock = mockApi({ "POST /auth/register": ok(undefined, "Registrasi berhasil") });
    renderWithProviders(RegisterPage, { token: null, path: "/auth/register" });
    await fill();
    await submit();
    await waitFor(() => expect(window.location.pathname).toBe("/auth/login"));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      name: "Martha",
      email: "a@b.c",
      password: "123456",
    });
  });

  it("registrasi gagal tetap di halaman registrasi", async () => {
    mockApi({ "POST /auth/register": fail("Email sudah terdaftar") });
    renderWithProviders(RegisterPage, { token: null, path: "/auth/register" });
    await fill();
    await submit();
    await waitFor(() => expect(screen.getByRole("button", { name: "Daftar" })).toBeEnabled());
    expect(window.location.pathname).toBe("/auth/register");
  });

  it("menampilkan 'Memproses...' selama permintaan berjalan", async () => {
    let release;
    globalThis.fetch = () =>
      new Promise((resolve) => {
        release = () => resolve({ json: async () => fail() });
      });
    renderWithProviders(RegisterPage, { token: null, path: "/auth/register" });
    await fill();
    await submit();
    expect(await screen.findByRole("button", { name: "Memproses..." })).toBeDisabled();
    release();
    await waitFor(() => expect(screen.getByRole("button", { name: "Daftar" })).toBeEnabled());
  });

  it("tautan Masuk membuka halaman login", async () => {
    renderWithProviders(RegisterPage, { token: null, path: "/auth/register" });
    await fireEvent.click(screen.getByRole("link", { name: "Masuk" }));
    expect(window.location.pathname).toBe("/auth/login");
  });
});
