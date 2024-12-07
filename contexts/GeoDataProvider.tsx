import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ColorMap,
  FileFormat,
  GeoJSON,
  GeoJSONError,
} from "../types/geojson.ts";
import { GeoJSONEndpoint } from "../constants/consts.ts";
import { GeoJSONGeometry, GeoJSONGeometryCollection } from "ol/format/GeoJSON";

type tiffType = {
  url: string;
  min: number;
  max: number;
};
type tiffUrls = {
  MIR: tiffType;
  SWIR: tiffType;
  TIR1: tiffType;
  TIR2: tiffType;
  VIS: tiffType;
  WV: tiffType;
};

type LayerInstance = {
  id: string;
  key: keyof tiffUrls;
};

interface GeoDataContextType {
  geoData: GeoJSON | GeoJSONError | null;
  url: string;
  setUrl: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  selectedAOI: boolean;
  setSelectedAOI: React.Dispatch<React.SetStateAction<boolean>>;
  boundingBox: number[] | null;
  setBoundingBox: React.Dispatch<React.SetStateAction<number[] | null>>;
  tiffUrls: tiffUrls;
  setTiffUrls: React.Dispatch<React.SetStateAction<tiffUrls>>;
  renderArray: LayerInstance[];
  setRenderArray: React.Dispatch<React.SetStateAction<LayerInstance[]>>;
  selectedPolygon: GeoJSONGeometry | GeoJSONGeometryCollection | null;
  setSelectedPolygon: React.Dispatch<
    React.SetStateAction<GeoJSONGeometry | GeoJSONGeometryCollection | null>
  >;
  isPolygonSelectionEnabled: boolean;
  setIsPolygonSelectionEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  processingLevel: string;
  setProcessingLevel: React.Dispatch<React.SetStateAction<string>>;
  startDateTime: string;
  setStartDateTime: React.Dispatch<React.SetStateAction<string>>;
  endDateTime: string;
  setEndDateTime: React.Dispatch<React.SetStateAction<string>>;
  searchResponseData: any;
  setSearchResponseData: React.Dispatch<React.SetStateAction<any>>;
}

const GeoDataContext = createContext<GeoDataContextType | undefined>(undefined);

interface GeoDataProviderProps {
  children: React.ReactNode;
}

interface RequestInfo {
  format: FileFormat;
  rescale: boolean;
  colormap_name?: ColorMap;
}

// Utility function to generate unique IDs
const generateUniqueId = () =>
  `layer-${Math.random().toString(36).substr(2, 9)}`;

export const GeoDataProvider: React.FC<GeoDataProviderProps> = ({
  children,
}) => {
  const [url, setUrl] = useState<string>(
    "https://final-cog.s3.ap-south-1.amazonaws.com/test_cog.tif"
  );
  const [geoData, setGeoData] = useState<GeoJSON | null>(null);
  const [reqInfo, setReqInfo] = useState<RequestInfo>({
    format: "png",
    rescale: false,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedAOI, setSelectedAOI] = useState<boolean>(false);
  const [boundingBox, setBoundingBox] = useState<number[] | null>(null);
  const [selectedPolygon, setSelectedPolygon] = useState<
    GeoJSONGeometry | GeoJSONGeometryCollection | null
  >(null);
  const [tiffUrls, setTiffUrls] = useState({
    MIR: {
      url: "https://somehowgetsplotted.s3.ap-south-1.amazonaws.com/somehowgetsplotted/IMG_MIR_optimized.tif",
      min: 302,
      max: 996,
    },
    SWIR: {
      url: "https://somehowgetsplotted.s3.ap-south-1.amazonaws.com/somehowgetsplotted/IMG_SWIR_optimized.tif",
      min: 11,
      max: 551,
    },
    TIR1: {
      url: "https://somehowgetsplotted.s3.ap-south-1.amazonaws.com/somehowgetsplotted/IMG_TIR1_optimized.tif",
      min: 238,
      max: 961,
    },
    TIR2: {
      url: "https://somehowgetsplotted.s3.ap-south-1.amazonaws.com/somehowgetsplotted/IMG_TIR2_optimized.tif",
      min: 283,
      max: 945,
    },
    VIS: {
      url: "https://somehowgetsplotted.s3.ap-south-1.amazonaws.com/somehowgetsplotted/IMG_VIS_optimized.tif",
      min: 35,
      max: 493,
    },
    WV: {
      url: "https://somehowgetsplotted.s3.ap-south-1.amazonaws.com/somehowgetsplotted/IMG_WV_optimized.tif",
      min: 776,
      max: 998,
    },
  });
  const [isPolygonSelectionEnabled, setIsPolygonSelectionEnabled] =
    useState(false);

  const [renderArray, setRenderArray] = useState<LayerInstance[]>([
    { id: generateUniqueId(), key: "VIS" },
    { id: generateUniqueId(), key: "VIS" },
    { id: generateUniqueId(), key: "TIR1" },
  ]); // Initialize with all layers active

  // New state for processingLevel, startDateTime, endDateTime, and searchResponseData
  const [processingLevel, setProcessingLevel] = useState<string>("");
  const [startDateTime, setStartDateTime] = useState<string>("");
  const [endDateTime, setEndDateTime] = useState<string>("");
  const [searchResponseData, setSearchResponseData] = useState<any>(null);

  // Fetch the GeoJSON data when the URL changes
  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${GeoJSONEndpoint}?url=${url}`);
        if (!response.ok) {
          throw new Error("Failed to fetch geo data");
        }
        const data: GeoJSON = await response.json();
        setGeoData(data);
        setLoading(false);
      } catch (err) {
        setGeoData(null);
        setLoading(false);
      }
    };

    fetchGeoData();
  }, [url]);

  return (
    <GeoDataContext.Provider
      value={{
        geoData,
        url,
        setUrl,
        loading,
        setLoading,
        selectedAOI,
        setSelectedAOI,
        boundingBox,
        setBoundingBox,
        tiffUrls,
        setTiffUrls,
        renderArray,
        setRenderArray,
        selectedPolygon,
        setSelectedPolygon,
        isPolygonSelectionEnabled,
        setIsPolygonSelectionEnabled,
        processingLevel,
        setProcessingLevel,
        startDateTime,
        setStartDateTime,
        endDateTime,
        setEndDateTime,
        searchResponseData,
        setSearchResponseData
      }}
    >
      {children}
    </GeoDataContext.Provider>
  );
};

// Custom hook to access geo data
export const useGeoData = (): GeoDataContextType => {
  const context = useContext(GeoDataContext);
  if (!context) {
    throw new Error("useGeoData must be used within a GeoDataProvider");
  }
  return context;
};
