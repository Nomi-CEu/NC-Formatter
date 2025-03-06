<script lang="ts">
  import Highlight, { LineNumbers } from "svelte-highlight";
  import json from "svelte-highlight/languages/json";
  import "svelte-highlight/styles/tokyo-night-dark.css";
  import { fade } from "svelte/transition";
  import store from "$lib/stores.svelte.js";
  import { FileUpload } from "@skeletonlabs/skeleton-svelte";
  import FileCode from "lucide-svelte/icons/file-code";
  import Upload from "lucide-svelte/icons/upload";
  import X from "lucide-svelte/icons/x";

  let { children } = $props();
  let maxFileCharLength = 100_000;

  let fileName = $state("");

  function onChange(files: File[]) {
    store.rawText = "";
    fileName = "";
    if (files) {
      const file = files.at(0);
      if (file) {
        fileName = file.name;
        file.text().then(str => {
          store.rawText = str;
        });
      }
    }
  }
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
  <FileUpload
    name="example"
    accept="application.JSON,.json"
    maxFiles={1}
    subtext="Attach up to 1 file."
    onFileChange={details => onChange(details.acceptedFiles)}
    classes="w-full mb-10"
  >
    {#snippet iconInterface()}<Upload class="size-8" />{/snippet}
    {#snippet iconFile()}<FileCode class="size-5" />{/snippet}
    {#snippet iconFileRemove()}<X class="size-6" />{/snippet}
  </FileUpload>

  {#if store.rawText}
    <div transition:fade>
      <h3 class="section-title !mb-5">Preview:</h3>
      <div class="border-primary/50 bg-code rounded-lg border-4">
        <p class="my-2 ml-4 font-bold">{fileName || "upload.json"}</p>
        {#if store.rawText.length > maxFileCharLength}
          <div class="bg-[#1a1b26] py-5 pl-5">
            <p class="text-text text-lg font-bold">File too large to display preview.</p>
            <p class="text-text/50 mt-1 italic">
              Preview is limited to a maximum of 100,000 characters, for performance reasons.
            </p>
          </div>
        {:else}
          <div class=" max-h-96 overflow-y-scroll">
            <Highlight language={json} code={store.rawText} let:highlighted>
              <LineNumbers {highlighted} wrapLines />
            </Highlight>
          </div>
        {/if}
      </div>
      {@render children()}
    </div>
  {/if}
</div>
