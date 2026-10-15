import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/svelte";
import Sidebar from "./Sidebar.svelte";
import { renderWithProviders } from "../../../test-utils.js";

describe("Sidebar", () => {
  it("menampilkan tiga menu utama", () => {
    renderWithProviders(Sidebar);
    expect(screen.getByRole("link", { name: /Link Tree/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Pengguna/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Profil/ })).toBeInTheDocument();
  });

  it("tersembunyi di layar kecil bila open = false dan tampil bila open = true", () => {
    const { container, unmount } = renderWithProviders(Sidebar);
    expect(container.querySelector("aside")).toHaveClass("hidden");
    unmount();
    const second = renderWithProviders(Sidebar, { props: { open: true } });
    expect(second.container.querySelector("aside")).not.toHaveClass("hidden");
  });

  it.each([
    ["/", /Link Tree/],
    ["/link-trees/3", /Link Tree/],
    ["/users", /Pengguna/],
    ["/profile", /Profil/],
  ])("menandai menu aktif untuk path %s", (path, name) => {
    renderWithProviders(Sidebar, { path });
    const active = screen.getAllByRole("link").filter((a) => a.getAttribute("aria-current") === "page");
    expect(active).toHaveLength(1);
    expect(active[0]).toHaveAccessibleName(name);
  });

  it("berpindah halaman dan memanggil onnavigate", async () => {
    const onnavigate = vi.fn();
    renderWithProviders(Sidebar, { props: { onnavigate } });
    await fireEvent.click(screen.getByRole("link", { name: /Pengguna/ }));
    expect(window.location.pathname).toBe("/users");
    expect(onnavigate).toHaveBeenCalledTimes(1);
  });

  it("berpindah halaman tanpa onnavigate", async () => {
    renderWithProviders(Sidebar);
    await fireEvent.click(screen.getByRole("link", { name: /Profil/ }));
    expect(window.location.pathname).toBe("/profile");
  });
});
