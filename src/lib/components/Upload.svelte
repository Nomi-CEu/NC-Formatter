<script lang="ts">
  import Highlight, { LineNumbers } from "svelte-highlight";
  import json from "svelte-highlight/languages/json";
  import "svelte-highlight/styles/tokyo-night-dark.css";
  import { fade } from "svelte/transition";
  import store from "$lib/stores.svelte.js";
  import { FileUpload, type FileUploadApi } from "@skeletonlabs/skeleton-svelte";
  import Upload from "lucide-svelte/icons/upload";
  import X from "lucide-svelte/icons/x";

  let { children } = $props();
  let maxFileCharLength = 100_000;

  let fileName = $state("");
  let api: FileUploadApi = $state();

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

<div class="mb-10 grid-cols-2 gap-2">
  <FileUpload
    name="example"
    accept="application.JSON,.json"
    maxFiles={1}
    subtext="Attach up to 1 file."
    onFileChange={details => onChange(details.acceptedFiles)}
    classes="w-full mb-3"
    filesListClasses="hidden"
    onApiReady={_api => (api = _api)}
    interfaceClasses="border-solid !border-primary/50 rounded-lg !border-2"
  >
    {#snippet iconInterface()}<Upload class="size-8" />{/snippet}
  </FileUpload>

  {#if store.rawText}
    <div in:fade={{ duration: 200 }} out:fade={{ duration: 500 }}>
      <div class="border-primary/50 bg-code relative rounded-lg border-2 pb-1">
        <p class="my-2 ml-4 font-bold">{fileName || "upload.json"}</p>
        <button
          class="text-skin-base absolute top-0 right-1 flex rounded px-2 py-2 text-xs leading-4 font-medium"
          aria-label="clear"
          onclick={() => {
            if (api) api.clearFiles();

            // Since all elements will be removed, scroll to top of page
            document.documentElement.scrollTo({
              top: 0,
              left: 0,
              behavior: "smooth",
            });
          }}
        >
          <X
            class="stroke-text hover:stroke-accent z-10 h-6 w-6 transition-all duration-[300ms] ease-in-out"
          />
        </button>
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
