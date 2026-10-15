<script>
  import Modal from "../components/Modal.svelte";
  import { useInput } from "../../../hooks/useInput.js";
  import { addLinkTree, isSaving } from "../states/linkTreesStore.js";
  import { TYPE_OPTIONS, inputClass, btnPrimary, btnSecondary } from "../constants.js";

  let { onclose, onsaved } = $props();

  const { value: title } = useInput("");
  const { value: type } = useInput("public");
  const { value: description } = useInput("");

  async function handleSubmit(e) {
    e.preventDefault();
    const id = await addLinkTree({ title: $title, type: $type, description: $description });
    if (id !== null) {
      onclose();
      onsaved?.(id);
    }
  }
</script>

<Modal title="Tambah Link Tree" {onclose}>
  <form onsubmit={handleSubmit} class="space-y-3">
    <div>
      <label for="add-title" class="mb-1 block text-sm">Judul</label>
      <input id="add-title" class={inputClass} bind:value={$title} required />
    </div>
    <div>
      <label for="add-type" class="mb-1 block text-sm">Tipe</label>
      <select id="add-type" class={inputClass} bind:value={$type}>
        {#each TYPE_OPTIONS as o (o.value)}<option value={o.value}>{o.label}</option>{/each}
      </select>
    </div>
    <div>
      <label for="add-desc" class="mb-1 block text-sm">Deskripsi</label>
      <textarea id="add-desc" rows="3" class={inputClass} bind:value={$description}></textarea>
    </div>
    <div class="flex justify-end gap-2 pt-2">
      <button type="button" class={btnSecondary} onclick={onclose}>Batal</button>
      <button class={btnPrimary} disabled={$isSaving}>{$isSaving ? "Menyimpan..." : "Simpan"}</button>
    </div>
  </form>
</Modal>
