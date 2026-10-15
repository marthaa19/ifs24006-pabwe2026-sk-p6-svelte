<script>
  import { onMount } from "svelte";
  import Modal from "../components/Modal.svelte";
  import { useInput } from "../../../hooks/useInput.js";
  import { addItem, changeItem, isSaving } from "../states/linkTreesStore.js";
  import { inputClass, btnPrimary, btnSecondary } from "../constants.js";

  // item = null -> tambah tautan, item = {id,title,url} -> ubah tautan
  let { linkTreeId, item = null, onclose } = $props();

  const { value: title } = useInput("");
  const { value: url } = useInput("");

  onMount(() => {
    if (item) {
      title.set(item.title ?? "");
      url.set(item.url ?? "");
    }
  });

  async function handleSubmit(e) {
    e.preventDefault();
    const data = { title: $title, url: $url };
    const ok = item
      ? await changeItem(linkTreeId, item.id, data)
      : await addItem(linkTreeId, data);
    if (ok) onclose();
  }
</script>

<Modal title={item ? "Ubah Tautan" : "Tambah Tautan"} {onclose}>
  <form onsubmit={handleSubmit} class="space-y-3">
    <div>
      <label for="item-title" class="mb-1 block text-sm">Judul</label>
      <input id="item-title" class={inputClass} bind:value={$title} required />
    </div>
    <div>
      <label for="item-url" class="mb-1 block text-sm">URL</label>
      <input id="item-url" type="url" placeholder="https://" class={inputClass} bind:value={$url} required />
    </div>
    <div class="flex justify-end gap-2 pt-2">
      <button type="button" class={btnSecondary} onclick={onclose}>Batal</button>
      <button class={btnPrimary} disabled={$isSaving}>{$isSaving ? "Menyimpan..." : "Simpan"}</button>
    </div>
  </form>
</Modal>
