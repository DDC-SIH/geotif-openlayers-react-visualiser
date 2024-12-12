export interface TiffInfo {
    bounds: number[];
    minzoom: number;
    maxzoom: number;
    band_metadata: [string, Record<string, unknown>][];
    band_descriptions: [string, string][];
    dtype: string;
    nodata_type: string | null;
    colorinterp: string[];
    scales: number[];
    offsets: number[];
    driver: string;
    count: number;
    width: number;
    height: number;
    overviews: number[];
    statistics?: {
      [key: string]: {
        min: number;
        max: number;
        mean: number;
        count: number;
        sum: number;
        std: number;
        median: number;
        majority: number;
        minority: number;
        unique: number;
        histogram: [number[], number[]];
        valid_percent: number;
        masked_pixels: number;
        valid_pixels: number;
        percentile_2: number;
        percentile_98: number;
      };
    };
  }
  
  export interface BoundingBox {
    minx: number;
    miny: number;
    maxx: number;
    maxy: number;
  }
  
  