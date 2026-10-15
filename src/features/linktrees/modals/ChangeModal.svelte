<script>
  import { onMount } from "svelte";
  import Modal from "../components/Modal.svelte";
  import TypeSelect from "../components/TypeSelect.svelte";
  import { useInput } from "../../../hooks/useInput.js";
  import { changeLinkTree, isSaving } from "../states/linkTreesStore.js";
  import { inputClass, btnPrimary, btnSecondary } from "../constants.js";

  let { linkTree, onclose } = $props();

  const { value: title } = useInput("");
  const { value: type } = useInput("public");
  const { value: description } = useInput("");

  // isi form dengan data saat ini
  onMount(() => {
    title.set(linkTree.title ?? "");
    type.set(linkTree.type ?? "public");
    description.set(linkTree.description ?? "");
  });

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await changeLinkTree(linkTree.id, {
      title: $title,
      type: $type,
      description: $description,
    });
    if (ok) onclose();
  }
</script>

<Modal title="Ubah Link Tree" {onclose}>
  <form onsubmit={handleSubmit} class="space-y-3">
    <div>
      <label for="chg-title" class="mb-1 block text-sm">Judul</label>
      <input id="chg-title" class={inputClass} bind:value={$title} required />
    </div>
    <div>
      <label for="chg-type" class="mb-1 block text-sm">Tipe</label>
      <TypeSelect id="chg-type" bind:value={$type} />
    </div>
    <div>
      <label for="chg-desc" class="mb-1 block text-sm">Deskripsi</label>
      <textarea id="chg-desc" rows="3" class={inputClass} bind:value={$description}></textarea>
    </div>
    <div class="flex justify-end gap-2 pt-2">
      <button type="button" class={btnSecondary} onclick={onclose}>Batal</button>
      <button class={btnPrimary} disabled={$isSaving}>{$isSaving ? "Menyimpan..." : "Simpan"}</button>
    </div>
  </form>
</Modal>
