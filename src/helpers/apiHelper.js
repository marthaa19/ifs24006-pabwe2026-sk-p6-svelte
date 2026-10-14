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
 * - mengembalikan JSON { status, message, data }
 * - melempar Error(message) bila status !== "success" atau jaringan gagal
 * - bila ada detail validasi (data.field), pesan field pertama ikut ditampilkan
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

  if (json.status !== "success") {
    let message = json.message || "Terjadi kesalahan";
    // Respons gagal validasi: { status: "fail", data: { field: ["pesan"] } }
    if (json.data && typeof json.data === "object") {
      const details = Object.values(json.data).flat().filter(Boolean);
      if (details.length) message = `${message}: ${details.join(", ")}`;
    }
    throw new Error(message);
  }
  return json;
}