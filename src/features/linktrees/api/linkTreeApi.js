import { fetchApi } from "../../../helpers/apiHelper.js";

// ---- Link tree ----
export const getLinkTrees = ({ isMe = false } = {}) =>
  fetchApi(`/link-trees${isMe ? "?is_me=1" : ""}`);

export const getLinkTreeById = (id) => fetchApi(`/link-trees/${id}`);

export const postLinkTree = ({ title, type, description }) =>
  fetchApi("/link-trees", { method: "POST", body: { title, type, description } });

export const putLinkTree = (id, { title, type, description }) =>
  fetchApi(`/link-trees/${id}`, { method: "PUT", body: { title, type, description } });

export const postLinkTreeCover = (id, file) => {
  const form = new FormData();
  form.append("cover", file);
  return fetchApi(`/link-trees/${id}/cover`, { method: "POST", body: form });
};

export const deleteLinkTree = (id) =>
  fetchApi(`/link-trees/${id}`, { method: "DELETE" });

export const deleteAllLinkTrees = () =>
  fetchApi("/link-trees", { method: "DELETE" });

// ---- Item tautan ----
export const postItem = (linkTreeId, { title, url }) =>
  fetchApi(`/link-trees/${linkTreeId}/items`, { method: "POST", body: { title, url } });

export const putItem = (linkTreeId, id, { title, url }) =>
  fetchApi(`/link-trees/${linkTreeId}/items/${id}`, { method: "PUT", body: { title, url } });

export const deleteItem = (linkTreeId, id) =>
  fetchApi(`/link-trees/${linkTreeId}/items/${id}`, { method: "DELETE" });
