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
type colormapSettings = {
  type: string,
  min: number,
  max: number,
  steps: number,
  reverse: boolean,
  alpha: number,
  brightness: number,
  contrast: number,
  saturation: number,
  exposure: number,
  hueshift: number,
  verticalExaggeration: number,
  sunElevation: number,
  sunAzimuth: number,
}

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
  selectedIndex: string;
  setSelectedIndex: React.Dispatch<React.SetStateAction<string>>;
  colormapSettings: colormapSettings;
  setColormapSettings: React.Dispatch<React.SetStateAction<colormapSettings>>;
  defaultLayer: string;
  setDefaultLayer: React.Dispatch<React.SetStateAction<string>>;
  reqInfo:any;
  setReqInfo:any;
  metadata:any,
  setMetadata:React.Dispatch<React.SetStateAction<any>>;
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
  const [selectedIndex, setSelectedIndex] = useState("none");
  const [colormapSettings, setColormapSettings] = useState({
    type: "viridis",
    min: 0,
    max: 1,
    steps: 10,
    reverse: true,
    alpha: 0.75,
    brightness: 0,
    contrast: 0.5,
    saturation: 0.5,
    exposure: 0.5,
    hueshift: 0,
    verticalExaggeration: 1.0,
    sunElevation: 45,
    sunAzimuth: 315,
  });
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
    SWIR: {
      url: "https://final-cog.s3.ap-south-1.amazonaws.com/3RIMG_04SEP2024_1015_L1B_STD_V01R00/IMG_SWIR_cog.tif",
      min: 0,
      max: 0.232,
    },
    MIR: {
      url: "https://final-cog.s3.ap-south-1.amazonaws.com/3RIMG_04SEP2024_1015_L1B_STD_V01R00/IMG_MIR_cog.tif",
      min: 11,
      max: 551,
    },
    TIR1: {
      url: "https://final-cog.s3.ap-south-1.amazonaws.com/3RIMG_04SEP2024_1015_L1B_STD_V01R00/IMG_TIR1_cog.tif",
      min: 238,
      max: 961,
    },
    TIR2: {
      url: "https://final-cog.s3.ap-south-1.amazonaws.com/3RIMG_04SEP2024_1015_L1B_STD_V01R00/IMG_TIR2_cog.tif",
      min: 283,
      max: 945,
    },
    VIS: {
      url: "https://final-cog.s3.ap-south-1.amazonaws.com/3RIMG_04SEP2024_1015_L1B_STD_V01R00/IMG_VIS_cog.tif",
      min: 35,
      max: 493,
    },
    WV: {
      url: "https://final-cog.s3.ap-south-1.amazonaws.com/3RIMG_04SEP2024_1015_L1B_STD_V01R00/IMG_WV_cog.tif",
      min: 776,
      max: 998,
    },
  });

  const [isPolygonSelectionEnabled, setIsPolygonSelectionEnabled] =
    useState(false);

  const [defaultLayer, setDefaultLayer] = useState<any>("SWIR");
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
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    const updateRenderArray = () => {
      switch (selectedIndex) {
        case "none":
          setRenderArray([
            { id: generateUniqueId(), key: defaultLayer },
          ]);
          break;
        case "ndvi":
        case "evi":
        case "savi":
        case "msavi":
        case "ndsi":
          setRenderArray([
            { id: generateUniqueId(), key: "VIS" },
            { id: generateUniqueId(), key: "SWIR" },
          ]);
          break;
        case "ndwi":
          setRenderArray([
            { id: generateUniqueId(), key: "SWIR" },
            { id: generateUniqueId(), key: "MIR" },
          ]);
          break;
        case "btt":
        case "olr":
        case "cloudmask":
          setRenderArray([
            { id: generateUniqueId(), key: "TIR1" },
            { id: generateUniqueId(), key: "TIR2" },
          ]);
          break;
        case "uth":
        case "amv":
        case "wvc":
          setRenderArray([
            { id: generateUniqueId(), key: "WV" },
            { id: generateUniqueId(), key: "TIR1" },
          ]);
          break;
          default:
            setRenderArray([
              { id: generateUniqueId(), key: "VIS" },
              { id: generateUniqueId(), key: "TIR1" },
            ]);
            break;
      }
    };

    updateRenderArray();
  }, [selectedIndex, defaultLayer]);

  useEffect(() => {
    console.log("searchResponseData", searchResponseData);
    if (!searchResponseData) return
    setTiffUrls(searchResponseData)
  }, [searchResponseData])
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
        setSearchResponseData,
        selectedIndex,
        setSelectedIndex,
        colormapSettings,
        defaultLayer,
        setDefaultLayer,
        setColormapSettings,
        reqInfo,
        setReqInfo,
        metadata,
        setMetadata
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
