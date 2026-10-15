import { describe, it, expect } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import LinkTreeLayout from "./LinkTreeLayout.svelte";
import { renderWithProviders, textSnippet, mockApi, ok, makeUser, countCalls } from "../../../test-utils.js";

describe("LinkTreeLayout", () => {
  it("memuat profil dan menampilkan navbar, sidebar, serta isi halaman", async () => {
    const fetchMock = mockApi({ "GET /users/me": ok({ user: makeUser() }) });
    renderWithProviders(LinkTreeLayout, { props: { children: textSnippet() } });
    expect(screen.getByText("isi layout")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Menu utama" })).toBeInTheDocument();
    expect(await screen.findByText("Martha")).toBeInTheDocument();
    expect(countCalls(fetchMock, "GET", "/users/me")).toBe(1);
  });

  it("tombol menu membuka dan menutup sidebar; memilih menu menutupnya", async () => {
    mockApi({ "GET /users/me": ok({ user: makeUser() }) });
    const { container } = renderWithProviders(LinkTreeLayout, { props: { children: textSnippet() } });
    const aside = container.querySelector("aside");
    expect(aside).toHaveClass("hidden");

    await fireEvent.click(screen.getByRole("button", { name: "Buka menu" }));
    expect(aside).not.toHaveClass("hidden");

    await fireEvent.click(screen.getByRole("link", { name: /Pengguna/ }));
    await waitFor(() => expect(aside).toHaveClass("hidden"));
    expect(window.location.pathname).toBe("/users");
  });
});
