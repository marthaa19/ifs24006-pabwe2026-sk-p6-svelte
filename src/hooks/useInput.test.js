import { describe, it, expect } from "vitest";
import { get } from "svelte/store";
import { useInput } from "./useInput.js";

describe("useInput", () => {
  it("memakai nilai awal kosong secara bawaan", () => {
    const { value } = useInput();
    expect(get(value)).toBe("");
  });

  it("menyimpan nilai dan dapat direset ke nilai awal", () => {
    const { value, reset } = useInput("awal");
    value.set("baru");
    expect(get(value)).toBe("baru");
    reset();
    expect(get(value)).toBe("awal");
  });
});
