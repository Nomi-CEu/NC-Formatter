import {type Writable, writable} from "svelte/store";
import {type Data} from "../data/data";

export const rawText: Writable<string> = writable(localStorage.rawText || "");

rawText.subscribe((value) => localStorage.rawText = value);

export const data: Writable<Data | undefined> = writable();

