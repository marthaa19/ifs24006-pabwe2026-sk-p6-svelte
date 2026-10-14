/* global DELCOM_BASEURL */
const ACCESS_TOKEN_KEY = "accessToken";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function putAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

/**
 * Pembungkus fetch ke REST API Delcom.
 * - body object biasa  -> otomatis JSON
 * - body FormData      -> dikirim apa adanya (untuk upload berkas)
 * - mengembalikan JSON { success, message, data }
 * - melempar Error(message) bila success === false atau jaringan gagal
 */
export async function fetchApi(path, { method = "GET", body } = {}) {
  const headers = {};
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload = body;
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let json;
  try {
    const response = await fetch(`${DELCOM_BASEURL}${path}`, {
      method,
      headers,
      body: payload,
    });
    json = await response.json();
  } catch {
    throw new Error("Tidak dapat terhubung ke server");
  }

  if (!json.success) {
    throw new Error(json.message || "Terjadi kesalahan");
  }
  return json;
}
