<script lang="ts">
  import Highlight, { LineNumbers } from "svelte-highlight";
  import json from "svelte-highlight/languages/json";
  import "svelte-highlight/styles/tokyo-night-dark.css";
  import { fade } from "svelte/transition";
  import store from "$lib/stores.svelte.js";

  let { children } = $props();

  let fileValue = $state();
  let files: FileList | undefined = $state();

  $effect(() => {
    if (files) {
      const file = files.item(0);
      if (file) {
        file.text().then(str => {
          store.rawText = str;
        });
      }
    }
  });
</script>

<h2 class="title">Step 1: Upload Data</h2>
<p class="subtitle">
  Accepted: Hellrage JSON Files (from <a href="https://github.com/hellrage/NC-Reactor-Planner"
    >Hellrage</a
  >
  or
  <a href="https://leu-235.com/">LEU-235</a>),
  <a href="https://balam314.github.io/Einsteinium/">Einsteinium</a> JSON Files
</p>
<hr class="separator" />

<div class="mb-10 grid-cols-2 gap-10">
  <div class="flex">
    <label for="file-data" class=" bg-primary/75 font-title mr-auto mb-5 rounded-2xl p-4 font-bold"
      >Select From File...</label
    >
    <input
      class="hidden"
      accept="application.JSON,.json"
      type="file"
      id="file-data"
      name="hellrage_json"
      bind:files
      bind:value={fileValue}
      onclick={() => {
        fileValue = undefined; // Make sure we can select a file with the same filename again
      }}
    />
    <button
      class="bg-secondary/50 font-title mb-5 ml-auto rounded-2xl p-4 font-bold"
      onclick={() => {
        store.rawText = "";
        fileValue = undefined; // Make sure we can select a file with the same filename again
      }}>Clear</button
    >
  </div>

  {#if store.rawText}
    <div transition:fade>
      <div class="border-primary/50 max-h-[36rem] overflow-y-scroll rounded-lg border-4">
        <Highlight language={json} code={store.rawText} let:highlighted>
          <LineNumbers {highlighted} wrapLines />
        </Highlight>
      </div>
      {@render children()}
    </div>
  {/if}
</div>
