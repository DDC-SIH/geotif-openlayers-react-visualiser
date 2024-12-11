import { Slider } from "../ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";

const getBandArithmeticExpressionAsString = (type: string): string => {
  const expressionToString = (expression: any): string => {
    if (typeof expression === "number" || typeof expression === "string") {
      return expression.toString();
    }

    if (Array.isArray(expression)) {
      const [operator, ...operands] = expression;

      switch (operator) {
        case "+":
          return operands.map(expressionToString).join(" + ");
        case "-":
          return operands.map(expressionToString).join(" - ");
        case "*":
          return operands.map(expressionToString).join(" * ");
        case "/":
          return operands.map(expressionToString).join(" / ");
        case "sqrt":
          return `sqrt(${operands.map(expressionToString).join(", ")})`;
        case "band":
          return `B${operands[0]}`;
        case "var":
          return operands[0];
        default:
          return "";
      }
    }

    return "";
  };

  const expressions: Record<string, any> = {
    none: ["band", 1],
    ndvi: ["/", ["-", ["band", 2], ["band", 1]], ["+", ["band", 2], ["band", 1]]],
    evi: [
      "*",
      2.5,
      [
        "/",
        ["-", ["band", 3], ["band", 2]],
        [
          "+",
          ["band", 3],
          ["*", 6, ["band", 2]],
          ["*", 7.5, ["band", 1]],
          1,
        ],
      ],
    ],
    savi: [
      "*",
      1.5,
      [
        "/",
        ["-", ["band", 2], ["band", 1]],
        ["+", ["band", 2], ["band", 1], 0.5],
      ],
    ],
    nbr: ["/", ["-", ["band", 2], ["band", 1]], ["+", ["band", 2], ["band", 1]]],
    msavi: [
      "*",
      0.5,
      [
        "+",
        2,
        ["*", ["band", 3], 1],
        [
          "-",
          [
            "sqrt",
            [
              "-",
              ["*", ["*", 2, ["band", 3]], 1],
              ["*", 8, ["-", ["band", 3], ["band", 2]]],
            ],
          ],
          1,
        ],
      ],
    ],
    ndwi: ["/", ["-", ["band", 2], ["band", 3]], ["+", ["band", 2], ["band", 3]]],
    hillshade: ["*", 255, ["var", "hillshade"]],
  };

  const selectedExpression = expressions[type] || ["band", 1];
  return expressionToString(selectedExpression);
};




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
              <SelectItem value="none">None - {getBandArithmeticExpressionAsString('none')} </SelectItem>
              <SelectItem value="ndvi">NDVI - {getBandArithmeticExpressionAsString('ndvi')}</SelectItem>
              <SelectItem value="evi">EVI - {getBandArithmeticExpressionAsString('evi')}</SelectItem>
              <SelectItem value="savi">SAVI - {getBandArithmeticExpressionAsString('savi')}</SelectItem>
              <SelectItem value="nbr">NBR - {getBandArithmeticExpressionAsString('nbr')}</SelectItem>
              <SelectItem value="msavi">MSAVI - {getBandArithmeticExpressionAsString('msavi')}</SelectItem>
              <SelectItem value="ndwi">NDWI - {getBandArithmeticExpressionAsString('ndwi')}</SelectItem>
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
            min={-1}
            max={1}
            step={0.1}
            onValueChange={([value]) =>
              setColormapSettings((prev) => ({
                ...prev,
                min: Math.min(value, colormapSettings.max),
              }))
            }
          />
          <div className="flex justify-between text-xs">
            <span>-1</span>
            <span>1</span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium flex justify-between w-full">
            <label>Max Value</label> <span>{colormapSettings.max}</span>
          </span>{" "}
          <Slider
            value={[colormapSettings.max]}
            min={-1}
            max={1}
            step={0.1}
            onValueChange={([value]) =>
              setColormapSettings((prev) => ({
                ...prev,
                max: Math.max(value, colormapSettings.min),
              }))
            }
          />
          <div className="flex justify-between text-xs">
            <span>-1</span>
            <span>1</span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium flex justify-between w-full">
            <label>Steps</label> <span>{colormapSettings.steps}</span>
          </span>{" "}
          <Slider
            value={[colormapSettings.steps]}
            min={10}
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
            <span>10</span>
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