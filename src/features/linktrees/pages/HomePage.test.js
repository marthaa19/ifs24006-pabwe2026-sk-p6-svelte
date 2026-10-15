import { describe, it, expect } from "vitest";
import { screen, fireEvent, waitFor, within } from "@testing-library/svelte";
import Swal from "sweetalert2";
import HomePage from "./HomePage.svelte";
import {
  renderWithProviders,
  mockApi,
  ok,
  fail,
  makeUser,
  makeLinkTree,
  countCalls,
} from "../../../test-utils.js";

const mine = makeLinkTree({ id: 1, user_id: 7, title: "Kursus Ku", cover: "http://x/c.png", description: "Belajar Java" });
const other = makeLinkTree({
  id: 2,
  user_id: 9,
  title: "Milik Orang",
  type: "private",
  description: null,
  author: { name: "Budi", photo: null },
  total_links: undefined,
});
const anon = makeLinkTree({ id: 3, user_id: 9, title: "Tanpa Penulis", type: "unlisted", author: null });
const list = (...items) => ok({ link_trees: items });

describe("HomePage", () => {
  it("menampilkan status memuat", async () => {
    globalThis.fetch = () => new Promise(() => {});
    renderWithProviders(HomePage, { profile: makeUser() });
    expect(await screen.findByText("Memuat data...")).toBeInTheDocument();
  });

  it("menampilkan pesan kosong bila belum ada link tree", async () => {
    mockApi({ "GET /link-trees": list() });
    renderWithProviders(HomePage, { profile: makeUser() });
    expect(await screen.findByText("Belum ada link tree.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Hapus Semua/ })).toBeNull();
  });

  it("menampilkan statistik dan kartu dengan berbagai kondisi data", async () => {
    mockApi({ "GET /link-trees": list(mine, other, anon) });
    const { container } = renderWithProviders(HomePage, { profile: makeUser() });
    await screen.findByText("Kursus Ku");

    const stat = (label) => screen.getByText(label, { selector: "p" }).parentElement.querySelector("p");
    expect(stat("Total Link Tree")).toHaveTextContent("3");
    expect(stat("Publik")).toHaveTextContent("1");
    expect(stat("Tidak publik")).toHaveTextContent("2");
    expect(stat("Total Tautan")).toHaveTextContent("4");

    expect(screen.getByText("Belajar Java")).toBeInTheDocument();
    expect(screen.getAllByText("Tanpa deskripsi")).toHaveLength(1);
    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getAllByText("-").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Publik", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText("Privat")).toBeInTheDocument();
    expect(screen.getByText("Tidak terdaftar")).toBeInTheDocument();
    expect(container.querySelector('img[src="http://x/c.png"]')).not.toBeNull();
    // hanya link tree milik sendiri yang punya tombol Hapus per kartu
    expect(screen.getAllByRole("button", { name: /^Hapus$/ })).toHaveLength(1);
  });

  it("mencari berdasarkan judul, deskripsi, dan nama penulis", async () => {
    mockApi({ "GET /link-trees": list(mine, other, anon) });
    renderWithProviders(HomePage, { profile: makeUser() });
    await screen.findByText("Kursus Ku");
    const search = screen.getByLabelText("Cari link tree");

    await fireEvent.input(search, { target: { value: "java" } });
    expect(screen.getByText("Kursus Ku")).toBeInTheDocument();
    expect(screen.queryByText("Milik Orang")).toBeNull();

    await fireEvent.input(search, { target: { value: "budi" } });
    expect(screen.getByText("Milik Orang")).toBeInTheDocument();
    expect(screen.queryByText("Kursus Ku")).toBeNull();

    await fireEvent.input(search, { target: { value: "tanpa penulis" } });
    expect(screen.getByText("Tanpa Penulis")).toBeInTheDocument();

    await fireEvent.input(search, { target: { value: "zzz" } });
    expect(screen.getByText("Tidak ada link tree yang cocok dengan pencarian.")).toBeInTheDocument();

    await fireEvent.input(search, { target: { value: "   " } });
    expect(screen.getByText("Kursus Ku")).toBeInTheDocument();
  });

  it("filter 'Hanya milikku' memuat ulang dengan is_me=1 dan bisa dimatikan", async () => {
    const fetchMock = mockApi({
      "GET /link-trees": list(mine, other),
      "GET /link-trees?is_me=1": list(mine),
    });
    renderWithProviders(HomePage, { profile: makeUser() });
    await screen.findByText("Milik Orang");
    await fireEvent.click(screen.getByLabelText("Hanya milikku"));
    await waitFor(() => expect(screen.queryByText("Milik Orang")).toBeNull());
    expect(countCalls(fetchMock, "GET", "/link-trees?is_me=1")).toBe(1);
    await fireEvent.click(screen.getByLabelText("Hanya milikku"));
    expect(await screen.findByText("Milik Orang")).toBeInTheDocument();
  });

  it("membuka detail saat kartu diklik", async () => {
    mockApi({ "GET /link-trees": list(mine) });
    renderWithProviders(HomePage, { profile: makeUser() });
    await fireEvent.click(await screen.findByRole("link", { name: "Kursus Ku" }));
    expect(window.location.pathname).toBe("/link-trees/1");
  });

  it("membuka detail saat gambar kartu diklik", async () => {
    mockApi({ "GET /link-trees": list(mine) });
    const { container } = renderWithProviders(HomePage, { profile: makeUser() });
    await screen.findByText("Kursus Ku");
    await fireEvent.click(container.querySelector('a[aria-hidden="true"]'));
    expect(window.location.pathname).toBe("/link-trees/1");
  });

  it("menghapus satu link tree lalu memuat ulang daftar", async () => {
    const fetchMock = mockApi({ "GET /link-trees": list(mine), "DELETE /link-trees/1": ok() });
    renderWithProviders(HomePage, { profile: makeUser() });
    await fireEvent.click(await screen.findByRole("button", { name: /^Hapus$/ }));
    await waitFor(() => expect(countCalls(fetchMock, "DELETE", "/link-trees/1")).toBe(1));
    await waitFor(() => expect(countCalls(fetchMock, "GET", "/link-trees")).toBe(2));
  });

  it("tidak menghapus bila konfirmasi ditolak", async () => {
    const fetchMock = mockApi({ "GET /link-trees": list(mine) });
    renderWithProviders(HomePage, { profile: makeUser() });
    const button = await screen.findByRole("button", { name: /^Hapus$/ });
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    await fireEvent.click(button);
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    expect(countCalls(fetchMock, "DELETE", "/link-trees/1")).toBe(0);
  });

  it("tidak memuat ulang daftar bila penghapusan gagal", async () => {
    const fetchMock = mockApi({ "GET /link-trees": list(mine), "DELETE /link-trees/1": fail() });
    renderWithProviders(HomePage, { profile: makeUser() });
    await fireEvent.click(await screen.findByRole("button", { name: /^Hapus$/ }));
    await waitFor(() => expect(countCalls(fetchMock, "DELETE", "/link-trees/1")).toBe(1));
    await waitFor(() => expect(screen.getByRole("button", { name: /^Hapus$/ })).toBeEnabled());
    expect(countCalls(fetchMock, "GET", "/link-trees")).toBe(1);
  });

  it("menghapus semua link tree milik sendiri", async () => {
    const fetchMock = mockApi({ "GET /link-trees": list(mine, other), "DELETE /link-trees": ok() });
    renderWithProviders(HomePage, { profile: makeUser() });
    await fireEvent.click(await screen.findByRole("button", { name: /Hapus Semua Milikku/ }));
    await waitFor(() => expect(countCalls(fetchMock, "DELETE", "/link-trees")).toBe(1));
    await waitFor(() => expect(countCalls(fetchMock, "GET", "/link-trees")).toBe(2));
  });

  it("hapus semua dibatalkan atau gagal", async () => {
    const routes = { "GET /link-trees": list(mine), "DELETE /link-trees": fail() };
    const fetchMock = mockApi(routes);
    renderWithProviders(HomePage, { profile: makeUser() });
    const button = await screen.findByRole("button", { name: /Hapus Semua Milikku/ });

    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    await fireEvent.click(button);
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    expect(countCalls(fetchMock, "DELETE", "/link-trees")).toBe(0);

    await fireEvent.click(button);
    await waitFor(() => expect(countCalls(fetchMock, "DELETE", "/link-trees")).toBe(1));
    await waitFor(() => expect(button).toBeEnabled());
    expect(countCalls(fetchMock, "GET", "/link-trees")).toBe(1);
  });

  it("tombol tambah membuka modal, lalu membuka detail link tree baru", async () => {
    mockApi({ "GET /link-trees": list(), "POST /link-trees": ok({ link_tree_id: 12 }) });
    renderWithProviders(HomePage, { profile: makeUser() });
    await screen.findByText("Belum ada link tree.");
    await fireEvent.click(screen.getByRole("button", { name: /Tambah/ }));
    const dialog = screen.getByRole("dialog", { name: "Tambah Link Tree" });
    await fireEvent.input(within(dialog).getByLabelText("Judul"), { target: { value: "Baru" } });
    await fireEvent.submit(dialog.querySelector("form"));
    await waitFor(() => expect(window.location.pathname).toBe("/link-trees/12"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("modal tambah dapat ditutup", async () => {
    mockApi({ "GET /link-trees": list() });
    renderWithProviders(HomePage, { profile: makeUser() });
    await fireEvent.click(await screen.findByRole("button", { name: /Tambah/ }));
    await fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("tanpa profil tidak ada tombol hapus pada kartu", async () => {
    mockApi({ "GET /link-trees": list(mine) });
    renderWithProviders(HomePage);
    await screen.findByText("Kursus Ku");
    expect(screen.queryByRole("button", { name: /^Hapus$/ })).toBeNull();
  });
});
