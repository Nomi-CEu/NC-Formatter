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

const graphiteMod: BGExport = {
  Name: "gregtech:meta_block_compressed_12",
  Properties: { variant: "gregtech__graphite" },
};
const berylliumMod: BGExport = {
  Name: "gregtech:meta_block_compressed_2",
  Properties: { variant: "gregtech__beryllium" },
};

const air = () => undefined;

const moderator = (preferred: BGExport) => {
  return (op: Options) => {
    if (op.moderator === "EXACT") return preferred;
    if (op.moderator === "GRAPHITE") return graphiteMod;
    if (op.moderator === "BERYLLIUM") return berylliumMod;
  };
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
export const idToMapState: (((op: Options) => BGExport | undefined) | undefined)[] = [
  air, // 0: Air
  () => {
    return { Name: "nuclearcraft:cell_block" };
  }, // 1: Reactor Cell
];

// Add Coolers and Active Coolers (IDs: 2-16, 34-48)
for (const cooler of coolerMap) {
  idToMapState[cooler[1]] = () => {
    return {
      Name: "nuclearcraft:cooler",
      Properties: { type: cooler[0].toLowerCase() },
    };
  };
  idToMapState[cooler[1] + 32] = (op: Options) => {
    if (op.activeCooler) return { Name: "nuclearcraft:active_cooler" };
    return undefined;
  };
}

// 17-18: Moderators (Graphite then Beryllium)
idToMapState[17] = moderator(graphiteMod);
idToMapState[18] = moderator(berylliumMod);

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

// Debug
console.debug("Starting Debug:");
console.debug("Starting Debug Print of NCRP to ID Map:");
console.debug(JSON.stringify(ncrpToId, null, 2));
console.debug("Starting Debug Print of ID to BG Map:");
let debug = "[";
for (let i = 0; i < idToMapState.length; i++) {
  const map = idToMapState[i];
  if (!map) {
    debug += `\n  ${i}: undefined,`;
    continue;
  }

  debug += `\n  ${i}: ${JSON.stringify(map({ casings: "NONE", activeCooler: true, moderator: "EXACT" })) || "air"},`;
}
console.debug(debug + "\n]");
console.debug("End Debug Print.");
