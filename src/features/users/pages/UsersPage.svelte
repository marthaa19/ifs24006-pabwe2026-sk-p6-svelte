<script>
  import { onMount } from "svelte";
  import { users, isUserLoading, loadUsers } from "../states/userStore.js";

  onMount(loadUsers);
</script>

<h1 class="text-2xl font-bold mb-4">Pengguna</h1>

{#if $isUserLoading}
  <p class="text-slate-500">Memuat pengguna...</p>
{:else if $users.length === 0}
  <p class="text-slate-500">Belum ada pengguna.</p>
{:else}
  <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {#each $users as user (user.id)}
      <li class="flex items-center gap-3 bg-white rounded-xl shadow-sm p-4">
        <div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div class="min-w-0">
          <p class="font-semibold truncate">{user.name}</p>
          <p class="text-sm text-slate-500 truncate">{user.email}</p>
        </div>
      </li>
    {/each}
  </ul>
{/if}
