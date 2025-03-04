export interface Data {
  dim: number[];
  states: number[][][];
}

export interface Options {
  moderator: "EXACT" | "BERYLLIUM" | "GRAPHITE";
  activeCooler: boolean;
  casings: "NONE" | "SOLID" | "TRANSPARENT";
}

export interface BGExport {
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

export type InternalData = [string, (op: Options) => BGExport | undefined];

const graphiteMod: BGExport = {
  Name: "gregtech:meta_block_compressed_12",
  Properties: { variant: "gregtech__graphite" },
};
const berylliumMod: BGExport = {
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
    (op: Options) => {
      if (op.moderator === "EXACT") return preferred;
      if (op.moderator === "GRAPHITE") return graphiteMod;
      if (op.moderator === "BERYLLIUM") return berylliumMod;
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
    (op: Options) => {
      if (op.activeCooler) return { Name: "nuclearcraft:active_cooler" };

      return undefined;
    },
  ];
}

// 17-18: Moderators (Graphite then Beryllium)
idToMapState[17] = moderator("Graphite Moderator", graphiteMod);
idToMapState[18] = moderator("Beryllium Moderator", berylliumMod);

// 19: Casing (Unused, Just Map to Air)
idToMapState[19] = air;

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
