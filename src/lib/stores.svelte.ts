import { CasingOptions, ModeratorOptions, type NCFormatterStore } from "./types";

const store = $state({
  rawText: "",
  data: undefined,
  dataType: "",
  options: {
    casing: CasingOptions.NONE,
    moderator: ModeratorOptions.EXACT,
    activeCooler: true,
  },
} as NCFormatterStore);

export default store;

export const volume = (store: NCFormatterStore) =>
  (store.data?.dim[0] || 0) * (store.data?.dim[1] || 0) * (store.data?.dim[2] || 0);

export const surfaceArea = (store: NCFormatterStore) =>
  2 * (store.data?.dim[0] || 0) * (store.data?.dim[1] || 0) +
  2 * (store.data?.dim[1] || 0) * (store.data?.dim[2] || 0) +
  2 * (store.data?.dim[2] || 0) * (store.data?.dim[0] || 0);
