<script>
  import { Link2, Users, User } from "lucide-svelte";
  import { currentPath, goto } from "../../../router.js";

  let { open = false, onnavigate } = $props();

  const items = [
    { path: "/", label: "Link Tree", icon: Link2, match: (p) => p === "/" || p.startsWith("/link-trees") },
    { path: "/users", label: "Pengguna", icon: Users, match: (p) => p === "/users" },
    { path: "/profile", label: "Profil", icon: User, match: (p) => p === "/profile" },
  ];
</script>

<aside class="{open ? 'block' : 'hidden'} w-full border-b border-slate-200 bg-white p-3 lg:block lg:min-h-[calc(100vh-3.5rem)] lg:w-56 lg:shrink-0 lg:border-b-0 lg:border-r">
  <nav class="flex flex-col gap-1" aria-label="Menu utama">
    {#each items as item (item.path)}
      {@const active = item.match($currentPath)}
      <a
        href={item.path}
        aria-current={active ? "page" : undefined}
        onclick={(e) => { goto(e, item.path); onnavigate?.(); }}
        class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium {active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}"
      >
        <item.icon size={18} /> <span>{item.label}</span>
      </a>
    {/each}
  </nav>
</aside>
