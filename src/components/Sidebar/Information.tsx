import { Slider } from "../ui/slider";

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

function Information({
  colormapSettings,
  setColormapSettings,
}: {
  colormapSettings: ColormapSettings;
  setColormapSettings: React.Dispatch<React.SetStateAction<ColormapSettings>>;
}) {
  const transparencyOptions = [0, 0.25, 0.5, 0.75, 1]; // Transparency values

  return (
    <div>
      <h3 className="font-semibold mb-4">Information</h3>
      <p className="my-2">Render Meta Data Here</p>
      <div className="space-y-2">
        <span className="text-sm font-medium flex justify-between w-full">
          <label>Transparency</label>
          <span>{Math.round(colormapSettings.alpha * 100)}%</span>
        </span>

        {/* Slider */}
        <Slider
          value={[colormapSettings.alpha]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={([value]) =>
            setColormapSettings((prev) => ({
              ...prev,
              alpha: value,
            }))
          }
        />

        {/* Transparency Options */}
        <div className="flex justify-between text-xs pt-2 mt-2.5">
          {transparencyOptions.map((value, index) => (
            <button
              key={index}
              onClick={() =>
                setColormapSettings((prev) => ({
                  ...prev,
                  alpha: value,
                }))
              }
              className={`px-2 py-1 rounded-full ${
                colormapSettings.alpha === value
                  ? "bg-black text-white font-bold"
                  : "bg-transparent text-gray-600 hover:text-black"
              }`}
            >
              {Math.round(value * 100)}%
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 mt-4">
        <div className="space-y-2">
          <span className="text-sm font-medium flex justify-between w-full">
            <label>Brightness</label>
            <span>{Math.round(colormapSettings.brightness * 100)}%</span>
          </span>
          <Slider
            value={[colormapSettings.brightness]}
            min={-1}
            max={1}
            step={0.01}
            onValueChange={([value]) =>
              setColormapSettings((prev) => ({
                ...prev,
                brightness: value,
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium flex justify-between w-full">
            <label>Contrast</label>
            <span>{Math.round(colormapSettings.contrast * 100)}%</span>
          </span>
          <Slider
            value={[colormapSettings.contrast]}
            min={-1}
            max={1}
            step={0.01}
            onValueChange={([value]) =>
              setColormapSettings((prev) => ({
                ...prev,
                contrast: value,
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium flex justify-between w-full">
            <label>Saturation</label>
            <span>{Math.round(colormapSettings.saturation * 100)}%</span>
          </span>
          <Slider
            value={[colormapSettings.saturation]}
            min={-1}
            max={1}
            step={0.01}
            onValueChange={([value]) =>
              setColormapSettings((prev) => ({
                ...prev,
                saturation: value,
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium flex justify-between w-full">
            <label>Exposure</label>
            <span>{Math.round(colormapSettings.exposure * 100)}%</span>
          </span>
          <Slider
            value={[colormapSettings.exposure]}
            min={-1}
            max={1}
            step={0.01}
            onValueChange={([value]) =>
              setColormapSettings((prev) => ({
                ...prev,
                exposure: value,
              }))
            }
          />
        </div>
      </div>
    </div>
  );
}

export default Information;
