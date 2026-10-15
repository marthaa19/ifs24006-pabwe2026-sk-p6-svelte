/* global DELCOM_BASEURL */
import { render } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { vi } from "vitest";
import { authToken } from "./features/auth/states/authStore.js";
import { profile, users, isUserLoading } from "./features/users/states/userStore.js";
import {
  linkTrees,
  linkTree,
  isLinkTreesLoading,
  isLinkTreeLoading,
  isSaving,
} from "./features/linktrees/states/linkTreesStore.js";
import { currentPath } from "./router.js";

export const ok = (data, message = "Berhasil") => ({ status: "success", message, data });

export const fail = (message = "Data tidak valid", data) => ({
  status: "fail",
  message,
  ...(data ? { data } : {}),
});

export const makeUser = (overrides = {}) => ({
  id: 7,
  name: "Martha",
  email: "martha@example.com",
  photo: "http://x/martha.png",
  ...overrides,
});

export const makeLinkTree = (overrides = {}) => ({
  id: 1,
  user_id: 7,
  title: "Kursus Ku",
  type: "public",
  description: "Kumpulan kursus ku",
  cover: "http://x/",
  created_at: "2025-03-09T01:32:33.000000Z",
  author: { name: "Martha", photo: "http://x/martha.png" },
  total_links: 2,
  ...overrides,
});

export const makeItem = (overrides = {}) => ({
  id: 5,
  link_tree_id: 1,
  title: "Dasar Java",
  url: "https://youtu.be/abc",
  ...overrides,
});

/**
 * Mengganti fetch global. routes: { "METHOD /path": payload | (body) => payload }.
 * Rute yang tidak terdaftar dijawab sukses dengan data kosong.
 */
export function mockApi(routes = {}) {
  const fetchMock = vi.fn(async (url, options = {}) => {
    const path = String(url).replace(DELCOM_BASEURL, "");
    const route = routes[`${options.method ?? "GET"} ${path}`];
    const payload = typeof route === "function" ? route(options.body) : (route ?? ok({}));
    return { json: async () => payload };
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

// Jumlah pemanggilan fetch ke "METHOD /path"
export function countCalls(fetchMock, method, path) {
  return fetchMock.mock.calls.filter(
    ([url, options]) =>
      String(url).replace(DELCOM_BASEURL, "") === path && (options?.method ?? "GET") === method
  ).length;
}

export function resetStores() {
  localStorage.clear();
  authToken.set(null);
  profile.set(null);
  users.set([]);
  isUserLoading.set(false);
  linkTrees.set([]);
  linkTree.set(null);
  isLinkTreesLoading.set(false);
  isLinkTreeLoading.set(false);
  isSaving.set(false);
  setPath("/");
}

export function setPath(path) {
  window.history.replaceState({}, "", path);
  currentPath.set(path);
}

/** Snippet sederhana untuk prop `children`. */
export const textSnippet = (html = "<p>isi layout</p>") =>
  createRawSnippet(() => ({ render: () => html }));

/**
 * Merender komponen dengan keadaan store yang bersih.
 * options: { props, token, profile, path }
 */
export function renderWithProviders(Component, options = {}) {
  const { props = {}, token = "token-uji", profile: me = null, path = "/" } = options;
  resetStores();
  authToken.set(token);
  if (me) profile.set(me);
  setPath(path);
  return render(Component, { props });
}
