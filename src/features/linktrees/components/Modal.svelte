<script>
  import { X } from "lucide-svelte";

  let { title, onclose, children } = $props();

  function onkeydown(e) {
    if (e.key === "Escape") onclose();
  }
</script>

<svelte:window {onkeydown} />

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
  role="presentation"
  onclick={(e) => { if (e.target === e.currentTarget) onclose(); }}
>
  <div role="dialog" aria-modal="true" aria-label={title} class="max-h-full w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-bold">{title}</h2>
      <button class="rounded-lg p-1 hover:bg-slate-100" aria-label="Tutup" onclick={onclose}>
        <X size={18} />
      </button>
    </div>
    {@render children()}
  </div>
</div>
