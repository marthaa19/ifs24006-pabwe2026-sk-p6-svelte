import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import ItemModal from "./ItemModal.svelte";
import { renderWithProviders, mockApi, ok, fail, makeLinkTree, makeItem } from "../../../test-utils.js";

const submit = () => fireEvent.submit(screen.getByRole("dialog").querySelector("form"));
const detail = ok({ link_tree: makeLinkTree() });

describe("ItemModal", () => {
  it("mode tambah: form kosong dan mengirim POST", async () => {
    const onclose = vi.fn();
    const fetchMock = mockApi({ "POST /link-trees/1/items": ok({ item_id: 1 }), "GET /link-trees/1": detail });
    renderWithProviders(ItemModal, { props: { linkTreeId: 1, onclose } });
    expect(screen.getByRole("dialog", { name: "Tambah Tautan" })).toBeInTheDocument();
    expect(screen.getByLabelText("Judul")).toHaveValue("");
    await fireEvent.input(screen.getByLabelText("Judul"), { target: { value: "Dasar Java" } });
    await fireEvent.input(screen.getByLabelText("URL"), { target: { value: "https://delcom.org" } });
    await submit();
    await waitFor(() => expect(onclose).toHaveBeenCalled());
    const post = fetchMock.mock.calls.find(([, o]) => o?.method === "POST");
    expect(JSON.parse(post[1].body)).toEqual({ title: "Dasar Java", url: "https://delcom.org" });
  });

  it("mode ubah: form terisi dan mengirim PUT", async () => {
    const onclose = vi.fn();
    const fetchMock = mockApi({ "PUT /link-trees/1/items/5": ok(), "GET /link-trees/1": detail });
    renderWithProviders(ItemModal, { props: { linkTreeId: 1, item: makeItem(), onclose } });
    expect(screen.getByRole("dialog", { name: "Ubah Tautan" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText("Judul")).toHaveValue("Dasar Java"));
    expect(screen.getByLabelText("URL")).toHaveValue("https://youtu.be/abc");
    await submit();
    await waitFor(() => expect(onclose).toHaveBeenCalled());
    expect(fetchMock.mock.calls.some(([, o]) => o?.method === "PUT")).toBe(true);
  });

  it("mode ubah dengan field kosong memakai string kosong", async () => {
    renderWithProviders(ItemModal, {
      props: { linkTreeId: 1, item: { id: 5 }, onclose: vi.fn() },
    });
    await waitFor(() => expect(screen.getByLabelText("URL")).toHaveValue(""));
    expect(screen.getByLabelText("Judul")).toHaveValue("");
  });

  it("tetap terbuka bila gagal", async () => {
    const onclose = vi.fn();
    mockApi({ "POST /link-trees/1/items": fail("Data tidak valid", { url: ["URL tidak valid"] }) });
    renderWithProviders(ItemModal, { props: { linkTreeId: 1, onclose } });
    await submit();
    await waitFor(() => expect(screen.getByRole("button", { name: "Simpan" })).toBeEnabled());
    expect(onclose).not.toHaveBeenCalled();
  });

  it("tombol Batal menutup modal", async () => {
    const onclose = vi.fn();
    renderWithProviders(ItemModal, { props: { linkTreeId: 1, onclose } });
    await fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(onclose).toHaveBeenCalled();
  });
});
