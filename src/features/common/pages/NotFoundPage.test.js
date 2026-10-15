import { describe, it, expect } from "vitest";
import { screen, fireEvent } from "@testing-library/svelte";
import NotFoundPage from "./NotFoundPage.svelte";
import { renderWithProviders } from "../../../test-utils.js";

describe("NotFoundPage", () => {
  it("menampilkan 404 dan kembali ke beranda", async () => {
    renderWithProviders(NotFoundPage, { path: "/entah" });
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Halaman tidak ditemukan" })).toBeInTheDocument();
    await fireEvent.click(screen.getByRole("button", { name: "Kembali ke beranda" }));
    expect(window.location.pathname).toBe("/");
  });
});
