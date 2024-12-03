import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";



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
}

function Filters({
  colormapSettings,
  setColormapSettings,
  selectedIndex,
  setSelectedIndex,
}: {
  colormapSettings: ColormapSettings;
  setColormapSettings: React.Dispatch<React.SetStateAction<ColormapSettings>>;
  selectedIndex: string;
  setSelectedIndex: (value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <h3 className="font-semibold mb-4">Filters</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Band Arithmetic</label>
          <Select onValueChange={setSelectedIndex} value={selectedIndex}>
            <SelectTrigger>
              <SelectValue placeholder="Select Index" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None - Raw Data</SelectItem>
              <SelectItem value="ndvi">NDVI - Vegetation Index</SelectItem>
              <SelectItem value="evi">EVI - Enhanced Vegetation</SelectItem>
              <SelectItem value="savi">SAVI - Soil Adjusted VI</SelectItem>
              <SelectItem value="nbr">NBR - Burn Ratio</SelectItem>
              <SelectItem value="msavi">MSAVI - Modified Soil VI</SelectItem>
              <SelectItem value="ndwi">NDWI - Water Index</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Colormap Type</label>
          <Select
            value={colormapSettings.type}
            onValueChange={(value) => {

              setColormapSettings((prev) => ({
                ...prev,
                type: value,
              }));

            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select colormap" />
            </SelectTrigger>
            <SelectContent>
              {["viridis", "jet", "rainbow", "portland", "bone","plasma","magma","inferno"].map(
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
            <label>Min Value</label> <span>{colormapSettings.min}</span>
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
            <label>Max Value</label> <span>{colormapSettings.max}</span>
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
          </span>{" "}
          <Slider
            value={[colormapSettings.steps]}
            min={10}
            max={50}
            step={1}
            onValueChange={([value]) =>
              setColormapSettings((prev) => ({
                ...prev,
                steps: value,
              }))
            }
          />
          <div className="flex justify-between text-xs">
            <span>10</span>
            <span>50</span>
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
  )
}

export default Filters