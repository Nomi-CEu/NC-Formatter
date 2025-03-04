import {type Writable, writable} from "svelte/store";
import {type Data} from "../data/data";

export const rawText: Writable<string> = writable("");
export const data: Writable<Data | undefined> = writable();

