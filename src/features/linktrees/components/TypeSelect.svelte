<script>
  import { TYPE_OPTIONS, inputClass } from "../constants.js";

  let { id, value = $bindable("public"), options = TYPE_OPTIONS } = $props();
</script>

<select {id} class={inputClass} bind:value>
  {#each options as o (o.value)}
    <option value={`${o.value}`}>{o.label}</option>
  {/each}
</select>
