<script lang="ts">
  import store from "./stores.svelte";
  import { idToMapState } from "$lib/data";

  let empties = $state(0);
  let materials: { id: number; display: string; amount: number }[] = $state([]);

  $effect(() => {
    const result: Map<number, { id: number; display: string; amount: number }> = new Map<
      number,
      { id: number; display: string; amount: number }
    >();

    for (const xRow of store.data?.states || [[[]]]) {
      for (const zRow of xRow) {
        for (const id of zRow) {
          const data = idToMapState.at(id);
          if (!data) continue;

          if (result.has(id)) {
            const existing = result.get(id);
            if (existing) existing.amount++;
          } else result.set(id, { id, display: data[0], amount: 1 });
        }
      }
    }

    materials = [...result.values()].sort((a, b) => b.amount - a.amount);
    empties = result.get(0)?.amount || 0;
  });

  let cubicVolume = $derived(
    (store.data?.dim[0] || 0) * (store.data?.dim[1] || 0) * (store.data?.dim[2] || 0),
  );
</script>

<h3 class="section-title">General Data:</h3>
<p class="text-text">
  <span class="font-bold">Imported Type:</span>
  {store.dataType} JSON<br />

  <span class="font-bold">Dimensions:</span>
  {store.data?.dim[0]} x {store.data?.dim[1]} x {store.data?.dim[2]}<br />

  <span class="font-bold">Empty Spaces:</span>
  {empties} ({Math.round((empties / cubicVolume) * 100)}%)
</p>

{#if materials && materials.length > 0}
  <h3 class="section-title">Materials:</h3>
  <p class="text-text">
    {#each materials as material, i (material ? material.id : i)}
      {#if material && material.display !== "Air"}
        <span class="font-bold">{material.display}:</span>
        {material.amount}<br />
      {/if}
    {/each}
  </p>
{:else}
  <h3 class="section-title text-red-400">Empty Reactor!</h3>
{/if}
