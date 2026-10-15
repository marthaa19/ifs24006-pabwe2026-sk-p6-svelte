import { describe, it, expect, vi } from "vitest";
import { fetchApi } from "../../../helpers/apiHelper.js";
import { postLogin, postRegister } from "./authApi.js";

vi.mock("../../../helpers/apiHelper.js", () => ({ fetchApi: vi.fn(() => Promise.resolve("res")) }));

describe("authApi", () => {
  it("postLogin", async () => {
    expect(await postLogin({ email: "a@b.c", password: "123456" })).toBe("res");
    expect(fetchApi).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: { email: "a@b.c", password: "123456" },
    });
  });

  it("postRegister", async () => {
    await postRegister({ name: "A", email: "a@b.c", password: "123456" });
    expect(fetchApi).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: { name: "A", email: "a@b.c", password: "123456" },
    });
  });
});
