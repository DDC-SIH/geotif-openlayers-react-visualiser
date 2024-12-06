import { Info, Filter, Sparkles, MapIcon, DownloadCloud, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Information from "./Information";
import Filters from "./Filters";
import Effects from "./Effects";
import { mapSources } from "@/utils/mapSourcces";
import TileLayer from "ol/layer/Tile";
import Export from "./Export";
import LayersSection from "./Layers";

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
    <div className="fixed left-0 top-0 flex h-full pointer-events-auto z-[2] bg-neutral-900 ">
      {/* Icons Bar */}
      <div className=" flex flex-col   z-[2]">
        <Button
          size="icon"
          variant={activeSidebar === "info" ? "secondary" : "ghost"}
          className={`rounded-none p-8 ${activeSidebar === "info" ? "hover:bg-neutral-300" : "hover:bg-neutral-800"}` }
          onClick={() =>
            setActiveSidebar(activeSidebar === "info" ? null : "info")
          }
        >
          <Info className={`h-8 w-8 ${activeSidebar === "info" ? "text-black" : "text-white"}`} />
        </Button>
        <Button
          size="icon"
          variant={activeSidebar === "layers" ? "secondary" : "ghost"}
          className={`rounded-none p-8 ${activeSidebar === "layers" ? "hover:bg-neutral-300" : "hover:bg-neutral-800"}` }
          onClick={() =>
            setActiveSidebar(activeSidebar === "layers" ? null : "layers")
          }
        >
          <Layers className={`h-8 w-8 ${activeSidebar === "layers" ? "text-black" : "text-white"}`} />
        </Button>
        <Button
          size="icon"
          variant={activeSidebar === "basemap" ? "secondary" : "ghost"}
          className={`rounded-none p-8 ${activeSidebar === "basemap" ? "hover:bg-neutral-300" : "hover:bg-neutral-800"}` }
          onClick={() =>
            setActiveSidebar(activeSidebar === "basemap" ? null : "basemap")
          }
        >
          <MapIcon className={`h-8 w-8 ${activeSidebar === "basemap" ? "text-black" : "text-white"}`} />
        </Button>
        <Button
          size="icon"
          variant={activeSidebar === "filters" ? "secondary" : "ghost"}
          className={`rounded-none p-8 ${activeSidebar === "filters" ? "hover:bg-neutral-300" : "hover:bg-neutral-800"}` }
          onClick={() =>
            setActiveSidebar(activeSidebar === "filters" ? null : "filters")
          }
        >
          <Filter className={`h-8 w-8 ${activeSidebar === "filters" ? "text-black" : "text-white"}`} />
        </Button>
        <Button
          size="icon"
          variant={activeSidebar === "effects" ? "secondary" : "ghost"}
          className={`rounded-none p-8 ${activeSidebar === "effects" ? "hover:bg-neutral-300" : "hover:bg-neutral-800"}` }
          onClick={() =>
            setActiveSidebar(activeSidebar === "effects" ? null : "effects")
          }
        >
          <Sparkles className={`h-8 w-8 ${activeSidebar === "effects" ? "text-black" : "text-white"}`} />
        </Button>
        <Button
          size="icon"
          variant={activeSidebar === "export" ? "secondary" : "ghost"}
          className={`rounded-none p-8 ${activeSidebar === "export" ? "hover:bg-neutral-300" : "hover:bg-neutral-800"}` }
          onClick={() =>
            setActiveSidebar(activeSidebar === "export" ? null : "export")
          }
        >
          <DownloadCloud className={`h-8 w-8 ${activeSidebar === "export" ? "text-black" : "text-white"}`} />
        </Button>

      </div>

      {/* Expandable Section */}
      <div
        className={cn(
          "h-full bg-white  transition-all duration-200 ease-out z-[9998]",
          activeSidebar ? "w-[300px]" : "w-0 overflow-hidden"
        )}
      >
        <div 
          className={cn(
            "w-[300px] h-full p-4",
            activeSidebar ? "opacity-100 transition-opacity duration-200 delay-150" : "opacity-0"
          )}
        >
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
          {activeSidebar === "layers" && (
            <LayersSection />
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
