import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import AuthLayout from "./AuthLayout.svelte";
import { textSnippet } from "../../../test-utils.js";

describe("AuthLayout", () => {
  it("menampilkan identitas aplikasi dan isi halaman", () => {
    render(AuthLayout, { props: { children: textSnippet() } });
    expect(screen.getByRole("heading", { name: "Delcom Link Tree" })).toBeInTheDocument();
    expect(screen.getByText(/Kumpulkan semua tautan penting/)).toBeInTheDocument();
    expect(screen.getByText("isi layout")).toBeInTheDocument();
  });
});
