import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import Modal from "./Modal.svelte";
import { textSnippet } from "../../../test-utils.js";

function setup() {
  const onclose = vi.fn();
  render(Modal, { props: { title: "Judul Modal", onclose, children: textSnippet("<p>konten</p>") } });
  return onclose;
}

describe("Modal", () => {
  it("menampilkan judul dan konten", () => {
    setup();
    expect(screen.getByRole("dialog", { name: "Judul Modal" })).toBeInTheDocument();
    expect(screen.getByText("konten")).toBeInTheDocument();
  });

  it("menutup lewat tombol tutup", async () => {
    const onclose = setup();
    await fireEvent.click(screen.getByRole("button", { name: "Tutup" }));
    expect(onclose).toHaveBeenCalledTimes(1);
  });

  it("menutup saat latar belakang diklik, tetapi tidak saat isi modal diklik", async () => {
    const onclose = setup();
    await fireEvent.click(screen.getByText("konten"));
    expect(onclose).not.toHaveBeenCalled();
    await fireEvent.click(screen.getByRole("presentation"));
    expect(onclose).toHaveBeenCalledTimes(1);
  });

  it("menutup dengan tombol Escape, mengabaikan tombol lain", async () => {
    const onclose = setup();
    await fireEvent.keyDown(window, { key: "Enter" });
    expect(onclose).not.toHaveBeenCalled();
    await fireEvent.keyDown(window, { key: "Escape" });
    expect(onclose).toHaveBeenCalledTimes(1);
  });
});
