<script>
  import Modal from "../components/Modal.svelte";
  import { changeCover, isSaving } from "../states/linkTreesStore.js";
  import { showWarningDialog, hasImage } from "../../../helpers/toolsHelper.js";
  import { inputClass, btnPrimary, btnSecondary } from "../constants.js";

  let { linkTree, onclose } = $props();
  let file = $state(null);
  let preview = $derived(file ? URL.createObjectURL(file) : null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      await showWarningDialog("Pilih gambar sampul terlebih dahulu");
      return;
    }
    if (await changeCover(linkTree.id, file)) onclose();
  }
</script>

<Modal title="Ubah Sampul" {onclose}>
  <form onsubmit={handleSubmit} class="space-y-3">
    {#if preview || hasImage(linkTree.cover)}
      <img src={preview ?? linkTree.cover} alt="Pratinjau sampul" class="h-40 w-full rounded-lg object-cover" />
    {/if}
    <div>
      <label for="cover-file" class="mb-1 block text-sm">Gambar sampul</label>
      <input
        id="cover-file"
        type="file"
        accept="image/*"
        class={inputClass}
        onchange={(e) => (file = e.currentTarget.files[0] ?? null)}
      />
    </div>
    <div class="flex justify-end gap-2 pt-2">
      <button type="button" class={btnSecondary} onclick={onclose}>Batal</button>
      <button class={btnPrimary} disabled={$isSaving}>{$isSaving ? "Mengunggah..." : "Unggah"}</button>
    </div>
  </form>
</Modal>
