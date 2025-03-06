<script lang="ts">
  import store, { surfaceArea } from "$lib/stores.svelte";
  import { type BGExport, CasingOptions } from "$lib/types";
  import { casingExportId, idToMapState } from "$lib/data";
  import json from "svelte-highlight/languages/json";
  import Highlight, { LineNumbers } from "svelte-highlight";
  import Copy from "lucide-svelte/icons/copy";
  import Check from "lucide-svelte/icons/check";
  import Save from "lucide-svelte/icons/save";
  import FileSaver from "file-saver";

  let maxFileCharLength = 100_000;

  // Scalars for each dimension, multiplied with coords to create BG pos array.
  const dimensionScalars = [65536, 256, 1];

  let includeCasing = $derived(store.options.casing !== CasingOptions.NONE);
  let offset = $derived(includeCasing ? 1 : 0);

  let dimX = $derived((store.data?.dim[0] || 0) + offset * 2);
  let dimY = $derived((store.data?.dim[1] || 0) + offset * 2);
  let dimZ = $derived((store.data?.dim[2] || 0) + offset * 2);

  let states = $derived(store.data?.states || [[[]]]);

  let data = $derived.by(() => {
    const materials: Map<number, BGExport> = new Map<number, BGExport>();
    const stateArr: number[] = [];
    const posArr: number[] = [];

    for (let y = 0; y < states.length; y++) {
      for (let x = 0; x < states[y].length; x++) {
        for (let z = 0; z < states[y][x].length; z++) {
          const id = states[y][x][z];
          if (id === 0) continue;

          const data = idToMapState.at(id);
          if (!data) continue;

          const exportData = data[1](store.options);
          if (!exportData) continue;

          const exportId = exportData.exportId || id;

          stateArr.push(exportId);
          posArr.push(
            dimensionScalars[0] * (x + offset) + dimensionScalars[1] * (y + offset) + (z + offset),
          );
          if (!materials.has(exportId)) materials.set(exportId, { exportId, ...exportData });
        }
      }
    }

    if (includeCasing) {
      // Add numCasing amount of casings
      stateArr.push(...Array(surfaceArea(store)).fill(casingExportId));

      // Push each coordinate
      const dim = store.data?.dim || [];
      for (let i = 0; i < dim.length; i++) {
        // For each dimension:
        // Push the coordinates in the dimension + next dimension's plane
        // E.g. for x dim, push the x-y plane
        // Push two versions, one for the minimum of the third dimension,
        // and the other for the maximum
        posArr.push(
          ...Array.from({ length: dim[i] || 0 }, (_, dim1) =>
            Array.from({ length: dim[(i + 1) % 3] || 0 }, (_, dim2) => {
              console.log(dim1 + offset, dim2 + offset, i);
              const dim3 = dim[(i + 2) % 3] || 0;

              const dim1Scaled = dimensionScalars[i] * (dim1 + offset);
              const dim2Scaled = dimensionScalars[(i + 1) % 3] * (dim2 + offset);
              const scaledVariable = dim1Scaled + dim2Scaled;

              const dim3ToScale = dimensionScalars[(i + 2) % 3];
              return [scaledVariable, scaledVariable + dim3ToScale * (dim3 + 1)];
            }),
          ).flat(2),
        );
      }

      // Push casing material to materials
      if (store.options.casing === CasingOptions.SOLID) {
        materials.set(casingExportId, {
          exportId: casingExportId,
          Name: "nuclearcraft:fission_block",
          Properties: { type: "casing" },
        });
      } else {
        materials.set(casingExportId, {
          exportId: casingExportId,
          Name: "nuclearcraft:reactor_casing_transparent",
        });
      }
    }

    const materialsString = [
      ...materials.values().map((material): string => {
        let stateString = `Name: "${material.Name}"`;
        if (material.Properties)
          stateString = stateString + `, Properties:${JSON.stringify(material.Properties)}`;
        return `{mapSlot: ${material.exportId || 0}s, mapState: {${stateString}}}`;
      }),
    ].join(", ");

    return {
      materialsString,
      stateArr,
      posArr,
    };
  });

  let outputString = $derived.by(() => {
    const { materialsString, stateArr, posArr } = data;
    return `{stateIntArray: [I; ${stateArr.join(", ")}], dim: 0, posIntArray: [I; ${posArr.join(", ")}], startPos: {X: 0, Y: 0, Z: 0}, mapIntState: [${materialsString}], endPos: {X: ${dimX - 1}, Y: ${dimY - 1}, Z: ${dimZ - 1}}}`;
  });

  let displayString = $derived.by(() => {
    const { materialsString, stateArr, posArr } = data;
    return `{\n  stateIntArray: [I; ${stateArr.join(", ")}],\n  dim: 0,\n  posIntArray: [I; ${posArr.join(", ")}],\n  startPos: {X: 0, Y: 0, Z: 0}],\n  mapIntState: [${materialsString}],\n  endPos: {X: ${dimX - 1}, Y: ${dimY - 1}, Z: ${dimZ - 1}}\n}`;
  });

  let displayTick = $state(false);
  async function onCopyClicked() {
    await navigator.clipboard.writeText(outputString);
    displayTick = true;

    setTimeout(() => (displayTick = false), 1000);
  }
</script>

<h2 class="title">Step 5: Output String</h2>
<p class="subtitle">
  Paste the string into a Template Manager to paste in-world.<br />See the
  <a href="https://github.com/Direwolf20-MC/BuildingGadgets/wiki/Template-Manager">Wiki</a> or the Quest
  Book for more information!
</p>
<hr class="separator" />

<div class="border-primary/50 bg-code relative rounded-lg border-4">
  <p class="my-2 ml-4 font-bold">Exported Building Gadgets String</p>
  <button
    class="text-skin-base absolute top-0 right-10 flex rounded px-2 py-2 text-xs leading-4 font-medium"
    aria-label="save"
    onclick={() => {
      const blob = new Blob([outputString], { type: "text/plain;charset=utf-8" });
      FileSaver.saveAs(blob, "bg-export-string.txt");
    }}
  >
    <Save
      class="stroke-text hover:stroke-accent z-10 h-6 w-6 transition-all duration-[300ms] ease-in-out"
    />
  </button>
  <button
    class="text-skin-base absolute top-0 right-1 flex rounded px-2 py-2 text-xs leading-4 font-medium"
    aria-label="copy"
    onclick={onCopyClicked}
  >
    {#if displayTick}
      <Check color="#72CC50" class="h-6 w-6" />
    {:else}
      <Copy
        class="stroke-text hover:stroke-accent z-10 h-6 w-6 transition-all duration-[300ms] ease-in-out"
      />
    {/if}
  </button>
  {#if store.rawText.length > maxFileCharLength}
    <div class="bg-[#1a1b26] py-5 pl-5">
      <p class="text-text text-lg font-bold">File too large to display preview.</p>
      <p class="text-text/50 mt-1 italic">
        Preview is limited to a maximum of 100,000 characters, for performance reasons.
      </p>
    </div>
  {:else}
    <div class="max-h-96 overflow-y-scroll">
      <Highlight language={json} code={displayString} let:highlighted>
        <LineNumbers {highlighted} wrapLines />
      </Highlight>
    </div>
  {/if}
</div>
