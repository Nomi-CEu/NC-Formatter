import type { NCFormatterStore } from "$lib/stores.svelte";

export interface Data {
  dim: number[];
  states: number[][][];
}

export enum CasingOptions {
  NONE = "NONE",
  SOLID = "SOLID",
  TRANSPARENT = "TRANSPARENT",
}

export enum ModeratorOptions {
  EXACT = "EXACT",
  GRAPHITE = "GRAPHITE",
  BERYLLIUM = "BERYLLIUM",
}

export interface BGExport {
  // Only set if options change the display (in final build materials)
  display?: string;
  Name: string;
  Properties?: Record<string, string>;
}

export interface EinsteiniumSchema {
  metadata: {
    validationCode: string;
    dimensions: number[];
  };
  content: number[][][];
}

export interface NCRPSchema {
  InteriorDimensions: NCRPPos;
  CompressedReactor: Record<string, NCRPPos[]>;
}

export interface NCRPPos {
  X: number;
  Y: number;
  Z: number;
}

export interface Material {
  display: string;
  amount: number;
}

export interface Materials {
  materials: Material[];
  empties: number;
}

export type InternalData = [string, (op: NCFormatterStore) => BGExport | undefined];

export function getMaterials(
  states: number[][][],
  isEmpty: (id: number, data: InternalData) => boolean = id => id === 0,
  getDisplay: (data: InternalData) => string = data => data[0],
): Materials {
  if (states.length === 0) return { materials: [], empties: 0 };

  const result: Map<string, Material> = new Map<string, Material>();
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
        if (result.has(display)) {
          const existing = result.get(display);
          if (existing) existing.amount++;
        } else result.set(display, { display, amount: 1 });
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
  Name: "gregtech:meta_block_compressed_12",
  Properties: { variant: "gregtech__graphite" },
};
const berylliumMod: BGExport = {
  display: "Beryllium Moderator",
  Name: "gregtech:meta_block_compressed_2",
  Properties: { variant: "gregtech__beryllium" },
};

const air: InternalData = [
  "Air",
  () => {
    return undefined;
  },
];

const moderator = (display: string, preferred: BGExport): InternalData => {
  return [
    display,
    (op: NCFormatterStore) => {
      switch (op.moderatorOp) {
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
      return { Name: "nuclearcraft:cell_block" };
    },
  ],
];

// Add Coolers and Active Coolers (IDs: 2-16, 34-48)
for (const cooler of coolerMap) {
  idToMapState[cooler[1]] = [
    `${cooler[0]} Cooler`,
    () => {
      return {
        Name: "nuclearcraft:cooler",
        Properties: { type: cooler[0].toLowerCase() },
      };
    },
  ];
  idToMapState[cooler[1] + 32] = [
    `Active ${cooler[0]} Cooler`,
    (op: NCFormatterStore) => {
      if (op.activeCoolerOp)
        return { display: "Active Cooler", Name: "nuclearcraft:active_cooler" };

      return undefined;
    },
  ];
}

// 17-18: Moderators (Graphite then Beryllium)
idToMapState[17] = moderator(graphiteMod.display || "", graphiteMod);
idToMapState[18] = moderator(berylliumMod.display || "", berylliumMod);

// Hellrage NC Planner Keys to ID
export const ncrpToId: Record<string, number> = {
  FuelCell: 1,
  Graphite: 17,
  Beryllium: 18,
};

// Add Coolers and Active Coolers
for (const cooler of coolerMap) {
  ncrpToId[cooler[0]] = cooler[1];
  ncrpToId[`Active ${cooler[0]}`] = cooler[1] + 32;
}
