import Swal from "sweetalert2";

export function showSuccessDialog(message) {
  return Swal.fire({ icon: "success", title: "Berhasil", text: message });
}

export function showErrorDialog(message) {
  return Swal.fire({ icon: "error", title: "Gagal", text: message });
}

export function showWarningDialog(message) {
  return Swal.fire({ icon: "warning", title: "Perhatian", text: message });
}

export async function showConfirmDialog(title, text = "") {
  const result = await Swal.fire({
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
  });
  return result.isConfirmed;
}

export function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Delcom mengirim URL berakhiran "/" bila gambar belum diunggah
export function hasImage(url) {
  return Boolean(url) && !String(url).endsWith("/");
}
