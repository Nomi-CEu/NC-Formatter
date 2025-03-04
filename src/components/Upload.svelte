<script lang="ts">
    import { rawText } from "../storage/currentProcessing.ts";
    import Highlight, {LineNumbers} from "svelte-highlight";
    import json from "svelte-highlight/languages/json";
    import tokyoDark from "svelte-highlight/styles/tokyo-night-dark";
    import Validation from "./Validation.svelte";
    import { fade } from "svelte/transition";

    let files: FileList | undefined = $state();

    $effect(() => {
        if (files) {
            const file = files.item(0);
            if (file) {
                file.text().then((str) => {
                    rawText.set(str);
                });
            }
        }
    });
</script>

<svelte:head>
    {@html tokyoDark}
</svelte:head>

<h2 class="title">Step 1: Upload Data</h2>
<p class="subtitle">
    Accepted: Hellrage JSON Files
    (from <a href="https://github.com/hellrage/NC-Reactor-Planner">Hellrage</a> or
    <a href="https://leu-235.com/">LEU-235</a>),
    <a href="https://balam314.github.io/Einsteinium/">Einsteinium</a> JSON Files
</p>
<hr class="separator" />

<div class="grid-cols-2 gap-10 mb-10">
    <div class="flex">
        <label for="file-data" class=" bg-primary/75 p-4 rounded-2xl font-title font-bold mr-auto mb-5">Select From File...</label>
        <input class="hidden" accept="application.JSON,.json" type="file" id="file-data" name="hellrage_json" bind:files />
        <button class="bg-secondary/50 p-4 rounded-2xl font-title font-bold ml-auto mb-5 " onclick={() => rawText.set("")}>Clear</button>
    </div>

    {#if $rawText}
        <div transition:fade>
            <div class="max-h-[36rem] overflow-y-scroll border-primary/50 border-4 rounded-lg">
                <Highlight language={json} code={$rawText} let:highlighted>
                    <LineNumbers {highlighted} wrapLines />
                </Highlight>
            </div>
            <Validation />
        </div>
    {/if}
</div>
