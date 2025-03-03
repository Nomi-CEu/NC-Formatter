import { writable } from "svelte/store";

export const rawText = writable(localStorage.rawText || "");

rawText.subscribe((value) => localStorage.rawText = value);
