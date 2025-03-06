<script lang="ts">
  import store, { volume, surfaceArea } from "$lib/stores.svelte.js";
  import { CasingOptions, type Materials } from "$lib/types";
  import { casingExportId, getMaterials } from "$lib/data";

  let { children } = $props();

  let volumeNum = $derived(volume(store));
  let surfaceAreaNum = $derived(surfaceArea(store));

  let materials: Materials = $derived.by(() => {
    const result = getMaterials(
      store.data?.states || [[[]]],
      (id, data) => {
        if (id === 0) return true;
        return data[1](store.options) === undefined;
      },
      data => {
        const special = data[1](store.options)?.display;
        if (special) return special;
        return data[0];
      },
      (id, data) => data[1](store.options)?.exportId || id,
    );

    if (store.options.casing !== CasingOptions.NONE) {
      result.materials.push({
        exportId: casingExportId,
        display: `${store.options.casing === CasingOptions.TRANSPARENT ? "Transparent " : ""}Fission Reactor Casing`,
        amount: surfaceAreaNum,
      });
    }

    result.materials.sort((a, b) => b.amount - a.amount);
    return result;
  });
</script>

{#if materials && materials.materials.length > 0}
  <h2 class="title !mt-12">Step 4: Final Types Check</h2>
  <p class="subtitle">Please check all the final export data is correct.</p>
  <hr class="separator" />
  <h3 class="section-title">Final Materials:</h3>
  <p class="section-subtitle pb-6">Please check the final materials are correct.</p>
  <ul class="text-text list-disc">
    {#each materials.materials as material (material.exportId)}
      <li class="ml-4 list-item">
        <span class="font-bold">{material.display}:</span>
        {material.amount}
      </li>
    {/each}
  </ul>

  <h3 class="section-title">
    Interior Empty Spaces: {materials.empties} ({Math.round(
      (materials.empties / volumeNum) * 100,
    )}%)
  </h3>
  <p class="section-subtitle pb-6">Percentage calculated using interior space, ignoring casings.</p>

  {@render children()}
{:else}
  <h3 class="section-title text-red-400">Error: No Materials!</h3>
  <p class="text-text text-lg font-bold">
    Cannot continue until export content contains some materials.
  </p>
  <p class="section-subtitle mt-1">Please check your data and options.</p>
{/if}
