import { CasingOptions, type Data, ModeratorOptions } from "./data";

export interface NCFormatterStore {
  rawText: string;
  data: Data | undefined;
  dataType: "Einsteinium" | "Hellrage" | "";
  casingOp: CasingOptions;
  moderatorOp: ModeratorOptions;
  activeCoolerOp: boolean;
}

const store = $state({
  rawText: "",
  data: undefined,
  dataType: "",
  casingOp: "NONE",
  moderatorOp: "EXACT",
  activeCoolerOp: true,
} as NCFormatterStore);

export default store;

export const volume = (store: NCFormatterStore) =>
  (store.data?.dim[0] || 0) * (store.data?.dim[1] || 0) * (store.data?.dim[2] || 0);

export const surfaceArea = (store: NCFormatterStore) =>
  2 * (store.data?.dim[0] || 0) * (store.data?.dim[1] || 0) +
  2 * (store.data?.dim[1] || 0) * (store.data?.dim[2] || 0) +
  2 * (store.data?.dim[2] || 0) * (store.data?.dim[0] || 0);
