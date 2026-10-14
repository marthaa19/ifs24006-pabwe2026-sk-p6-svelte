<!-- STUB sementara (Tahap 2). Akan diganti HomePage asli di Tahap 3. -->
<script>
  import { logout } from "../../auth/states/authStore.js";
</script>

<main class="min-h-screen flex flex-col items-center justify-center gap-4">
  <h1 class="text-2xl font-bold text-indigo-600">Login berhasil 🎉</h1>
  <button class="rounded-lg bg-red-600 text-white px-4 py-2 font-semibold" onclick={logout}>
    Keluar
  </button>
</main>
