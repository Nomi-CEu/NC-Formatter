<script lang="ts">
  import "svelte-highlight/styles/tokyo-night-dark.css";
  import { fade } from "svelte/transition";
  import store from "$lib/stores.svelte.js";
  import { FileUpload, type FileUploadApi } from "@skeletonlabs/skeleton-svelte";
  import Upload from "lucide-svelte/icons/upload";
  import X from "lucide-svelte/icons/x";
  import Preview from "$lib/components/Preview.svelte";

  let { children } = $props();

  let fileName = $state("");
  let api: FileUploadApi | undefined = $state();

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

  function clearFiles() {
    if (api) api.clearFiles();

    // Since all elements will be removed, scroll to top of page
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
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
      <Preview title={fileName || "upload.json"} display={store.rawText}>
        <button class="display-button" aria-label="clear" onclick={clearFiles}>
          <X class="display-logo" />
        </button>
      </Preview>
      {@render children()}
    </div>
  {/if}
</div>
