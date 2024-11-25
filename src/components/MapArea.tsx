import { useEffect, useRef, useState } from "react";
import GeoJSON from "ol/format/GeoJSON.js";
import "ol/ol.css"; // OpenLayers CSS
import { Map, View } from "ol";
import TileLayer from "ol/layer/WebGLTile";
import GeoTIFF from "ol/source/GeoTIFF";
import colormap from "colormap";
import { applyTransform } from "ol/extent";
import {
  get as getProjection,
  getTransform,
  fromLonLat,
} from "ol/proj";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { StadiaMaps } from "ol/source";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { defaults as defaultControls, ZoomToExtent, Zoom } from "ol/control";
import { defaults as defaultInteractions } from "ol/interaction";
import MapSideBar from "./MapSideBar";

const citiesData = [
  {
    name: "New Delhi",
    code: "IN:DEL",
    proj4def: "+proj=longlat +datum=WGS84 +no_defs",
    bbox: [77.0369, 28.6139, 77.3616, 28.859], // Example bounding box for New Delhi
  },
  {
    name: "Mumbai",
    code: "IN:MUM",
    proj4def: "+proj=longlat +datum=WGS84 +no_defs",
    bbox: [72.7397, 18.9282, 72.9447, 19.307], // Example bounding box for Mumbai
  },
  {
    name: "Bangalore",
    code: "IN:BLR",
    proj4def: "+proj=longlat +datum=WGS84 +no_defs",
    bbox: [77.5043, 12.9, 77.69, 13.2015], // Example bounding box for Bangalore
  },
  {
    name: "Chennai",
    code: "IN:CHE",
    proj4def: "+proj=longlat +datum=WGS84 +no_defs",
    bbox: [80.1161, 13.0475, 80.287, 13.302], // Example bounding box for Chennai
  },
  {
    name: "India",
    code: "IN",
    proj4def: "+proj=longlat +datum=WGS84 +no_defs",
    bbox: [68.1766, 6.4627, 97.4026, 35.5175], // Bounding box for all of India
  },
];

