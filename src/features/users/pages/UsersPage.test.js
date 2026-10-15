import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/svelte";
import UsersPage from "./UsersPage.svelte";
import { renderWithProviders, mockApi, ok } from "../../../test-utils.js";

describe("UsersPage", () => {
  it("menampilkan status memuat", async () => {
    globalThis.fetch = () => new Promise(() => {});
    renderWithProviders(UsersPage);
    expect(await screen.findByText("Memuat pengguna...")).toBeInTheDocument();
  });

  it("menampilkan pesan bila belum ada pengguna", async () => {
    mockApi({ "GET /users": ok({ users: [] }) });
    renderWithProviders(UsersPage);
    expect(await screen.findByText("Belum ada pengguna.")).toBeInTheDocument();
  });

  it("menampilkan daftar pengguna dengan inisial nama", async () => {
    mockApi({
      "GET /users": ok({
        users: [
          { id: 1, name: "martha", email: "m@x.com" },
          { id: 2, email: "tanpa-nama@x.com" },
        ],
      }),
    });
    renderWithProviders(UsersPage);
    expect(await screen.findByText("m@x.com")).toBeInTheDocument();
    expect(screen.getByText("M")).toBeInTheDocument();
    expect(screen.getByText("tanpa-nama@x.com")).toBeInTheDocument();
  });
});
