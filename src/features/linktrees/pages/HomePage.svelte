<script>
  import { onMount } from "svelte";
  import { Plus, Search, Trash2, Link2, Globe, EyeOff, Layers } from "lucide-svelte";
  import { goto, navigate } from "../../../router.js";
  import { profile } from "../../users/states/userStore.js";
  import {
    linkTrees,
    isLinkTreesLoading,
    isSaving,
    loadLinkTrees,
    removeLinkTree,
    removeAllLinkTrees,
  } from "../states/linkTreesStore.js";
  import { showConfirmDialog, formatDate, hasImage } from "../../../helpers/toolsHelper.js";
  import { typeMeta, btnPrimary, btnDanger, inputClass } from "../constants.js";
  import AddModal from "../modals/AddModal.svelte";

  let keyword = $state("");
  let onlyMine = $state(false);
  let showAdd = $state(false);

  onMount(() => loadLinkTrees());

  const isOwner = (lt) => $profile?.id === lt.user_id;

  let filtered = $derived(
    $linkTrees.filter((lt) => {
      const q = keyword.trim().toLowerCase();
      if (!q) return true;
      return [lt.title, lt.description, lt.author?.name]
        .filter(Boolean)
        .some((text) => text.toLowerCase().includes(q));
    })
  );
  let hasOwn = $derived($linkTrees.some(isOwner));
  let stats = $derived([
    { label: "Total Link Tree", value: $linkTrees.length, icon: Layers },
    { label: "Publik", value: $linkTrees.filter((l) => l.type === "public").length, icon: Globe },
    { label: "Tidak publik", value: $linkTrees.filter((l) => l.type !== "public").length, icon: EyeOff },
    { label: "Total Tautan", value: $linkTrees.reduce((sum, l) => sum + (l.total_links ?? 0), 0), icon: Link2 },
  ]);

  function toggleMine(e) {
    onlyMine = e.currentTarget.checked;
    loadLinkTrees({ isMe: onlyMine });
  }

  async function handleDelete(lt) {
    if (!(await showConfirmDialog("Hapus link tree?", `"${lt.title}" beserta seluruh tautannya akan dihapus.`))) return;
    if (await removeLinkTree(lt.id)) loadLinkTrees({ isMe: onlyMine });
  }

  async function handleDeleteAll() {
    if (!(await showConfirmDialog("Hapus semua link tree milikmu?", "Tindakan ini permanen dan tidak bisa dibatalkan."))) return;
    if (await removeAllLinkTrees()) loadLinkTrees({ isMe: onlyMine });
  }
</script>

<div class="space-y-6">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h1 class="text-2xl font-bold">Link Tree</h1>
      <p class="text-sm text-slate-500">Kumpulan tautan yang kamu miliki dan yang dibagikan secara publik.</p>
    </div>
    <div class="flex flex-wrap gap-2">
      {#if hasOwn}
        <button class={btnDanger} onclick={handleDeleteAll} disabled={$isSaving}>
          <Trash2 size={16} /> Hapus Semua Milikku
        </button>
      {/if}
      <button class={btnPrimary} onclick={() => (showAdd = true)}>
        <Plus size={16} /> Tambah
      </button>
    </div>
  </div>

  <section class="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Statistik">
    {#each stats as s (s.label)}
      <div class="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div class="rounded-lg bg-indigo-50 p-2 text-indigo-600"><s.icon size={20} /></div>
        <div>
          <p class="text-2xl font-bold leading-none">{s.value}</p>
          <p class="mt-1 text-xs text-slate-500">{s.label}</p>
        </div>
      </div>
    {/each}
  </section>

  <div class="flex flex-wrap items-center gap-3">
    <div class="relative min-w-52 flex-1">
      <Search size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        aria-label="Cari link tree"
        placeholder="Cari judul, deskripsi, atau penulis..."
        class={`${inputClass} pl-9`}
        bind:value={keyword}
      />
    </div>
    <label class="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={onlyMine} onchange={toggleMine} class="h-4 w-4 accent-indigo-600" />
      Hanya milikku
    </label>
  </div>

  {#if $isLinkTreesLoading}
    <p class="py-10 text-center text-slate-500">Memuat data...</p>
  {:else if filtered.length === 0}
    <div class="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-slate-500">
      {keyword ? "Tidak ada link tree yang cocok dengan pencarian." : "Belum ada link tree."}
    </div>
  {:else}
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {#each filtered as lt (lt.id)}
        {@const meta = typeMeta(lt.type)}
        <article class="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <a
            href={`/link-trees/${lt.id}`}
            onclick={(e) => goto(e, `/link-trees/${lt.id}`)}
            tabindex="-1"
            aria-hidden="true"
            class="block h-36 bg-gradient-to-br from-indigo-400 to-fuchsia-400"
          >
            {#if hasImage(lt.cover)}
              <img src={lt.cover} alt="" class="h-full w-full object-cover" />
            {/if}
          </a>
          <div class="flex flex-1 flex-col gap-2 p-4">
            <div class="flex items-start justify-between gap-2">
              <h2 class="font-semibold leading-snug">
                <a href={`/link-trees/${lt.id}`} onclick={(e) => goto(e, `/link-trees/${lt.id}`)} class="hover:text-indigo-600">
                  {lt.title}
                </a>
              </h2>
              <span class={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${meta.class}`}>{meta.label}</span>
            </div>
            <p class="line-clamp-2 text-sm text-slate-600">{lt.description || "Tanpa deskripsi"}</p>
            <div class="mt-auto flex items-center justify-between gap-2 pt-2 text-xs text-slate-500">
              <span class="flex min-w-0 items-center gap-2">
                {#if lt.author?.photo}
                  <img src={lt.author.photo} alt="" class="h-5 w-5 rounded-full object-cover" />
                {/if}
                <span class="truncate">{lt.author?.name ?? "-"}</span>
              </span>
              <span class="shrink-0">{`${lt.total_links ?? 0} tautan · ${formatDate(lt.created_at)}`}</span>
            </div>
            {#if isOwner(lt)}
              <button
                class="mt-1 inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                onclick={() => handleDelete(lt)}
                disabled={$isSaving}
              >
                <Trash2 size={14} /> Hapus
              </button>
            {/if}
          </div>
        </article>
      {/each}
    </div>
  {/if}
</div>

{#if showAdd}
  <AddModal
    onclose={() => (showAdd = false)}
    onsaved={(id) => navigate(`/link-trees/${id}`)}
  />
{/if}
