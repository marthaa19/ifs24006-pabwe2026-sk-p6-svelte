<script>
  import { navigate } from "../../../router.js";
</script>

<main class="min-h-screen flex flex-col items-center justify-center text-center p-4">
  <p class="text-6xl font-extrabold text-indigo-600">404</p>
  <h1 class="text-xl font-bold mt-2">Halaman tidak ditemukan</h1>
  <button class="mt-4 rounded-lg bg-indigo-600 text-white px-4 py-2 font-semibold"
    onclick={() => navigate("/")}>Kembali ke beranda</button>
</main>
