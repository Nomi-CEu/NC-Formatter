<script>
  import Upload from "$lib/Upload.svelte";
  import Validation from "$lib/Validation.svelte";
</script>

<main class="text-text m-auto max-w-4xl">
  <h1 class="mx-auto mt-8 mb-4 text-center text-4xl font-bold">Nomi-CEu NuclearCraft Formatter</h1>
  <p class="subtitle text-lg">
    Tool to convert Reactor JSON Files to Building Gadgets Strings, for Nomi-CEu!
  </p>

  <Upload>
    <Validation />
  </Upload>
</main>
