import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import ChangeModal from "./ChangeModal.svelte";
import { renderWithProviders, mockApi, ok, fail, makeLinkTree } from "../../../test-utils.js";

const submit = () => fireEvent.submit(screen.getByRole("dialog").querySelector("form"));

describe("ChangeModal", () => {
  it("mengisi form dengan data saat ini", async () => {
    renderWithProviders(ChangeModal, {
      props: { linkTree: makeLinkTree({ type: "unlisted" }), onclose: vi.fn() },
    });
    await waitFor(() => expect(screen.getByLabelText("Judul")).toHaveValue("Kursus Ku"));
    expect(screen.getByLabelText("Tipe")).toHaveValue("unlisted");
    expect(screen.getByLabelText("Deskripsi")).toHaveValue("Kumpulan kursus ku");
  });

  it("memakai nilai bawaan bila data kosong", async () => {
    renderWithProviders(ChangeModal, {
      props: { linkTree: { id: 1 }, onclose: vi.fn() },
    });
    await waitFor(() => expect(screen.getByLabelText("Tipe")).toHaveValue("public"));
    expect(screen.getByLabelText("Judul")).toHaveValue("");
    expect(screen.getByLabelText("Deskripsi")).toHaveValue("");
  });

  it("menyimpan perubahan lalu menutup modal", async () => {
    const onclose = vi.fn();
    const fetchMock = mockApi({
      "PUT /link-trees/1": ok(undefined, "Berhasil mengubah data"),
      "GET /link-trees/1": ok({ link_tree: makeLinkTree() }),
    });
    renderWithProviders(ChangeModal, { props: { linkTree: makeLinkTree(), onclose } });
    await waitFor(() => expect(screen.getByLabelText("Judul")).toHaveValue("Kursus Ku"));
    await fireEvent.input(screen.getByLabelText("Judul"), { target: { value: "Judul Baru" } });
    await submit();
    await waitFor(() => expect(onclose).toHaveBeenCalled());
    const put = fetchMock.mock.calls.find(([, o]) => o?.method === "PUT");
    expect(JSON.parse(put[1].body).title).toBe("Judul Baru");
  });

  it("tetap terbuka bila gagal", async () => {
    const onclose = vi.fn();
    mockApi({ "PUT /link-trees/1": fail() });
    renderWithProviders(ChangeModal, { props: { linkTree: makeLinkTree(), onclose } });
    await submit();
    await waitFor(() => expect(screen.getByRole("button", { name: "Simpan" })).toBeEnabled());
    expect(onclose).not.toHaveBeenCalled();
  });

  it("tombol Batal menutup modal", async () => {
    const onclose = vi.fn();
    renderWithProviders(ChangeModal, { props: { linkTree: makeLinkTree(), onclose } });
    await fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(onclose).toHaveBeenCalled();
  });
});
