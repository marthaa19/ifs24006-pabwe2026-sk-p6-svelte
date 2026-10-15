import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import AddModal from "./AddModal.svelte";
import { renderWithProviders, mockApi, ok, fail } from "../../../test-utils.js";

async function fillAndSubmit() {
  await fireEvent.input(screen.getByLabelText("Judul"), { target: { value: "Kursus Ku" } });
  await fireEvent.change(screen.getByLabelText("Tipe"), { target: { value: "private" } });
  await fireEvent.input(screen.getByLabelText("Deskripsi"), { target: { value: "Deskripsi" } });
  await fireEvent.submit(screen.getByRole("dialog").querySelector("form"));
}

describe("AddModal", () => {
  it("mengirim data, menutup modal, dan memanggil onsaved dengan id baru", async () => {
    const onclose = vi.fn();
    const onsaved = vi.fn();
    const fetchMock = mockApi({ "POST /link-trees": ok({ link_tree_id: 12 }, "Berhasil menambahkan data") });
    renderWithProviders(AddModal, { props: { onclose, onsaved } });
    await fillAndSubmit();
    await waitFor(() => expect(onsaved).toHaveBeenCalledWith(12));
    expect(onclose).toHaveBeenCalled();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      title: "Kursus Ku",
      type: "private",
      description: "Deskripsi",
    });
  });

  it("berhasil tanpa onsaved", async () => {
    const onclose = vi.fn();
    mockApi({ "POST /link-trees": ok({ link_tree_id: 3 }) });
    renderWithProviders(AddModal, { props: { onclose } });
    await fillAndSubmit();
    await waitFor(() => expect(onclose).toHaveBeenCalled());
  });

  it("tetap terbuka bila server menolak data", async () => {
    const onclose = vi.fn();
    const onsaved = vi.fn();
    mockApi({ "POST /link-trees": fail("Data tidak valid", { title: ["Judul wajib"] }) });
    renderWithProviders(AddModal, { props: { onclose, onsaved } });
    await fillAndSubmit();
    await waitFor(() => expect(screen.getByRole("button", { name: "Simpan" })).toBeEnabled());
    expect(onclose).not.toHaveBeenCalled();
    expect(onsaved).not.toHaveBeenCalled();
  });

  it("tombol Batal menutup modal", async () => {
    const onclose = vi.fn();
    renderWithProviders(AddModal, { props: { onclose } });
    await fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(onclose).toHaveBeenCalled();
  });
});
