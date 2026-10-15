<script>
  import { ArrowLeft, Pencil, ImagePlus, Trash2, Plus, ExternalLink } from "lucide-svelte";
  import { goto, navigate } from "../../../router.js";
  import { profile } from "../../users/states/userStore.js";
  import {
    linkTree,
    isLinkTreeLoading,
    isSaving,
    loadLinkTree,
    removeLinkTree,
    removeItem,
  } from "../states/linkTreesStore.js";
  import { showConfirmDialog, formatDate, hasImage } from "../../../helpers/toolsHelper.js";
  import { typeMeta, btnPrimary, btnSecondary, btnDanger } from "../constants.js";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import ChangeCoverModal from "../modals/ChangeCoverModal.svelte";
  import ItemModal from "../modals/ItemModal.svelte";

  let { linkTreeId } = $props();

  let modal = $state(null); // "edit" | "cover" | "item" | null
  let editingItem = $state(null);

  // muat ulang setiap kali id pada URL berubah
  $effect(() => {
    modal = null;
    loadLinkTree(linkTreeId);
  });

  let isOwner = $derived(Boolean($linkTree) && $profile?.id === $linkTree.user_id);
  let meta = $derived(typeMeta($linkTree?.type));

  function openItemModal(item = null) {
    editingItem = item;
    modal = "item";
  }

  async function handleDelete() {
    if (!(await showConfirmDialog("Hapus link tree?", "Seluruh tautan di dalamnya ikut terhapus."))) return;
    if (await removeLinkTree($linkTree.id)) navigate("/", { replace: true });
  }

  async function handleDeleteItem(item) {
    if (!(await showConfirmDialog("Hapus tautan?", `"${item.title}" akan dihapus.`))) return;
    await removeItem($linkTree.id, item.id);
  }
</script>

<div class="space-y-5">
  <a href="/" onclick={(e) => goto(e, "/")} class="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline">
    <ArrowLeft size={16} /> Kembali
  </a>

  {#if $isLinkTreeLoading}
    <p class="py-10 text-center text-slate-500">Memuat data...</p>
  {:else if $linkTree}
    <section class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div class="h-44 bg-gradient-to-br from-indigo-400 to-fuchsia-400 sm:h-56">
        {#if hasImage($linkTree.cover)}
          <img src={$linkTree.cover} alt={`Sampul ${$linkTree.title}`} class="h-full w-full object-cover" />
        {/if}
      </div>
      <div class="space-y-3 p-5">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <h1 class="text-2xl font-bold">{$linkTree.title}</h1>
          <span class={`rounded-full px-3 py-1 text-xs font-medium ${meta.class}`}>{meta.label}</span>
        </div>
        <p class="text-slate-600">{$linkTree.description || "Tanpa deskripsi"}</p>
        <div class="flex items-center gap-2 text-sm text-slate-500">
          {#if $linkTree.author?.photo}
            <img src={$linkTree.author.photo} alt="" class="h-6 w-6 rounded-full object-cover" />
          {/if}
          <span>{`${$linkTree.author?.name ?? "-"} · dibuat ${formatDate($linkTree.created_at)}`}</span>
        </div>

        {#if isOwner}
          <div class="flex flex-wrap gap-2 pt-2">
            <button class={btnSecondary} onclick={() => (modal = "edit")}><Pencil size={16} /> Ubah Data</button>
            <button class={btnSecondary} onclick={() => (modal = "cover")}><ImagePlus size={16} /> Ubah Sampul</button>
            <button class={btnDanger} onclick={handleDelete} disabled={$isSaving}><Trash2 size={16} /> Hapus</button>
          </div>
        {/if}
      </div>
    </section>

    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">{`Tautan (${$linkTree.items?.length ?? 0})`}</h2>
        {#if isOwner}
          <button class={btnPrimary} onclick={() => openItemModal()}><Plus size={16} /> Tambah Tautan</button>
        {/if}
      </div>

      {#if !$linkTree.items?.length}
        <div class="rounded-xl border border-dashed border-slate-300 bg-white py-10 text-center text-slate-500">
          Belum ada tautan.
        </div>
      {:else}
        <ul class="space-y-2">
          {#each $linkTree.items as item (item.id)}
            <li class="flex items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <a href={item.url} target="_blank" rel="noopener noreferrer" class="min-w-0 flex-1 hover:text-indigo-600">
                <p class="flex items-center gap-1 font-medium">
                  <span class="truncate">{item.title}</span>
                  <ExternalLink size={14} class="shrink-0" />
                </p>
                <p class="truncate text-xs text-slate-500">{item.url}</p>
              </a>
              {#if isOwner}
                <div class="flex shrink-0 gap-1">
                  <button class="rounded-lg p-2 hover:bg-slate-100" aria-label={`Ubah tautan ${item.title}`} onclick={() => openItemModal(item)}>
                    <Pencil size={16} />
                  </button>
                  <button class="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={`Hapus tautan ${item.title}`} onclick={() => handleDeleteItem(item)} disabled={$isSaving}>
                    <Trash2 size={16} />
                  </button>
                </div>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </section>

    {#if modal === "edit"}
      <ChangeModal linkTree={$linkTree} onclose={() => (modal = null)} />
    {:else if modal === "cover"}
      <ChangeCoverModal linkTree={$linkTree} onclose={() => (modal = null)} />
    {:else if modal === "item"}
      <ItemModal linkTreeId={$linkTree.id} item={editingItem} onclose={() => (modal = null)} />
    {/if}
  {:else}
    <p class="py-10 text-center text-slate-500">Link tree tidak ditemukan.</p>
  {/if}
</div>
