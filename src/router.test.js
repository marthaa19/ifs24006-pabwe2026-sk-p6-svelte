import { describe, it, expect, vi } from "vitest";
import { get } from "svelte/store";
import { currentPath, navigate, goto, resolveRoute, routes } from "./router.js";

describe("navigate", () => {
  it("push state dan memperbarui currentPath", () => {
    navigate("/users");
    expect(window.location.pathname).toBe("/users");
    expect(get(currentPath)).toBe("/users");
  });

  it("replace state bila diminta", () => {
    const spy = vi.spyOn(window.history, "replaceState");
    navigate("/profile", { replace: true });
    expect(spy).toHaveBeenCalled();
    expect(get(currentPath)).toBe("/profile");
    spy.mockRestore();
  });

  it("mengikuti event popstate", () => {
    window.history.pushState({}, "", "/auth/login");
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(get(currentPath)).toBe("/auth/login");
  });
});

describe("resolveRoute", () => {
  it("mengenali semua rute terdaftar", () => {
    expect(routes).toHaveLength(6);
    expect(resolveRoute("/auth/login")).toMatchObject({ name: "login", layout: "auth" });
    expect(resolveRoute("/auth/register")).toMatchObject({ name: "register", layout: "auth" });
    expect(resolveRoute("/")).toMatchObject({ name: "home", layout: "app" });
    expect(resolveRoute("/users")).toMatchObject({ name: "users", layout: "app" });
    expect(resolveRoute("/profile")).toMatchObject({ name: "profile", layout: "app" });
  });

  it("mengambil parameter rute dan men-decode-nya", () => {
    expect(resolveRoute("/link-trees/12")).toEqual({
      name: "linkTreeDetail",
      layout: "app",
      params: { linkTreeId: "12" },
    });
    expect(resolveRoute("/link-trees/a%20b").params.linkTreeId).toBe("a b");
  });

  it("menampilkan notFound untuk path yang tidak cocok", () => {
    expect(resolveRoute("/tidak/ada")).toEqual({ name: "notFound", layout: "none", params: {} });
    expect(resolveRoute("/link-trees")).toMatchObject({ name: "notFound" });
    expect(resolveRoute("/link-trees/1/lain")).toMatchObject({ name: "notFound" });
  });
});

describe("goto", () => {
  const event = (overrides = {}) => ({
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    button: 0,
    preventDefault: vi.fn(),
    ...overrides,
  });

  it("navigasi SPA pada klik biasa", () => {
    const e = event();
    goto(e, "/users");
    expect(e.preventDefault).toHaveBeenCalled();
    expect(get(currentPath)).toBe("/users");
  });

  it.each([
    ["meta", { metaKey: true }],
    ["ctrl", { ctrlKey: true }],
    ["shift", { shiftKey: true }],
    ["tombol non-kiri", { button: 1 }],
  ])("membiarkan perilaku bawaan browser untuk klik %s", (_, overrides) => {
    navigate("/");
    const e = event(overrides);
    goto(e, "/profile");
    expect(e.preventDefault).not.toHaveBeenCalled();
    expect(get(currentPath)).toBe("/");
  });
});
