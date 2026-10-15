import { describe, it, expect, vi } from "vitest";
import { fetchApi } from "../../../helpers/apiHelper.js";
import { getUsers, getMe, putMe, postPhoto, putPassword } from "./userApi.js";

vi.mock("../../../helpers/apiHelper.js", () => ({ fetchApi: vi.fn(() => Promise.resolve("res")) }));

describe("userApi", () => {
  it("getUsers dan getMe", async () => {
    await getUsers();
    expect(fetchApi).toHaveBeenCalledWith("/users");
    await getMe();
    expect(fetchApi).toHaveBeenCalledWith("/users/me");
  });

  it("putMe", async () => {
    await putMe({ name: "A", email: "a@b.c" });
    expect(fetchApi).toHaveBeenCalledWith("/users/me", {
      method: "PUT",
      body: { name: "A", email: "a@b.c" },
    });
  });

  it("postPhoto mengirim FormData", async () => {
    const file = new File(["x"], "foto.png", { type: "image/png" });
    await postPhoto(file);
    const [path, options] = fetchApi.mock.calls.at(-1);
    expect(path).toBe("/users/me/photo");
    expect(options.method).toBe("POST");
    expect(options.body.get("photo")).toBe(file);
  });

  it("putPassword", async () => {
    await putPassword({ password: "lama", new_password: "baru" });
    expect(fetchApi).toHaveBeenCalledWith("/users/me/password", {
      method: "PUT",
      body: { password: "lama", new_password: "baru" },
    });
  });
});
