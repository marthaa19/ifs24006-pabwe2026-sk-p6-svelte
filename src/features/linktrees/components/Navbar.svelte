<script>
  import { Link, Menu, X, LogOut } from "lucide-svelte";
  import { goto } from "../../../router.js";
  import { logout } from "../../auth/states/authStore.js";
  import { profile } from "../../users/states/userStore.js";
  import { showConfirmDialog } from "../../../helpers/toolsHelper.js";

  let { onmenu, sidebarOpen = false } = $props();

  async function handleLogout() {
    if (await showConfirmDialog("Keluar dari aplikasi?")) logout();
  }
</script>

<header class="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
  <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
    <div class="flex items-center gap-3">
      <button
        class="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
        aria-label={sidebarOpen ? "Tutup menu" : "Buka menu"}
        onclick={onmenu}
      >
        {#if sidebarOpen}<X size={20} />{:else}<Menu size={20} />{/if}
      </button>
      <a href="/" onclick={(e) => goto(e, "/")} class="flex items-center gap-2 font-bold text-indigo-600">
        <Link size={22} /> Delcom Link Tree
      </a>
    </div>

    <div class="flex items-center gap-3">
      {#if $profile}
        <a href="/profile" onclick={(e) => goto(e, "/profile")} class="flex items-center gap-2 text-sm font-medium">
          {#if $profile.photo}
            <img src={$profile.photo} alt="" class="h-8 w-8 rounded-full object-cover" />
          {/if}
          <span class="hidden sm:inline">{$profile.name}</span>
        </a>
      {/if}
      <button
        class="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
        onclick={handleLogout}
      >
        <LogOut size={16} /> Keluar
      </button>
    </div>
  </div>
</header>
