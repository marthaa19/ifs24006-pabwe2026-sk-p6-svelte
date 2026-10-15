import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import Swal from "sweetalert2";
import ChangeCoverModal from "./ChangeCoverModal.svelte";
import { renderWithProviders, mockApi, ok, fail, makeLinkTree, countCalls } from "../../../test-utils.js";

const submit = () => fireEvent.submit(screen.getByRole("dialog").querySelector("form"));
const pick = (files) =>
  fireEvent.change(screen.getByLabelText("Gambar sampul"), { target: { files } });

describe("ChangeCoverModal", () => {
  it("tanpa sampul dan tanpa file tidak menampilkan pratinjau", () => {
    renderWithProviders(ChangeCoverModal, { props: { linkTree: makeLinkTree(), onclose: vi.fn() } });
    expect(screen.queryByAltText("Pratinjau sampul")).toBeNull();
  });

  it("menampilkan sampul saat ini bila sudah ada", () => {
    renderWithProviders(ChangeCoverModal, {
      props: { linkTree: makeLinkTree({ cover: "http://x/cover.png" }), onclose: vi.fn() },
    });
    expect(screen.getByAltText("Pratinjau sampul")).toHaveAttribute("src", "http://x/cover.png");
  });

  it("menampilkan pratinjau file yang dipilih, dan kembali bila pilihan dikosongkan", async () => {
    renderWithProviders(ChangeCoverModal, { props: { linkTree: makeLinkTree(), onclose: vi.fn() } });
    await pick([new File(["x"], "baru.png", { type: "image/png" })]);
    expect(screen.getByAltText("Pratinjau sampul")).toHaveAttribute("src", "blob:pratinjau");
    await pick([]);
    expect(screen.queryByAltText("Pratinjau sampul")).toBeNull();
  });

  it("memperingatkan bila belum memilih gambar", async () => {
    const fetchMock = mockApi();
    renderWithProviders(ChangeCoverModal, { props: { linkTree: makeLinkTree(), onclose: vi.fn() } });
    await submit();
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "warning" }))
    );
    expect(countCalls(fetchMock, "POST", "/link-trees/1/cover")).toBe(0);
  });

  it("mengunggah gambar lalu menutup modal", async () => {
    const onclose = vi.fn();
    const fetchMock = mockApi({
      "POST /link-trees/1/cover": ok(undefined, "Berhasil mengubah cover"),
      "GET /link-trees/1": ok({ link_tree: makeLinkTree() }),
    });
    renderWithProviders(ChangeCoverModal, { props: { linkTree: makeLinkTree(), onclose } });
    await pick([new File(["x"], "baru.png", { type: "image/png" })]);
    await submit();
    await waitFor(() => expect(onclose).toHaveBeenCalled());
    expect(countCalls(fetchMock, "POST", "/link-trees/1/cover")).toBe(1);
  });

  it("tetap terbuka bila unggahan gagal", async () => {
    const onclose = vi.fn();
    mockApi({ "POST /link-trees/1/cover": fail() });
    renderWithProviders(ChangeCoverModal, { props: { linkTree: makeLinkTree(), onclose } });
    await pick([new File(["x"], "baru.png", { type: "image/png" })]);
    await submit();
    await waitFor(() => expect(screen.getByRole("button", { name: "Unggah" })).toBeEnabled());
    expect(onclose).not.toHaveBeenCalled();
  });

  it("tombol Batal menutup modal", async () => {
    const onclose = vi.fn();
    renderWithProviders(ChangeCoverModal, { props: { linkTree: makeLinkTree(), onclose } });
    await fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(onclose).toHaveBeenCalled();
  });
});
