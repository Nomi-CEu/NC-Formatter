<script lang="ts">
  import store from "./stores.svelte";
  import einsteinium from "../validators/einsteinium.json";
  import ncrp from "../validators/ncrp.json";
  import { type EinsteiniumSchema, idToMapState, type NCRPSchema, ncrpToId } from "./data";
  import { fade } from "svelte/transition";
  import Ajv from "ajv";

  let { children } = $props();

  let errorMsg = $state("");
  let errorReason = $state("");
  let errorFix = $state("");
  let success = $state(false);

  const einsteiniumValidation =
    "This is a string of text that only Einsteinium's data files should have and is used to validate the JSON. Einsteinium is a tool to help you plan NuclearCraft fission reactors. grhe3uy48er9tfijrewiorf.";

  const validatePos = (pos: number, name: string, size: number) => {
    if (pos < 1 || pos > size) {
      errorMsg = "Invalid Reactor Position!";
      errorReason = `Pos ${name} must be between 1 and ${size}, found ${pos}.`;
      return false;
    }
    return true;
  };

  const validateSize = (size: number, name: string) => {
    if (size < 1 || size > 24) {
      errorMsg = "Invalid Reactor Size!";
      errorReason = `Size ${name} must be between 1 and 24, found ${size}.`;
      return false;
    }
    return true;
  };

  const ajv = new Ajv();
  const einsteiniumValidator = ajv.compile(einsteinium);
  const ncrpValidator = ajv.compile(ncrp);

  /**
   * Returns whether we should try to parse another format.
   */
  function parseEinsteinium(inputData: Record<string, unknown>): boolean {
    if (!inputData.metadata || !inputData.content) return true;

    // Validate Types
    if (!einsteiniumValidator(inputData)) {
      errorMsg = "Invalid Einsteinium JSON!";
      errorReason = einsteiniumValidator.errors?.at(0)?.toString() || "";
      errorFix = "Did you import the correct file?";
      return false;
    }

    const foundData = inputData as unknown as EinsteiniumSchema;

    // Validate Code
    if (foundData.metadata.validationCode !== einsteiniumValidation) {
      errorMsg = "Invalid Einsteinium JSON!";
      errorReason = `Invalid validation code: found '${foundData.metadata.validationCode}', expected '${einsteiniumValidation}'`;
      errorFix = "Did you import the correct file?";
      return false;
    }

    // Validate Dimensions
    const [x, y, z] = foundData.metadata.dimensions;

    if (!validateSize(x, "X")) return false;
    if (!validateSize(y, "Y")) return false;
    if (!validateSize(z, "Z")) return false;

    // Validate Content Size and Content IDs
    if (foundData.content.length != y) {
      errorMsg = "Invalid Reactor Content!";
      errorReason = `Expected size Y of ${y}, found size ${foundData.content.length} in content.`;
      return false;
    }

    for (const xRow of foundData.content) {
      if (xRow.length !== x) {
        errorMsg = "Invalid Reactor Content!";
        errorReason = `Expected size X of ${x}, found size ${xRow.length} in content.`;
        return false;
      }

      for (const zRow of xRow) {
        if (zRow.length !== z) {
          errorMsg = "Invalid Reactor Content!";
          errorReason = `Expected size Z of ${z}, found size ${zRow.length} in content.`;
          return false;
        }

        for (const id of zRow) {
          if (id < 0 || id >= idToMapState.length || !idToMapState[id]) {
            errorMsg = "Invalid Reactor Content!";
            errorReason = `Invalid ID ${id} in content.`;
            return false;
          }
        }
      }
    }

    // Valid: Set Data
    store.data = { dim: foundData.metadata.dimensions, states: foundData.content };
    success = true;
    store.dataType = "Einsteinium";
    return false;
  }

  /**
   * Returns whether we should try to parse another format.
   */
  function parseNcrp(inputData: Record<string, unknown>): boolean {
    if (!inputData.InteriorDimensions || !inputData.CompressedReactor) return true;

    // Validate Types
    if (!ncrpValidator(inputData)) {
      errorMsg = "Invalid Hellrage Planner JSON!";
      errorReason = ncrpValidator.errors?.at(0)?.toString() || "";
      errorFix = "Did you import the correct file?";
      return false;
    }

    const foundData = inputData as unknown as NCRPSchema;

    // Validate Dimensions
    const x = foundData.InteriorDimensions.X;
    const y = foundData.InteriorDimensions.Y;
    const z = foundData.InteriorDimensions.Z;

    if (!validateSize(x, "X")) return false;
    if (!validateSize(y, "Y")) return false;
    if (!validateSize(z, "Z")) return false;

    const states: number[][][] = [];

    for (let i = 0; i < y; i++) {
      states[i] = [];
      for (let j = 0; j < x; j++) {
        states[i][j] = [];
        for (let k = 0; k < z; k++) {
          states[i][j][k] = 0;
        }
      }
    }

    // Validate Content Positions and Content Names
    for (const key of Object.keys(foundData.CompressedReactor)) {
      if (!(key in ncrpToId)) {
        errorMsg = "Invalid Reactor Content!";
        errorReason = `Invalid type '${key}' in content.`;
        return false;
      }

      const id = ncrpToId[key];
      const item = foundData.CompressedReactor[key];
      for (const pos of item) {
        if (!validatePos(pos.X, "X", x)) return false;
        if (!validatePos(pos.Y, "Y", y)) return false;
        if (!validatePos(pos.Z, "Z", z)) return false;

        if (states[pos.Y - 1][pos.X - 1][pos.Z - 1] !== 0) {
          errorMsg = "Invalid Reactor Content!";
          errorReason = `Duplicate position (${pos.X}, ${pos.Y}, ${pos.Z}) in content.`;
          return false;
        }
        states[pos.Y - 1][pos.X - 1][pos.Z - 1] = id;
      }
    }

    // Valid: Set Data
    store.data = { dim: [x, y, z], states };
    success = true;
    store.dataType = "Hellrage";

    return false;
  }

  $effect(() => {
    errorMsg = "";
    errorReason = "";
    errorFix = "";
    success = false;
    store.dataType = "";
    store.data = undefined;

    if (!store.rawText) return;

    let obj: Record<string, unknown>;
    try {
      obj = JSON.parse(store.rawText);
    } catch (e) {
      errorMsg = "Invalid JSON:";
      errorReason = e?.toString() || "";
      errorFix = "Did you import the correct file?";
      return;
    }

    // Try Einsteinium Format
    if (parseEinsteinium(obj)) {
      // Try NCRP Format
      if (parseNcrp(obj)) {
        errorMsg = "Invalid JSON Format!";
        errorReason = "Only Hellrage and Einsteinium formats are accepted.";
        return;
      }
    }
  });
</script>

<h2 class="title">Step 2: Validation</h2>
<p class="subtitle">Please Check that the Imported Reactor Data is Correct.</p>
<hr class="separator" />
{#if errorMsg}
  <h3 class="title !mr-auto !mb-4 !ml-0 !text-left text-red-400">Error:</h3>
  <p class="text-text font-title text-lg font-bold">{errorMsg}</p>
  {#if errorFix}
    <p class="text-text mt-2">{errorFix}</p>
  {/if}
  {#if errorReason}
    <p class="text-text/50 mt-1 italic">{errorReason}</p>
  {/if}
{:else if success}
  <div in:fade>
    {@render children()}
  </div>
{/if}
