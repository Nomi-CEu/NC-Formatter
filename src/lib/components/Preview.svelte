<script lang="ts">
  import type { Snippet } from "svelte";
  import json from "svelte-highlight/languages/json";
  import Highlight, { LineNumbers } from "svelte-highlight";

  let maxFileCharLength = 100_000;

  interface Props {
    title: string;
    display: string;
    children: Snippet;
  }

  let { title, display, children }: Props = $props();
</script>

<div class="border-primary/50 bg-code-title relative rounded-lg border-2 pb-1">
  <p class="my-2 ml-4 font-bold">{title}</p>

  {@render children()}

  {#if display.length > maxFileCharLength}
    <div class="bg-code py-5 pl-5">
      <p class="text-text text-lg font-bold">File too large to display preview.</p>
      <p class="text-text/50 mt-1 italic">
        Preview is limited to a maximum of 100,000 characters, for performance reasons.
      </p>
    </div>
  {:else}
    <div class="max-h-96 overflow-y-scroll">
      <Highlight language={json} code={display} let:highlighted>
        <LineNumbers {highlighted} wrapLines />
      </Highlight>
    </div>
  {/if}
</div>
