import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/svelte";
import App from "./App.svelte";
import { renderWithProviders, mockApi, ok, makeUser, makeLinkTree } from "./test-utils.js";

const api = () =>
  mockApi({
    "GET /users/me": ok({ user: makeUser() }),
    "GET /users": ok({ users: [{ id: 1, name: "Budi", email: "budi@x.com" }] }),
    "GET /link-trees": ok({ link_trees: [makeLinkTree()] }),
    "GET /link-trees/1": ok({ link_tree: { ...makeLinkTree(), items: [] } }),
  });

describe("App", () => {
  it("belum login di halaman login: menampilkan layout autentikasi", () => {
    api();
    renderWithProviders(App, { token: null, path: "/auth/login" });
    expect(screen.getByRole("heading", { name: "Masuk" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Delcom Link Tree" })).toBeInTheDocument();
  });

  it("belum login di halaman registrasi", () => {
    api();
    renderWithProviders(App, { token: null, path: "/auth/register" });
    expect(screen.getByRole("heading", { name: "Daftar" })).toBeInTheDocument();
  });

  it("sudah login membuka halaman auth: diarahkan ke beranda", async () => {
    api();
    renderWithProviders(App, { path: "/auth/login" });
    await waitFor(() => expect(window.location.pathname).toBe("/"));
    expect(await screen.findByText("Kursus Ku")).toBeInTheDocument();
  });

  it("belum login membuka halaman aplikasi: diarahkan ke login tanpa memanggil API", async () => {
    const fetchMock = api();
    renderWithProviders(App, { token: null, path: "/" });
    await waitFor(() => expect(window.location.pathname).toBe("/auth/login"));
    expect(await screen.findByRole("heading", { name: "Masuk" })).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("beranda memakai layout aplikasi", async () => {
    api();
    renderWithProviders(App, { path: "/" });
    expect(await screen.findByText("Kursus Ku")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Menu utama" })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: /Martha/ })).toBeInTheDocument();
  });

  it("halaman detail menerima parameter rute", async () => {
    api();
    renderWithProviders(App, { path: "/link-trees/1" });
    expect(await screen.findByRole("heading", { name: "Kursus Ku" })).toBeInTheDocument();
    expect(screen.getByText("Tautan (0)")).toBeInTheDocument();
  });

  it("halaman pengguna", async () => {
    api();
    renderWithProviders(App, { path: "/users" });
    expect(await screen.findByText("budi@x.com")).toBeInTheDocument();
  });

  it("halaman profil", async () => {
    api();
    renderWithProviders(App, { path: "/profile" });
    expect(await screen.findByRole("heading", { name: "Profil" })).toBeInTheDocument();
  });

  it.each([
    ["sudah login", "token-uji"],
    ["belum login", null],
  ])("path tidak dikenal menampilkan 404 (%s)", async (_, token) => {
    api();
    renderWithProviders(App, { token, path: "/tidak-ada" });
    expect(await screen.findByText("404")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/tidak-ada");
  });
});
