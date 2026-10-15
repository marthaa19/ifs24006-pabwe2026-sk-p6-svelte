import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";
import Swal from "sweetalert2";
import * as api from "../api/linkTreeApi.js";
import * as store from "./linkTreesStore.js";

vi.mock("../api/linkTreeApi.js", () => ({
  getLinkTrees: vi.fn(),
  getLinkTreeById: vi.fn(),
  postLinkTree: vi.fn(),
  putLinkTree: vi.fn(),
  postLinkTreeCover: vi.fn(),
  deleteLinkTree: vi.fn(),
  deleteAllLinkTrees: vi.fn(),
  postItem: vi.fn(),
  putItem: vi.fn(),
  deleteItem: vi.fn(),
}));

const detail = { id: 1, title: "Kursus", items: [] };

beforeEach(() => {
  Object.values(api).forEach((fn) => fn.mockReset());
  store.linkTrees.set([]);
  store.linkTree.set(null);
});

describe("loadLinkTrees", () => {
  it("mengisi koleksi dan meneruskan filter isMe", async () => {
    api.getLinkTrees.mockResolvedValue({ data: { link_trees: [detail] } });
    await store.loadLinkTrees({ isMe: true });
    expect(api.getLinkTrees).toHaveBeenCalledWith({ isMe: true });
    expect(get(store.linkTrees)).toEqual([detail]);
    expect(get(store.isLinkTreesLoading)).toBe(false);
  });

  it("memakai argumen bawaan", async () => {
    api.getLinkTrees.mockResolvedValue({ data: { link_trees: [] } });
    await store.loadLinkTrees();
    expect(api.getLinkTrees).toHaveBeenCalledWith({ isMe: false });
  });

  it("gagal menampilkan dialog error", async () => {
    api.getLinkTrees.mockRejectedValue(new Error("Gagal"));
    await store.loadLinkTrees();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Gagal" }));
    expect(get(store.isLinkTreesLoading)).toBe(false);
  });
});

describe("loadLinkTree", () => {
  it("mengosongkan detail lama lalu mengisi yang baru", async () => {
    store.linkTree.set({ id: 99 });
    api.getLinkTreeById.mockImplementation(async () => {
      expect(get(store.linkTree)).toBeNull();
      expect(get(store.isLinkTreeLoading)).toBe(true);
      return { data: { link_tree: detail } };
    });
    await store.loadLinkTree(1);
    expect(get(store.linkTree)).toEqual(detail);
    expect(get(store.isLinkTreeLoading)).toBe(false);
  });

  it("mode silent tidak mengosongkan detail dan tidak mengubah status loading", async () => {
    store.linkTree.set({ id: 99 });
    api.getLinkTreeById.mockImplementation(async () => {
      expect(get(store.linkTree)).toEqual({ id: 99 });
      expect(get(store.isLinkTreeLoading)).toBe(false);
      return { data: { link_tree: detail } };
    });
    await store.loadLinkTree(1, { silent: true });
    expect(get(store.linkTree)).toEqual(detail);
  });

  it("gagal menampilkan dialog error", async () => {
    api.getLinkTreeById.mockRejectedValue(new Error("Tidak ditemukan"));
    await store.loadLinkTree(1);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: "Tidak ditemukan" }));
    expect(get(store.isLinkTreeLoading)).toBe(false);
  });
});

describe("mutasi", () => {
  beforeEach(() => {
    api.getLinkTreeById.mockResolvedValue({ data: { link_tree: detail } });
  });

  it("addLinkTree mengembalikan id baru", async () => {
    api.postLinkTree.mockResolvedValue({ message: "Berhasil menambahkan data", data: { link_tree_id: 12 } });
    expect(await store.addLinkTree({ title: "A" })).toBe(12);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: "Berhasil menambahkan data" }));
    expect(get(store.isSaving)).toBe(false);
  });

  it("addLinkTree gagal mengembalikan null", async () => {
    api.postLinkTree.mockRejectedValue(new Error("Data tidak valid"));
    expect(await store.addLinkTree({ title: "" })).toBeNull();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Data tidak valid" }));
    expect(get(store.isSaving)).toBe(false);
  });

  it("memakai pesan bawaan bila server tidak mengirim pesan", async () => {
    api.postLinkTree.mockResolvedValue({ data: { link_tree_id: 1 } });
    await store.addLinkTree({ title: "A" });
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: "Berhasil menambahkan data" }));
  });

  it("isSaving bernilai true selama aksi berjalan", async () => {
    api.postLinkTree.mockImplementation(async () => {
      expect(get(store.isSaving)).toBe(true);
      return { data: { link_tree_id: 1 } };
    });
    await store.addLinkTree({ title: "A" });
  });

  it.each([
    ["changeLinkTree", () => store.changeLinkTree(1, { title: "B" }), "putLinkTree"],
    ["changeCover", () => store.changeCover(1, new File(["x"], "c.png")), "postLinkTreeCover"],
    ["addItem", () => store.addItem(1, { title: "T", url: "https://x.id" }), "postItem"],
    ["changeItem", () => store.changeItem(1, 5, { title: "T", url: "https://x.id" }), "putItem"],
    ["removeItem", () => store.removeItem(1, 5), "deleteItem"],
  ])("%s berhasil memuat ulang detail secara silent", async (_, run, apiName) => {
    api[apiName].mockResolvedValue({ message: "OK" });
    store.linkTree.set({ id: 1, lama: true });
    expect(await run()).toBe(true);
    expect(api.getLinkTreeById).toHaveBeenCalledWith(1);
    expect(get(store.linkTree)).toEqual(detail);
  });

  it.each([
    ["changeLinkTree", () => store.changeLinkTree(1, { title: "B" }), "putLinkTree"],
    ["changeCover", () => store.changeCover(1, new File(["x"], "c.png")), "postLinkTreeCover"],
    ["addItem", () => store.addItem(1, { title: "T", url: "x" }), "postItem"],
    ["changeItem", () => store.changeItem(1, 5, { title: "T", url: "x" }), "putItem"],
    ["removeItem", () => store.removeItem(1, 5), "deleteItem"],
    ["removeLinkTree", () => store.removeLinkTree(1), "deleteLinkTree"],
    ["removeAllLinkTrees", () => store.removeAllLinkTrees(), "deleteAllLinkTrees"],
  ])("%s gagal mengembalikan false tanpa memuat ulang", async (_, run, apiName) => {
    api[apiName].mockRejectedValue(new Error("Gagal"));
    expect(await run()).toBe(false);
    expect(api.getLinkTreeById).not.toHaveBeenCalled();
  });

  it("removeLinkTree dan removeAllLinkTrees berhasil", async () => {
    api.deleteLinkTree.mockResolvedValue({ message: "Terhapus" });
    api.deleteAllLinkTrees.mockResolvedValue({});
    expect(await store.removeLinkTree(1)).toBe(true);
    expect(await store.removeAllLinkTrees()).toBe(true);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: "Berhasil menghapus semua data" }));
  });
});