const GeoTIFFMap = () => {
  const tiffUrl =
    "https://final-cog.s3.ap-south-1.amazonaws.com/3RIMG_04SEP2024_1015_L2C_INS_V01R00_INS_cog.tif"; // URL to the GeoTIFF file
  const mapRef = useRef<HTMLDivElement>(null); // Reference to the map container
  const mapInstanceRef = useRef<Map | null>(null); // New ref for map instance
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState<string | null>(null);
  const [colormapSettings, setColormapSettings] = useState({
    type: "none",
    min: 0,
    max: 1,
    steps: 10,
    reverse: true,
    alpha: 0.7,
  });
  const [tiffLayer, setTiffLayer] = useState<TileLayer<GeoTIFF> | null>(null);

  function getColorStops(
    name: string,
    min: number,
    max: number,
    steps: number,
    reverse: boolean,
    alpha: number
  ) {
    if (name === "none") {
      return [];
    }
    const delta = (max - min) / (steps - 1);
    const stops = new Array(steps * 2);
    let colors = colormap({
      colormap: name,
      nshades: steps,
      format: "rgba",
      alpha: alpha,
    });
    if (reverse) {
      colors.reverse();
    }
    // Manually add a transparent stop for NoData values
    stops[0] = min;
    stops[1] = "rgba(0,0,0,0)";
    for (let i = 1; i < steps; i++) {
      stops[i * 2] = min + i * delta;
      stops[i * 2 + 1] = colors[i];
    }
    return stops;
  }

  const setProjection = (
    code: string | null,
    name: string | null,
    proj4def: string | null,
    bbox: number[] | null
  ) => {
    if (code === null || name === null || proj4def === null || bbox === null) {
      alert("No results found, using default projection (EPSG:3857)");
      mapInstanceRef.current?.setView(
        new View({
          projection: "EPSG:3857",
          center: [0, 0],
          zoom: 2,
        })
      );
      return;
    }

    proj4.defs(code, proj4def);
    register(proj4);
    const newProj = getProjection(code);
    if (!newProj) {
      alert("No results found, using default projection (EPSG:3857)");
      mapInstanceRef.current?.setView(
        new View({
          projection: "EPSG:3857",
          center: [0, 0],
          zoom: 2,
        })
      );
      return;
    }
    const fromLonLat = getTransform("EPSG:4326", newProj);
    newProj.setWorldExtent(bbox);

    if (bbox[0] > bbox[2]) {
      bbox[2] += 360; // Handle world extent across the dateline
    }

    const extent = applyTransform(bbox, fromLonLat, undefined, 8);
    newProj.setExtent(extent);
    const newView = new View({
      projection: newProj,
    });
    mapInstanceRef.current?.setView(newView);
    newView.fit(extent);
  };

  const search = (query: string) => {
    // Find the city or country from the predefined array
    const result = citiesData.find(
      (item) => item.name.toLowerCase() === query.toLowerCase()
    );

    if (result) {
      const { name, code, proj4def, bbox } = result;

      if (code && proj4def && bbox && bbox.length === 4) {
        setProjection(code, name, proj4def, bbox);
      }
    } else {
      alert("No results found");
    }
  };
  const clipLayer = new VectorLayer({
    style: null,
    source: new VectorSource({
      url: "./india-osm.geojson",
      format: new GeoJSON(),
    }),
  });
  const background = new TileLayer({
    className: "toner",
    source: new StadiaMaps({
      layer: "stamen_toner",
    }),
  });
  const updateColormap = () => {
    if (tiffLayer) {
      if (colormapSettings.type === "none") {
        tiffLayer.setStyle({}); // Remove colormap style
      } else {
        tiffLayer.setStyle({
          color: [
            "interpolate",
            ["linear"],
            ["/", ["band", 1], 2],
            ...getColorStops(
              colormapSettings.type,
              Math.min(colormapSettings.min, colormapSettings.max), // Ensure min value is <= max value
              Math.max(colormapSettings.min, colormapSettings.max), // Ensure max value is >= min value
              colormapSettings.steps,
              colormapSettings.reverse,
              colormapSettings.alpha
            ),
          ],
          opacity: [
            "case",
            ["<", ["band", 1], 0], // Ensure NoData values are always transparent
            0, // Transparent
            1, // Opaque
          ],
        });
      }
    }
  };

  useEffect(() => {
    updateColormap();
  }, [colormapSettings]);

  const fetchGeoTIFF = async () => {
    const geoTIFFSource = new GeoTIFF({
      sources: [
        {
          url: tiffUrl,
          bands: [1],
          min: 26,
          max: 461,
        },
      ],
    });

    const layer = new TileLayer({
      source: geoTIFFSource,
    });

    setTiffLayer(layer);

    const openLayersMap = new Map({
      target: mapRef.current as HTMLElement,
      layers: [background, layer],
      controls: defaultControls().extend([
        new Zoom(),
        new ZoomToExtent({
          extent: [
            68.1766,
            6.4627,
            97.4026,
            35.5175, // India's extent
          ],
        }),
      ]),
      interactions: defaultInteractions({
        pinchRotate: false,
        doubleClickZoom: true,
        mouseWheelZoom: true,
      }),
      view: new View({
        center: fromLonLat([78.9629, 20.5937]), // India center coordinates
        zoom: 5,
        maxZoom: 19,
        minZoom: 2,
      }),
    });

    mapInstanceRef.current = openLayersMap;

    // Apply initial colormap
    updateColormap();
  };

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      fetchGeoTIFF();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      <style jsx global>{`
        .ol-zoom {
          top: 4em;
          left: 0.5em;
        }
        .ol-control button {
          background-color: rgba(255, 255, 255, 0.8);
          color: #666;
        }
        .ol-control button:hover {
          background-color: rgba(255, 255, 255, 1);
        }
        html,
        body {
          overscroll-behavior-y: none;
          touch-action: none;
        }
      `}</style>

      {/* UI Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Sidebar */}
        <MapSideBar colormapSettings={colormapSettings} setColormapSettings={setColormapSettings}/>
    

        {/* Search Bar */}
        <div className="fixed left-4 top-4 pointer-events-auto z-50">
          <div className="flex items-center bg-white backdrop-blur-md rounded-full p-2 shadow-lg overflow-hidden">
            <div
              className={cn(
                "transition-all duration-300 ease-in-out",
                isSearchOpen ? "w-[200px] opacity-100" : "w-0 opacity-0 hidden"
              )}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location..."
                className="h-9 border-none bg-transparent px-2 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    search(searchQuery);
                  }
                }}
              />
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>


        
      </div>
      <div ref={mapRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default GeoTIFFMap;
