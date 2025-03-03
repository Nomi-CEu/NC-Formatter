<script lang="ts">
    import {rawText} from "../storage/currentProcessing.ts";

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

<div class="grid-cols-2 gap-10 mb-10">
    <textarea class="h-96 w-4xl mb-5 p-3 border-primary/50 bg-code border-4 rounded-lg max-h-none outline-none font-mono text-sm/6" bind:value={$rawText} placeholder="Input your reactor JSON (in Hellrage or Einsteinium format)..." contenteditable="true">

    </textarea>

    <div class="flex">
        <label for="file-data" class=" bg-primary/75 p-4 rounded-2xl font-title font-bold mr-auto mb-5">Select From File...</label>
        <input class="hidden" accept="application.JSON,.json" type="file" id="file-data" name="hellrage_json" bind:files />
        <button class="bg-secondary/50 p-4 rounded-2xl font-title font-bold ml-auto mb-5" onclick={() => rawText.set("")}>Clear</button>
    </div>

</div>
