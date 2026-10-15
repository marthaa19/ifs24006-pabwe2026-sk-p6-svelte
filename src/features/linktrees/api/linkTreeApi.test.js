import { describe, it, expect, vi } from "vitest";
import { fetchApi } from "../../../helpers/apiHelper.js";
import * as api from "./linkTreeApi.js";

vi.mock("../../../helpers/apiHelper.js", () => ({ fetchApi: vi.fn(() => Promise.resolve("res")) }));

const data = { title: "J", type: "public", description: "D" };

describe("linkTreeApi", () => {
  it("getLinkTrees tanpa dan dengan filter milik sendiri", async () => {
    await api.getLinkTrees();
    expect(fetchApi).toHaveBeenLastCalledWith("/link-trees");
    await api.getLinkTrees({ isMe: true });
    expect(fetchApi).toHaveBeenLastCalledWith("/link-trees?is_me=1");
  });

  it("getLinkTreeById", async () => {
    await api.getLinkTreeById(3);
    expect(fetchApi).toHaveBeenLastCalledWith("/link-trees/3");
  });

  it("postLinkTree dan putLinkTree hanya mengirim field yang dibutuhkan", async () => {
    await api.postLinkTree({ ...data, ekstra: 1 });
    expect(fetchApi).toHaveBeenLastCalledWith("/link-trees", { method: "POST", body: data });
    await api.putLinkTree(3, { ...data, ekstra: 1 });
    expect(fetchApi).toHaveBeenLastCalledWith("/link-trees/3", { method: "PUT", body: data });
  });

  it("postLinkTreeCover mengirim FormData berisi cover", async () => {
    const file = new File(["x"], "c.png", { type: "image/png" });
    await api.postLinkTreeCover(3, file);
    const [path, options] = fetchApi.mock.calls.at(-1);
    expect(path).toBe("/link-trees/3/cover");
    expect(options.method).toBe("POST");
    expect(options.body.get("cover")).toBe(file);
  });

  it("deleteLinkTree dan deleteAllLinkTrees", async () => {
    await api.deleteLinkTree(3);
    expect(fetchApi).toHaveBeenLastCalledWith("/link-trees/3", { method: "DELETE" });
    await api.deleteAllLinkTrees();
    expect(fetchApi).toHaveBeenLastCalledWith("/link-trees", { method: "DELETE" });
  });

  it("operasi item tautan", async () => {
    const item = { title: "T", url: "https://x.id" };
    await api.postItem(3, { ...item, ekstra: 1 });
    expect(fetchApi).toHaveBeenLastCalledWith("/link-trees/3/items", { method: "POST", body: item });
    await api.putItem(3, 9, item);
    expect(fetchApi).toHaveBeenLastCalledWith("/link-trees/3/items/9", { method: "PUT", body: item });
    await api.deleteItem(3, 9);
    expect(fetchApi).toHaveBeenLastCalledWith("/link-trees/3/items/9", { method: "DELETE" });
  });
});
