import { describe, it, expect } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import Swal from "sweetalert2";
import DetailPage from "./DetailPage.svelte";
import {
  renderWithProviders,
  mockApi,
  ok,
  fail,
  makeUser,
  makeLinkTree,
  makeItem,
  countCalls,
} from "../../../test-utils.js";

const detail = (overrides = {}, items = [makeItem()]) =>
  ok({ link_tree: { ...makeLinkTree(overrides), items } });

const open = (options = {}) =>
  renderWithProviders(DetailPage, { props: { linkTreeId: "1" }, profile: makeUser(), ...options });

describe("DetailPage", () => {
  it("menampilkan status memuat", async () => {
    globalThis.fetch = () => new Promise(() => {});
    open();
    expect(await screen.findByText("Memuat data...")).toBeInTheDocument();
  });

  it("menampilkan pesan bila link tree tidak ditemukan", async () => {
    mockApi({ "GET /link-trees/1": fail("Data tidak ditemukan") });
    open();
    expect(await screen.findByText("Link tree tidak ditemukan.")).toBeInTheDocument();
  });

  it("menampilkan detail milik sendiri lengkap dengan tombol pemilik", async () => {
    mockApi({ "GET /link-trees/1": detail({ cover: "http://x/cover.png" }) });
    open();
    expect(await screen.findByRole("heading", { name: "Kursus Ku" })).toBeInTheDocument();
    expect(screen.getByAltText("Sampul Kursus Ku")).toHaveAttribute("src", "http://x/cover.png");
    expect(screen.getByText("Kumpulan kursus ku")).toBeInTheDocument();
    expect(screen.getByText("Publik")).toBeInTheDocument();
    expect(screen.getByText("Tautan (1)")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Dasar Java/ })).toHaveAttribute("href", "https://youtu.be/abc");
    for (const name of [/Ubah Data/, /Ubah Sampul/, /Hapus$/, /Tambah Tautan/, "Ubah tautan Dasar Java", "Hapus tautan Dasar Java"]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
  });

  it("pengunjung lain tidak melihat tombol pemilik", async () => {
    mockApi({ "GET /link-trees/1": detail({ user_id: 99 }) });
    open();
    await screen.findByRole("heading", { name: "Kursus Ku" });
    expect(screen.queryByRole("button", { name: /Ubah Data|Tambah Tautan|Hapus/ })).toBeNull();
  });

  it("tanpa profil dianggap bukan pemilik", async () => {
    mockApi({ "GET /link-trees/1": detail() });
    renderWithProviders(DetailPage, { props: { linkTreeId: "1" } });
    await screen.findByRole("heading", { name: "Kursus Ku" });
    expect(screen.queryByRole("button", { name: /Tambah Tautan/ })).toBeNull();
  });

  it("menangani data yang minim: tanpa sampul, deskripsi, penulis, dan tautan", async () => {
    mockApi({
      "GET /link-trees/1": ok({
        link_tree: makeLinkTree({ description: "", author: null }),
      }),
    });
    const { container } = open();
    await screen.findByText("Tanpa deskripsi");
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText(/^- ·/)).toBeInTheDocument();
    expect(screen.getByText("Tautan (0)")).toBeInTheDocument();
    expect(screen.getByText("Belum ada tautan.")).toBeInTheDocument();
  });

  it("menampilkan foto penulis", async () => {
    mockApi({ "GET /link-trees/1": detail() });
    const { container } = open();
    await screen.findByRole("heading", { name: "Kursus Ku" });
    expect(container.querySelector('img[src="http://x/martha.png"]')).not.toBeNull();
  });

  it("tautan Kembali menuju beranda", async () => {
    mockApi({ "GET /link-trees/1": detail() });
    open({ path: "/link-trees/1" });
    await fireEvent.click(await screen.findByRole("link", { name: /Kembali/ }));
    expect(window.location.pathname).toBe("/");
  });

  it("mengubah data lewat modal tanpa mengosongkan halaman", async () => {
    const fetchMock = mockApi({ "GET /link-trees/1": detail(), "PUT /link-trees/1": ok() });
    open();
    await fireEvent.click(await screen.findByRole("button", { name: /Ubah Data/ }));
    const dialog = screen.getByRole("dialog", { name: "Ubah Link Tree" });
    await fireEvent.submit(dialog.querySelector("form"));
    await waitFor(() => expect(countCalls(fetchMock, "PUT", "/link-trees/1")).toBe(1));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.getByRole("heading", { name: "Kursus Ku" })).toBeInTheDocument();
  });

  it("membuka modal ubah sampul", async () => {
    mockApi({ "GET /link-trees/1": detail() });
    open();
    await fireEvent.click(await screen.findByRole("button", { name: /Ubah Sampul/ }));
    expect(screen.getByRole("dialog", { name: "Ubah Sampul" })).toBeInTheDocument();
    await fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("menambah tautan lewat modal", async () => {
    const fetchMock = mockApi({ "GET /link-trees/1": detail(), "POST /link-trees/1/items": ok({ item_id: 6 }) });
    open();
    await fireEvent.click(await screen.findByRole("button", { name: /Tambah Tautan/ }));
    const dialog = screen.getByRole("dialog", { name: "Tambah Tautan" });
    expect(dialog).toBeInTheDocument();
    await fireEvent.submit(dialog.querySelector("form"));
    await waitFor(() => expect(countCalls(fetchMock, "POST", "/link-trees/1/items")).toBe(1));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("mengubah tautan lewat modal berisi data tautan", async () => {
    mockApi({ "GET /link-trees/1": detail() });
    open();
    await fireEvent.click(await screen.findByRole("button", { name: "Ubah tautan Dasar Java" }));
    expect(screen.getByRole("dialog", { name: "Ubah Tautan" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText("Judul")).toHaveValue("Dasar Java"));
  });

  it("menghapus tautan setelah konfirmasi", async () => {
    const fetchMock = mockApi({ "GET /link-trees/1": detail(), "DELETE /link-trees/1/items/5": ok() });
    open();
    await fireEvent.click(await screen.findByRole("button", { name: "Hapus tautan Dasar Java" }));
    await waitFor(() => expect(countCalls(fetchMock, "DELETE", "/link-trees/1/items/5")).toBe(1));
  });

  it("tidak menghapus tautan bila konfirmasi ditolak", async () => {
    const fetchMock = mockApi({ "GET /link-trees/1": detail() });
    open();
    const button = await screen.findByRole("button", { name: "Hapus tautan Dasar Java" });
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    await fireEvent.click(button);
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    expect(countCalls(fetchMock, "DELETE", "/link-trees/1/items/5")).toBe(0);
  });

  it("menghapus link tree lalu kembali ke beranda", async () => {
    mockApi({ "GET /link-trees/1": detail(), "DELETE /link-trees/1": ok() });
    open({ path: "/link-trees/1" });
    await fireEvent.click(await screen.findByRole("button", { name: /^Hapus$/ }));
    await waitFor(() => expect(window.location.pathname).toBe("/"));
  });

  it("tetap di halaman bila hapus dibatalkan atau gagal", async () => {
    const fetchMock = mockApi({ "GET /link-trees/1": detail(), "DELETE /link-trees/1": fail() });
    open({ path: "/link-trees/1" });
    const button = await screen.findByRole("button", { name: /^Hapus$/ });

    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    await fireEvent.click(button);
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    expect(countCalls(fetchMock, "DELETE", "/link-trees/1")).toBe(0);

    await fireEvent.click(button);
    await waitFor(() => expect(countCalls(fetchMock, "DELETE", "/link-trees/1")).toBe(1));
    await waitFor(() => expect(button).toBeEnabled());
    expect(window.location.pathname).toBe("/link-trees/1");
  });
});
