import { describe, it, expect } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import ProfilePage from "./ProfilePage.svelte";
import { renderWithProviders, mockApi, ok, fail, makeUser, countCalls } from "../../../test-utils.js";

const form = (heading) => screen.getByRole("heading", { name: heading }).closest("form");

describe("ProfilePage", () => {
  it("memuat profil dan mengisi form serta foto", async () => {
    mockApi({ "GET /users/me": ok({ user: makeUser() }) });
    renderWithProviders(ProfilePage);
    await waitFor(() => expect(screen.getByLabelText("Nama")).toHaveValue("Martha"));
    expect(screen.getByLabelText("Email")).toHaveValue("martha@example.com");
    expect(screen.getByAltText("Foto profil")).toHaveAttribute("src", "http://x/martha.png");
  });

  it("tanpa foto tidak menampilkan gambar", async () => {
    mockApi({ "GET /users/me": ok({ user: makeUser({ photo: null }) }) });
    renderWithProviders(ProfilePage);
    await waitFor(() => expect(screen.getByLabelText("Nama")).toHaveValue("Martha"));
    expect(screen.queryByAltText("Foto profil")).toBeNull();
  });

  it("form tetap kosong bila profil gagal dimuat", async () => {
    mockApi({ "GET /users/me": fail("Unauthenticated.") });
    renderWithProviders(ProfilePage);
    await waitFor(() => expect(screen.getByLabelText("Nama")).toHaveValue(""));
  });

  it("menyimpan perubahan data", async () => {
    const fetchMock = mockApi({
      "GET /users/me": ok({ user: makeUser() }),
      "PUT /users/me": ok(undefined, "Profil diubah"),
    });
    renderWithProviders(ProfilePage);
    await waitFor(() => expect(screen.getByLabelText("Nama")).toHaveValue("Martha"));
    await fireEvent.input(screen.getByLabelText("Nama"), { target: { value: "Martha S" } });
    await fireEvent.submit(form("Ubah Data"));
    await waitFor(() => expect(countCalls(fetchMock, "PUT", "/users/me")).toBe(1));
    const put = fetchMock.mock.calls.find(([, o]) => o?.method === "PUT");
    expect(JSON.parse(put[1].body)).toEqual({ name: "Martha S", email: "martha@example.com" });
  });

  it("mengunggah foto hanya bila file dipilih", async () => {
    const fetchMock = mockApi({ "GET /users/me": ok({ user: makeUser() }) });
    const { container } = renderWithProviders(ProfilePage);
    await waitFor(() => expect(screen.getByLabelText("Nama")).toHaveValue("Martha"));
    const input = container.querySelector('input[type="file"]');

    await fireEvent.submit(form("Ubah Foto"));
    expect(countCalls(fetchMock, "POST", "/users/me/photo")).toBe(0);

    await fireEvent.change(input, { target: { files: [] } });
    await fireEvent.submit(form("Ubah Foto"));
    expect(countCalls(fetchMock, "POST", "/users/me/photo")).toBe(0);

    await fireEvent.change(input, { target: { files: [new File(["x"], "f.png", { type: "image/png" })] } });
    await fireEvent.submit(form("Ubah Foto"));
    await waitFor(() => expect(countCalls(fetchMock, "POST", "/users/me/photo")).toBe(1));
  });

  it("ubah kata sandi berhasil mengosongkan form", async () => {
    mockApi({ "GET /users/me": ok({ user: makeUser() }), "PUT /users/me/password": ok() });
    renderWithProviders(ProfilePage);
    await fireEvent.input(screen.getByLabelText("Kata sandi lama"), { target: { value: "lama" } });
    await fireEvent.input(screen.getByLabelText("Kata sandi baru"), { target: { value: "baru" } });
    await fireEvent.submit(form("Ubah Kata Sandi"));
    await waitFor(() => expect(screen.getByLabelText("Kata sandi lama")).toHaveValue(""));
    expect(screen.getByLabelText("Kata sandi baru")).toHaveValue("");
  });

  it("ubah kata sandi gagal mempertahankan isian", async () => {
    const fetchMock = mockApi({
      "GET /users/me": ok({ user: makeUser() }),
      "PUT /users/me/password": fail("Kata sandi lama salah"),
    });
    renderWithProviders(ProfilePage);
    await fireEvent.input(screen.getByLabelText("Kata sandi lama"), { target: { value: "salah" } });
    await fireEvent.input(screen.getByLabelText("Kata sandi baru"), { target: { value: "baru" } });
    await fireEvent.submit(form("Ubah Kata Sandi"));
    await waitFor(() => expect(countCalls(fetchMock, "PUT", "/users/me/password")).toBe(1));
    await waitFor(() => expect(screen.getByLabelText("Kata sandi lama")).toHaveValue("salah"));
  });
});
