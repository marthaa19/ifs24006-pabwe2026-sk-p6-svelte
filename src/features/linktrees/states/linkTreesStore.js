import { writable } from "svelte/store";
import * as api from "../api/linkTreeApi.js";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper.js";

export const linkTrees = writable([]);
export const linkTree = writable(null);
export const isLinkTreesLoading = writable(false);
export const isLinkTreeLoading = writable(false);
export const isSaving = writable(false); // true selama ada proses tambah/ubah/hapus

export async function loadLinkTrees({ isMe = false } = {}) {
  isLinkTreesLoading.set(true);
  try {
    const res = await api.getLinkTrees({ isMe });
    linkTrees.set(res.data.link_trees);
  } catch (error) {
    await showErrorDialog(error.message);
  } finally {
    isLinkTreesLoading.set(false);
  }
}

export async function loadLinkTree(id) {
  linkTree.set(null);
  isLinkTreeLoading.set(true);
  try {
    const res = await api.getLinkTreeById(id);
    linkTree.set(res.data.link_tree);
  } catch (error) {
    await showErrorDialog(error.message);
  } finally {
    isLinkTreeLoading.set(false);
  }
}

// Menjalankan aksi tulis; mengembalikan respons bila sukses, null bila gagal
async function mutate(action, successFallback) {
  let res;
  isSaving.set(true);
  try {
    res = await action();
  } catch (error) {
    isSaving.set(false);
    await showErrorDialog(error.message);
    return null;
  }
  isSaving.set(false);
  await showSuccessDialog(res.message || successFallback);
  return res;
}

// Mengembalikan id link tree baru, atau null bila gagal
export async function addLinkTree(data) {
  const res = await mutate(() => api.postLinkTree(data), "Berhasil menambahkan data");
  return res ? res.data.link_tree_id : null;
}

export async function changeLinkTree(id, data) {
  const res = await mutate(() => api.putLinkTree(id, data), "Berhasil mengubah data");
  if (res) await loadLinkTree(id);
  return Boolean(res);
}

export async function changeCover(id, file) {
  const res = await mutate(() => api.postLinkTreeCover(id, file), "Berhasil mengubah cover");
  if (res) await loadLinkTree(id);
  return Boolean(res);
}

export async function removeLinkTree(id) {
  const res = await mutate(() => api.deleteLinkTree(id), "Berhasil menghapus data");
  return Boolean(res);
}

export async function removeAllLinkTrees() {
  const res = await mutate(() => api.deleteAllLinkTrees(), "Berhasil menghapus semua data");
  return Boolean(res);
}

export async function addItem(linkTreeId, data) {
  const res = await mutate(() => api.postItem(linkTreeId, data), "Berhasil menambahkan data");
  if (res) await loadLinkTree(linkTreeId);
  return Boolean(res);
}

export async function changeItem(linkTreeId, id, data) {
  const res = await mutate(() => api.putItem(linkTreeId, id, data), "Berhasil mengubah data");
  if (res) await loadLinkTree(linkTreeId);
  return Boolean(res);
}

export async function removeItem(linkTreeId, id) {
  const res = await mutate(() => api.deleteItem(linkTreeId, id), "Berhasil menghapus data");
  if (res) await loadLinkTree(linkTreeId);
  return Boolean(res);
}
