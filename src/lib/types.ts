export interface NCFormatterStore {
  rawText: string;
  data: Data | undefined;
  dataType: "Einsteinium" | "Hellrage" | "";
  options: Options;
}

export interface Data {
  dim: number[];
  states: number[][][];
}

export interface Options {
  casing: CasingOptions;
  moderator: ModeratorOptions;
  activeCooler: boolean;
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
  // Only set if options change the effective id (in BG Export)
  exportId?: number;
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
  exportId: number;
  amount: number;
}

export interface Materials {
  materials: Material[];
  empties: number;
}

export type InternalData = [string, (op: Options) => BGExport | undefined];
