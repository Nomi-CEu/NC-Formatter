<script lang="ts">
  import store from "$lib/stores.svelte.js";
  import { CasingOptions } from "$lib/types";
  import { ModeratorOptions } from "$lib/types.js";

  let radioStorage: Record<string, string> = $state({
    casing: CasingOptions.NONE,
    moderator: ModeratorOptions.EXACT,
  });

  $effect(() => {
    store.options.casing = CasingOptions[radioStorage.casing as keyof typeof CasingOptions];
    store.options.moderator =
      ModeratorOptions[radioStorage.moderator as keyof typeof ModeratorOptions];
  });
</script>

{#snippet radio(name: string, value: string)}
  <input
    type="radio"
    {name}
    class="bg-secondary/50 checked:bg-primary mr-[0.1875rem] mb-[0.1875rem] border-transparent ring-transparent inset-ring-transparent ring-offset-transparent transition-colors outline-none"
    {value}
    bind:group={radioStorage[name]}
  />
{/snippet}

<h2 class="title !mt-12">Step 3: Export Options</h2>
<p class="subtitle">
  Configure what to include in the Building Gadgets String, to be pasted in-world!
</p>
<hr class="separator" />

<h3 class="section-title">Casing Output Mode:</h3>
<p class="section-subtitle pb-6">
  Whether or not to output casings to be pasted, and if so, which casing to paste.
</p>
<div class="grid grid-rows-3 gap-2">
  <label>
    {@render radio("casing", CasingOptions.NONE)}
    None <span class="section-subtitle">(Do not output casings.)</span>
  </label>
  <label>
    {@render radio("casing", CasingOptions.SOLID)}
    Solid Casings <span class="section-subtitle">(Output solid / non-transparent casings.)</span>
  </label>
  <label>
    {@render radio("casing", CasingOptions.TRANSPARENT)}
    Transparent Casings <span class="section-subtitle">(Output transparent casings.)</span>
  </label>
</div>

<h3 class="section-title">Moderator Output Mode:</h3>
<p class="section-subtitle pb-6">
  Note that <a href="https://leu-235.com/">LEU-235</a> outputs moderators as Graphite.
</p>
<div class="grid grid-rows-3 gap-2">
  <label class="my-auto">
    {@render radio("moderator", ModeratorOptions.EXACT)}
    Exact
    <span class="section-subtitle"
      >(Graphite and Beryllium Moderators will be used as specified.)</span
    >
  </label>
  <label>
    {@render radio("moderator", ModeratorOptions.GRAPHITE)}
    Graphite <span class="section-subtitle">(All moderators will be mapped to Graphite.)</span>
  </label>
  <label>
    {@render radio("moderator", ModeratorOptions.BERYLLIUM)}
    Beryllium <span class="section-subtitle">(All moderators will be mapped to Beryllium.)</span>
  </label>
</div>

<h3 class="section-title">Active Cooler Output Mode:</h3>
<p class="section-subtitle pb-6">Whether or not to output Active Coolers.</p>
<label>
  <input
    type="checkbox"
    name="activeCooler"
    class="bg-secondary/50 checked:bg-primary mr-[0.1875rem] mb-1 rounded-sm border-transparent ring-transparent inset-ring-transparent ring-offset-transparent transition-colors outline-none"
    bind:checked={store.options.activeCooler}
  />
  Active Coolers <span class="section-subtitle">(If not selected, air will replace them.)</span>
</label>
