import { Layers, Settings, Info } from "lucide-react";
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
import { useState } from "react";

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
  setColormapSettings 
}: { 
  colormapSettings: ColormapSettings;
  setColormapSettings: React.Dispatch<React.SetStateAction<ColormapSettings>>;
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
      <Button
        size="icon"
        variant={activeSidebar === "layers" ? "default" : "ghost"}
        className="rounded-full"
        onClick={() =>
          setActiveSidebar(activeSidebar === "layers" ? null : "layers")
        }
      >
        <Layers className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant={activeSidebar === "settings" ? "default" : "ghost"}
        className="rounded-full"
        onClick={() =>
          setActiveSidebar(
            activeSidebar === "settings" ? null : "settings"
          )
        }
      >
        <Settings className="h-4 w-4" />
      </Button>
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
        {activeSidebar === "settings" && (
          <div className="space-y-6">
            <h3 className="font-semibold mb-4">Settings</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Colormap Type
                </label>
                <Select
                  value={colormapSettings.type}
                  onValueChange={(value) => {
                    if (value === "none") {
                      setColormapSettings((prev) => ({
                        ...prev,
                        type: value,
                      }));
                    } else {
                      setColormapSettings((prev) => ({
                        ...prev,
                        type: value,
                      }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select colormap" />
                  </SelectTrigger>
                  <SelectContent>
                    {["none", "jet", "rainbow", "portland", "bone"].map(
                      (type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium flex justify-between w-full">
                  <label>Min Value</label>{" "}
                  <span>{colormapSettings.min}</span>
                </span>
                <Slider
                  value={[colormapSettings.min]}
                  min={-2}
                  max={2}
                  step={0.1}
                  onValueChange={([value]) =>
                    setColormapSettings((prev) => ({
                      ...prev,
                      min: Math.min(value, colormapSettings.max),
                    }))
                  }
                />
                <div className="flex justify-between text-xs">
                  <span>-2</span>
                  <span>2</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium flex justify-between w-full">
                  <label>Max Value</label>{" "}
                  <span>{colormapSettings.max}</span>
                </span>{" "}
                <Slider
                  value={[colormapSettings.max]}
                  min={-2}
                  max={2}
                  step={0.1}
                  onValueChange={([value]) =>
                    setColormapSettings((prev) => ({
                      ...prev,
                      max: Math.max(value, colormapSettings.min),
                    }))
                  }
                />
                <div className="flex justify-between text-xs">
                  <span>-2</span>
                  <span>2</span>
                </div>
              </div>

              <div className="space-y-2">
              <span className="text-sm font-medium flex justify-between w-full">
                  <label>Steps</label> <span>{colormapSettings.steps}</span>
                </span>                      <Slider
                  value={[colormapSettings.steps]}
                  min={5}
                  max={20}
                  step={1}
                  onValueChange={([value]) =>
                    setColormapSettings((prev) => ({
                      ...prev,
                      steps: value,
                    }))
                  }
                />
                <div className="flex justify-between text-xs">
                  <span>5</span>
                  <span>20</span>
                </div>
              </div>

              <div className="space-y-2">
              <span className="text-sm font-medium flex justify-between w-full">
                  <label>Transparency</label> <span>{colormapSettings.alpha}</span>
                </span>
                <Slider
                  value={[colormapSettings.alpha]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={([value]) =>
                    setColormapSettings((prev) => ({
                      ...prev,
                      alpha: value,
                    }))
                  }
                />
                <div className="flex justify-between text-xs">
                  <span>0</span>
                  <span>1</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setColormapSettings((prev) => ({
                      ...prev,
                      reverse: !prev.reverse,
                    }))
                  }
                >
                  {colormapSettings.reverse
                    ? "Reverse Colors: On"
                    : "Reverse Colors: Off"}
                </Button>
              </div>
          
            </div>
          </div>
        )}
        {activeSidebar === "info" && (
          <div>
            <h3 className="font-semibold mb-4">Information</h3>
            {/* Add information content here */}
          </div>
        )}
      </div>
    </div>
  </div>
  )
}

export default MapSideBar