import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import Swal from "sweetalert2";
import Navbar from "./Navbar.svelte";
import { authToken } from "../../auth/states/authStore.js";
import { renderWithProviders, makeUser } from "../../../test-utils.js";

describe("Navbar", () => {
  it("menampilkan merek dan tautan ke beranda", async () => {
    renderWithProviders(Navbar, { props: { onmenu: vi.fn() } });
    const brand = screen.getByRole("link", { name: /Delcom Link Tree/ });
    await fireEvent.click(brand);
    expect(window.location.pathname).toBe("/");
  });

  it("menampilkan nama dan foto pengguna, tautan ke profil", async () => {
    const { container } = renderWithProviders(Navbar, {
      props: { onmenu: vi.fn() },
      profile: makeUser(),
    });
    expect(screen.getByText("Martha")).toBeInTheDocument();
    expect(container.querySelector("img")).toHaveAttribute("src", "http://x/martha.png");
    await fireEvent.click(screen.getByRole("link", { name: /Martha/ }));
    expect(window.location.pathname).toBe("/profile");
  });

  it("tanpa profil tidak menampilkan blok pengguna; tanpa foto tidak ada gambar", () => {
    const { container, unmount } = renderWithProviders(Navbar, { props: { onmenu: vi.fn() } });
    expect(screen.queryByRole("link", { name: /Martha/ })).toBeNull();
    unmount();
    const second = renderWithProviders(Navbar, {
      props: { onmenu: vi.fn() },
      profile: makeUser({ photo: null }),
    });
    expect(second.container.querySelector("img")).toBeNull();
    expect(container).toBeTruthy();
  });

  it("tombol menu memanggil onmenu dan labelnya mengikuti sidebarOpen", async () => {
    const onmenu = vi.fn();
    const { unmount } = renderWithProviders(Navbar, { props: { onmenu } });
    const open = screen.getByRole("button", { name: "Buka menu" });
    await fireEvent.click(open);
    expect(onmenu).toHaveBeenCalledTimes(1);
    unmount();
    renderWithProviders(Navbar, { props: { onmenu, sidebarOpen: true } });
    expect(screen.getByRole("button", { name: "Tutup menu" })).toBeInTheDocument();
  });

  it("logout setelah dikonfirmasi", async () => {
    renderWithProviders(Navbar, { props: { onmenu: vi.fn() } });
    await fireEvent.click(screen.getByRole("button", { name: /Keluar/ }));
    await waitFor(() => expect(get(authToken)).toBeNull());
  });

  it("logout dibatalkan bila konfirmasi ditolak", async () => {
    renderWithProviders(Navbar, { props: { onmenu: vi.fn() } });
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    await fireEvent.click(screen.getByRole("button", { name: /Keluar/ }));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    expect(get(authToken)).toBe("token-uji");
  });
});
