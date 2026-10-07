import type { Options } from "$lib/types";
import {
  type BGExport,
  type InternalData,
  type Material,
  type Materials,
  ModeratorOptions,
} from "$lib/types";

export function getMaterials(
  states: number[][][],
  isEmpty: (id: number, data: InternalData) => boolean = id => id === 0,
  getDisplay: (data: InternalData) => string = data => data[0],
  exportId: (id: number, data: InternalData) => number = id => id,
): Materials {
  if (states.length === 0) return { materials: [], empties: 0 };

  const result: Map<number, Material> = new Map<number, Material>();
  let empties: number = 0;

  for (const xRow of states) {
    for (const zRow of xRow) {
      for (const id of zRow) {
        const data = idToMapState.at(id);
        if (!data) continue;

        if (isEmpty(id, data)) {
          empties++;
          continue;
        }

        const display = getDisplay(data);
        const effectiveId = exportId(id, data);
        if (result.has(effectiveId)) {
          const existing = result.get(effectiveId);
          if (existing) existing.amount++;
        } else result.set(effectiveId, { exportId: effectiveId, display, amount: 1 });
      }
    }
  }

  return {
    materials: [...result.values()],
    empties,
  };
}

const graphiteMod: BGExport = {
  display: "Graphite Moderator",
  exportId: 17,
  data: 'Name: "gregtech:meta_block_compressed_21", Properties: { variant: "gregtech__graphite" }',
};
const berylliumMod: BGExport = {
  display: "Beryllium Moderator",
  exportId: 18,
  data: 'Name: "gregtech:meta_block_compressed_0", Properties: { variant: "gregtech__beryllium" }',
};

const air: InternalData = [
  "Air",
  () => {
    return undefined;
  },
];

const moderator = (preferred: BGExport): InternalData => {
  return [
    preferred.display || "",
    (op: Options) => {
      switch (op.moderator) {
        case ModeratorOptions.EXACT:
          return preferred;
        case ModeratorOptions.GRAPHITE:
          return graphiteMod;
        case ModeratorOptions.BERYLLIUM:
          return berylliumMod;
      }
    },
  ];
};

const coolerMap: [string, number][] = [
  ["Water", 2],
  ["Redstone", 3],
  ["Quartz", 4],
  ["Gold", 5],
  ["Glowstone", 6],
  ["Lapis", 7],
  ["Diamond", 8],
  ["Helium", 9],
  ["Enderium", 10],
  ["Cryotheum", 11],
  ["Iron", 12],
  ["Emerald", 13],
  ["Copper", 14],
  ["Tin", 15],
  ["Magnesium", 16],
];

// Internal ID (& Einsteinium ID) to BG State
export const idToMapState: (InternalData | undefined)[] = [
  air, // 0: Air
  [
    "Fuel Cell", // 1: Reactor Cell
    () => {
      return { data: 'Name: "nuclearcraft:cell_block"' };
    },
  ],
];

// 17-18: Moderators (Graphite then Beryllium)
idToMapState[17] = moderator(graphiteMod);
idToMapState[18] = moderator(berylliumMod);

export const casingExportId = 32;

export const activeCoolerExportId = 33;

// Generic Active Cooler (ID 20; Used for Thiz' Reactor Planner Only)
idToMapState[20] = [
  "Active Cooler",
  (op: Options) => {
    if (op.activeCooler)
      return {
        display: "Active Cooler",
        exportId: activeCoolerExportId,
        data: 'Name: "nuclearcraft:active_cooler"',
      };

    return undefined;
  },
];

// Add Coolers and Active Coolers (IDs: 2-16, 34-48)
for (const cooler of coolerMap) {
  idToMapState[cooler[1]] = [
    `${cooler[0]} Cooler`,
    () => {
      return {
        data: `Name: "nuclearcraft:cooler", Properties: { type: "${cooler[0].toLowerCase()}" }`,
      };
    },
  ];
  idToMapState[cooler[1] + 32] = [
    `Active ${cooler[0]} Cooler`,
    (op: Options) => {
      if (op.activeCooler)
        return {
          display: "Active Cooler",
          exportId: activeCoolerExportId,
          data: 'Name: "nuclearcraft:active_cooler"',
        };

      return undefined;
    },
  ];
}

// Keys in Hellrage Format to ignore
// (Exported by Thiz' Reactor Planner; seems to always have no data; and we don't support)
export const ncrpIgnore: Set<string> = new Set<string>([
  "FissionController",
  "Casing",
  "TransparentCasing",
]);

// Hellrage NC Planner Keys to ID
export const ncrpToId: Record<string, number> = {
  "": 17, // (Thiz' Reactor Planner) A moderator. Specify it to graphite
  FuelCell: 1,
  Graphite: 17,
  Beryllium: 18,
  Active: 20, // (Thiz' Reactor Planner) Generic active cooler
};

// Add Coolers and Active Coolers
for (const cooler of coolerMap) {
  ncrpToId[cooler[0]] = cooler[1];
  ncrpToId[`Active ${cooler[0]}`] = cooler[1] + 32;
}
