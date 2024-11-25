import { Info, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SetStateAction, useState } from "react";
import Information from "./Information";
import Filters from "./Filters";

interface ColormapSettings {
  type: string;
  min: number;
  max: number;
  steps: number;
  alpha: number;
  reverse: boolean;
}

function MapSideBar({
  colormapSettings,
  setColormapSettings,
}: {
  colormapSettings: ColormapSettings;
  setColormapSettings: React.Dispatch<SetStateAction<ColormapSettings>>;
}) {
  const [activeSidebar, setActiveSidebar] = useState<string | null>(null);

  return (
    <div className="fixed right-4 top-4 flex flex-col gap-2 pointer-events-auto z-50">
      {/* Icons Bar */}
      <div
        className={`bg-white z-50  shadow-lg rounded-lg p-3 flex flex-col gap-3 ${
          activeSidebar ? "shadow-lg" : "shadow-none"
        }`}
      >
        {/* <Button
          size="icon"
          variant={activeSidebar === "layers" ? "default" : "ghost"}
          className="rounded-full"
          onClick={() =>
            setActiveSidebar(activeSidebar === "layers" ? null : "layers")
          }
        >
          <Layers className="h-4 w-4" />
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
          variant={activeSidebar === "filters" ? "default" : "ghost"}
          className="rounded-full"
          onClick={() =>
            setActiveSidebar(activeSidebar === "filters" ? null : "filters")
          }
        >
          <Filter className="h-4 w-4" />
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
          {activeSidebar === "layers" && (
            <div>
              <h3 className="font-semibold mb-4">Layers</h3>
              {/* Add layer controls here */}
            </div>
          )}
          {activeSidebar === "filters" && (
            <Filters  colormapSettings={colormapSettings} setColormapSettings={setColormapSettings}/>
          )}
          {activeSidebar === "info" && (
            <Information colormapSettings={colormapSettings} setColormapSettings={setColormapSettings}/>
          )}
        </div>
      </div>
    </div>
  );
}

export default MapSideBar;
