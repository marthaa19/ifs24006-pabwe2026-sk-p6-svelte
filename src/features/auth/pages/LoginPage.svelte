<script>
  import { useInput } from "../../../hooks/useInput.js";
  import { login, isAuthLoading } from "../states/authStore.js";
  import { navigate } from "../../../router.js";

  const { value: email } = useInput("");
  const { value: password } = useInput("");

  async function handleSubmit(event) {
    event.preventDefault();
    const ok = await login($email, $password);
    if (ok) navigate("/", { replace: true });
  }
</script>

<h2 class="text-xl font-bold mb-4">Masuk</h2>
<form onsubmit={handleSubmit} class="space-y-4">
  <div>
    <label for="login-email-input" class="block text-sm font-medium mb-1">Email</label>
    <input id="login-email-input" type="email" required bind:value={$email}
      class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
  </div>
  <div>
    <label for="login-password-input" class="block text-sm font-medium mb-1">Kata Sandi</label>
    <input id="login-password-input" type="password" required bind:value={$password}
      class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
  </div>
  <button id="login-submit-button" type="submit" disabled={$isAuthLoading}
    class="w-full rounded-lg bg-indigo-600 text-white font-semibold py-2 hover:bg-indigo-700 disabled:opacity-60">
    {$isAuthLoading ? "Memproses..." : "Masuk"}
  </button>
</form>
<p class="text-sm text-center text-slate-500 mt-4">
  Belum punya akun?
  <a href="/auth/register" class="text-indigo-600 font-semibold"
    onclick={(e) => { e.preventDefault(); navigate("/auth/register"); }}>Daftar</a>
</p>
