import { Info, Filter, Sparkles, MapIcon, DownloadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Information from "./Information";
import Filters from "./Filters";
import Effects from "./Effects";
import { mapSources } from "@/utils/mapSourcces";
import TileLayer from "ol/layer/Tile";
import Export from "./Export";

interface ColormapSettings {
  type: string;
  min: number;
  max: number;
  steps: number;
  alpha: number;
  reverse: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
  exposure: number;
  hueshift: number;
}

function MapSideBar({
  colormapSettings,
  setColormapSettings,
  setBasemapLayer,
  selectedIndex,
  setSelectedIndex,
}: {
  colormapSettings: ColormapSettings;
  setColormapSettings: any;
  setBasemapLayer: (layer: TileLayer) => void;
  selectedIndex: string;
  setSelectedIndex: (value: string) => void;
}) {
  const [activeSidebar, setActiveSidebar] = useState<string | null>(null);
  const [selectedMap, setSelectedMap] = useState(mapSources[1].name);

  return (
    <div className="fixed right-4 top-4 flex flex-col gap-2 pointer-events-auto z-50">
      {/* Icons Bar */}
      <div
        className={`bg-white z-50  shadow-lg rounded-lg p-3 flex flex-col gap-3 ${activeSidebar ? "shadow-lg" : "shadow-none"
          }`}
      >
        {/* <Button
          size="icon"
          variant={activeSidebar MapIcon" ? "default" : "ghost"}
          className="rounded-full"
          onClick={() =>
            setActiveSidebar(activeSidebar MapIcon" ? nulMapIcon")
          }
        >
  MapIcon className="h-4 w-4" />
        </Button> */}
        <Button
          size="icon"
          variant={activeSidebar === "info" ? "default" : "ghost"}
          className="rounded-full"
          onClick={() =>
            setActiveSidebar(activeSidebar === "info" ? null : "info")
          }
        >
          <Info className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={activeSidebar === "basemap" ? "default" : "ghost"}
          className="rounded-full"
          onClick={() =>
            setActiveSidebar(activeSidebar === "basemap" ? null : "basemap")
          }
        >
          <MapIcon className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={activeSidebar === "filters" ? "default" : "ghost"}
          className="rounded-full"
          onClick={() =>
            setActiveSidebar(activeSidebar === "filters" ? null : "filters")
          }
        >
          <Filter className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={activeSidebar === "effects" ? "default" : "ghost"}
          className="rounded-full"
          onClick={() =>
            setActiveSidebar(activeSidebar === "effects" ? null : "effects")
          }
        >
          <Sparkles className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={activeSidebar === "export" ? "default" : "ghost"}
          className="rounded-full"
          onClick={() =>
            setActiveSidebar(activeSidebar === "export" ? null : "export")
          }
        >
          <DownloadCloud className="h-4 w-4" />
        </Button>
      </div>

      {/* Expandable Section */}
      <div
        className={cn(
          "fixed right-[65px] top-0 h-[-webkit-fill-available] m-4 bg-white rounded-lg shadow-lg transition-transform duration-200 ease-out pointer-events-auto z-40",
          activeSidebar
            ? "translate-x-0 w-[300px]"
            : "translate-x-full w-[70px]"
        )}
      >
        <div className="w-[300px] h-full p-4">
          {activeSidebar === "basemap" && (
            <div>
              <h3 className="font-semibold mb-4">Map Basemap</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto p-2">
                {mapSources.map((source) => (
                  <div
                    key={source.name}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors",
                      selectedMap === source.name ? "bg-gray-100 ring-2 ring-blue-500" : ""
                    )}
                    onClick={() => {
                      setSelectedMap(source.name);
                      setBasemapLayer(source.layer);
                    }}
                  >
                    <img
                      src={source.previewUrl}
                      alt={source.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-medium">{source.name}</h4>
                      <p className="text-sm text-gray-500">{source.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeSidebar === "filters" && (
            <Filters
              colormapSettings={colormapSettings}
              setColormapSettings={setColormapSettings}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
            />
          )}
          {activeSidebar === "info" && (
            <Information />
          )}
          {activeSidebar === "effects" && (
            <Effects
              colormapSettings={colormapSettings}
              setColormapSettings={setColormapSettings}
            />
          )}
          {activeSidebar === "export" && (
            <Export />
          )}
        </div>
      </div>
    </div>
  );
}

export default MapSideBar;
