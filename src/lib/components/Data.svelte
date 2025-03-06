<script lang="ts">
  import store, { volume } from "../stores.svelte.js";
  import { getMaterials } from "$lib/data";

  let volumeNum = $derived(volume(store));

  let materials = $derived.by(() => {
    const result = getMaterials(store.data?.states || [[[]]]);
    result.materials.sort((a, b) => b.amount - a.amount);

    return result;
  });
</script>

<h3 class="section-title">General Types:</h3>
<ul class="text-text list-disc">
  <li class="ml-4 list-item">
    <span class="font-bold">Imported Type:</span>
    {store.dataType} JSON
  </li>

  <li class="ml-4 list-item">
    <span class="font-bold">Dimensions:</span>
    {store.data?.dim[0]} x {store.data?.dim[1]} x {store.data?.dim[2]}
  </li>

  <li class="ml-4 list-item">
    <span class="font-bold">Empty Spaces:</span>
    {materials.empties} ({Math.round((materials.empties / volumeNum) * 100)}%)
  </li>
</ul>

{#if materials && materials.materials.length > 0}
  <h3 class="section-title">Materials:</h3>
  <ul class="text-text list-disc">
    {#each materials.materials as material (material.exportId)}
      <li class="ml-4 list-item">
        <span class="font-bold">{material.display}:</span>
        {material.amount}
      </li>
    {/each}
  </ul>
{:else}
  <h3 class="section-title text-red-400">Empty Reactor!</h3>
{/if}
