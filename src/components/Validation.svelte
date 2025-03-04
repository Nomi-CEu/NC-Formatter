<script lang="ts">
    import { rawText, data } from "../storage/currentProcessing.ts";
    import einsteinium from "../validators/einsteinium.json";
    import {Validator} from "jsonschema";
    import {type EinsteiniumSchema, idToMapState} from "../data/data.ts";

    let errorMsg = $state("");
    let errorReason = $state("");
    let errorFix = $state("");
    let success = $state(false);
    let dataType = $state("");

    const einsteiniumValidation = "This is a string of text that only Einsteinium's data files should have and is used to validate the JSON. Einsteinium is a tool to help you plan NuclearCraft fission reactors. grhe3uy48er9tfijrewiorf.";

    const validateSize = (size: number, name: string) => {
        if (size < 1 || size > 24) {
            errorMsg = "Invalid Reactor Size!";
            errorReason = `Size ${name} must be between 1 and 24, found ${size}.`;
            return false;
        }
        return true;
    };

    /**
     * Returns whether we should try to parse another format.
     */
    function parseEinsteinium(inputData: Record<string, unknown>): boolean {
        if (!inputData.metadata || !inputData.content) return true;

        // Validate Types
        const result = new Validator().validate(inputData, einsteinium);
        if (!result.valid) {
            errorMsg = "Invalid Einsteinium JSON!";
            errorReason = result.errors.at(0)?.toString() || "";
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
        const x = foundData.metadata.dimensions[0];
        const y = foundData.metadata.dimensions[1];
        const z = foundData.metadata.dimensions[2];

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
        data.set({ dim: foundData.metadata.dimensions, states: foundData.content });
        success = true;
        dataType = "Einsteinium";
        return false;
    }

    /**
     * Returns whether we should try to parse another format.
     */
    function parseNcrp(inputData: Record<string, unknown>): boolean {
        return true;
    }

    $effect(() => {
        errorMsg = "";
        errorReason = "";
        errorFix = "";
        success = false;
        dataType = "";
        data.set(undefined);

        if (!$rawText) return;

        let obj: Record<string, unknown>;
        try {
            obj = JSON.parse($rawText);
        } catch (e) {
            errorMsg = "Invalid JSON:";
            errorReason = e?.toString() || "";
            errorFix = "Did you import the correct file?"
            return;
        }

        // Try Einsteinium Format
        if (parseEinsteinium(obj)) {
            // Try NCRP Format
            if (parseNcrp(obj)) {
                errorMsg = "Invalid JSON Format!";
                errorReason = "Only Hellrage and Einsteinium formats are accepted."
                return;
            }
        }
    })

</script>

{#if errorMsg}
    <h3 class="title text-red-400 !ml-0 !mr-auto !text-left !mb-4">Error:</h3>
    <p class="text-text font-bold text-lg font-title">{errorMsg}</p>
    {#if errorFix}
        <p class="text-text mt-2">{errorFix}</p>
    {/if}
    {#if errorReason}
        <p class="text-text/50 italic mt-1">{errorReason}</p>
    {/if}
{:else if success}
    <h3 class="title !ml-0 !mr-auto !text-left !mb-4">Successfully Validated!</h3>
    <p class="text-text">Imported: {dataType}<br>Dimensions: {$data?.dim[0]} x {$data?.dim[1]} x {$data?.dim[2]}</p>
{/if}
