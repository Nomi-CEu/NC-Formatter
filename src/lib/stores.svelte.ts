import { type Data } from "./data";

interface Store {
  rawText: string;
  data: Data | undefined;
  dataType: "Einsteinium" | "Hellrage" | "";
}

const store = $state({
  rawText: "",
  data: undefined,
  dataType: "",
} as Store);

export default store;
