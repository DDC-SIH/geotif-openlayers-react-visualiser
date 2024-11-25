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
  }
  
  function Filters({
    colormapSettings,
    setColormapSettings,
  }: {
    colormapSettings: ColormapSettings;
    setColormapSettings: React.Dispatch<React.SetStateAction<ColormapSettings>>;
  }) {
  return (
    <div className="space-y-6">
    <h3 className="font-semibold mb-4">Filters</h3>

    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Colormap Type</label>
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