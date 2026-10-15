<script>
  import { onMount } from "svelte";
  import { loadProfile } from "../../users/states/userStore.js";
  import Navbar from "../components/Navbar.svelte";
  import Sidebar from "../components/Sidebar.svelte";

  let { children } = $props();
  let sidebarOpen = $state(false);

  // profil dibutuhkan navbar dan pengecekan kepemilikan link tree
  onMount(loadProfile);
</script>

<div class="min-h-screen bg-slate-50 text-slate-800">
  <Navbar onmenu={() => (sidebarOpen = !sidebarOpen)} {sidebarOpen} />
  <div class="mx-auto flex max-w-7xl flex-col lg:flex-row">
    <Sidebar open={sidebarOpen} onnavigate={() => (sidebarOpen = false)} />
    <main class="min-w-0 flex-1 p-4 sm:p-6">
      {@render children()}
    </main>
  </div>
</div>
