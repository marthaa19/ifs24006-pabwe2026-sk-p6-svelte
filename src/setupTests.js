import "@testing-library/jest-dom";
import { afterEach, beforeEach, vi } from "vitest";
import Swal from "sweetalert2";

// Ikon lucide-svelte tidak perlu dirender di pengujian
vi.mock("lucide-svelte", () => {
  const Icon = () => {};
  return {
    ArrowLeft: Icon,
    ExternalLink: Icon,
    EyeOff: Icon,
    Globe: Icon,
    ImagePlus: Icon,
    Layers: Icon,
    Link: Icon,
    Link2: Icon,
    LogOut: Icon,
    Menu: Icon,
    Pencil: Icon,
    Plus: Icon,
    Search: Icon,
    Trash2: Icon,
    User: Icon,
    Users: Icon,
    X: Icon,
  };
});

// SweetAlert2 dimock: setiap dialog langsung "dikonfirmasi"
vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn() },
}));

// jsdom belum menyediakan URL.createObjectURL
URL.createObjectURL = vi.fn(() => "blob:pratinjau");

beforeEach(() => {
  Swal.fire.mockReset();
  Swal.fire.mockResolvedValue({ isConfirmed: true });
});

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});
