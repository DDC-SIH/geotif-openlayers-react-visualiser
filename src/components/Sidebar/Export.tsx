import { ChangeEvent, useState } from "react";
import { Button } from "../ui/button";
import { useGeoData } from "../../../contexts/GeoDataProvider";
import { Switch } from "../ui/switch";
import { getArea } from "ol/sphere";
import GeoJSON from "ol/format/GeoJSON";
import { Input } from "../ui/input";

export default function Export() {
  const {
    boundingBox,
    setSelectedAOI,
    selectedAOI,
    selectedPolygon,
    setSelectedPolygon,
    isPolygonSelectionEnabled,
    setIsPolygonSelectionEnabled,
    selectedIndex,
    colormapSettings,
    renderArray,
    setRenderArray,
    tiffUrls,
  } = useGeoData();
  const [selected, setSelected] = useState({
    aoi: false,
    effects: false,
    polygon: false,
  });
  const [link, setLink] = useState("");
  const handleClick = (type: "aoi" | "effects" | "polygon") => {
    setSelected((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const [geoJSONContent, setGeoJSONContent] = useState<object | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith(".geojson")) {
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = JSON.parse(e.target?.result as string);
            console.log(content)
            setGeoJSONContent(content);
            setIsPolygonSelectionEnabled(true);
            setError("");
          } catch (err) {
            setError("Invalid JSON format");
            setGeoJSONContent(null);
          }
        };
        reader.readAsText(file);
      } else {
        setError("Please upload a .geojson file");
        setFileName("");
      }
    }
  };

  const handleExport = () => {
    // Logic to export data
    console.log("Exporting");
    const geometry = new GeoJSON().readGeometry(selectedPolygon);
    let fullGeoJSON;
    // Create GeoJSON with metadata
    if (geoJSONContent) {
      fullGeoJSON = geoJSONContent;
    } else {
    fullGeoJSON = {
      type: "Feature",
      geometry: selectedPolygon,
      properties: {
        created: new Date().toISOString(),
        area: getArea(geometry), // Area in square meters
        coordinateSystem: "EPSG:4326",
        units: "degrees",
      },
    };
    };
    console.log(
      renderArray.map((item) => {
        return tiffUrls[item.key].url;
      })
    );
    let body = {
      urls: renderArray.map((item) => {
        return tiffUrls[item.key].url;
      }),
    };
    selected.aoi && (body["aoi"] = boundingBox);
    selected.effects &&
      (body["effects"] = {
        arithmatic: selectedIndex,
        colormap: colormapSettings.type,
        min: colormapSettings.min,
        max: colormapSettings.max,
        steps: colormapSettings.steps,
      });

    selected.polygon && (body["polygon"] = fullGeoJSON);
    // body[]
    fetch(
      "https://e9fb-2409-40c1-18-eca3-18cb-d34a-bfda-3374.ngrok-free.app/process",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setLink(data.s3_url);
      });
  };

  const handleSendAOI = () => {
    // Logic to send AOI
  };

  const downloadPolygon = () => {
    if (!selectedPolygon) {
      alert("No polygon selected");
      return;
    }

    try {
      const geometry = new GeoJSON().readGeometry(selectedPolygon);

      // Create GeoJSON with metadata
      const fullGeoJSON = {
        type: "Feature",
        geometry: selectedPolygon,
        properties: {
          created: new Date().toISOString(),
          area: getArea(geometry), // Area in square meters
          coordinateSystem: "EPSG:4326",
          units: "degrees",
        },
      };

      const blob = new Blob([JSON.stringify(fullGeoJSON, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `polygon-${new Date().toISOString()}.geojson`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading polygon:", error);
      alert("Error downloading polygon");
    }
  };

  const downloadAOI = () => {
    if (!boundingBox) {
      alert("No AOI selected");
      return;
    }

    const aoiJSON = {
      north: boundingBox[0],
      south: boundingBox[1],
      east: boundingBox[2],
      west: boundingBox[3],
      created: new Date().toISOString(),
      coordinateSystem: "EPSG:4326",
      units: "degrees",
    };

    const blob = new Blob([JSON.stringify(aoiJSON, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aoi-bbox-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateRenderArray = (newItem) => {
    setRenderArray((prevArray) => {
      const updatedArray = [...prevArray];
      const index = updatedArray.findIndex((item) => item.key === newItem.key);
      if (index !== -1) {
        updatedArray[index] = newItem;
      } else {
        updatedArray.push(newItem);
      }
      return updatedArray;
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold ">Export Options</h3>
      <div className="flex flex-col">
        <div className="flex justify-between">
          <div className="font-semibold">Send AOI</div>
          <Switch
            checked={selected.aoi}
            onCheckedChange={() => handleClick("aoi")}
          />
        </div>
        {selected.aoi && (
          <p className="text-sm">To select AOI, press Ctrl + drag</p>
        )}
        {boundingBox && selected.aoi && (
          <div className="mt-4   rounded flex flex-col">
            <h4 className="font-semibold">Selected AOI</h4>
            <p className="text-sm">North: {boundingBox[0]}</p>
            <p className="text-sm">South: {boundingBox[1]}</p>
            <p className="text-sm">East: {boundingBox[2]}</p>
            <p className="text-sm">West: {boundingBox[3]}</p>
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={downloadAOI}
            >
              Download AOI
            </Button>
          </div>
        )}
        <div className="flex justify-between mt-5">
          <div className="font-semibold">Send Effects</div>
          <Switch
            checked={selected.effects}
            onCheckedChange={() => handleClick("effects")}
          />
        </div>
        <div className="flex justify-between mt-5">
          <div className="font-semibold">Send Polygon</div>
          <Switch
            checked={selected.polygon}
            onCheckedChange={() => {
              handleClick("polygon");
              setIsPolygonSelectionEnabled(!isPolygonSelectionEnabled);
            }}
          />
        </div>
        <div className="mt-2">
          <Input
            type="file"
            accept=".geojson"
            onChange={handleFileUpload}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full h-12 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {fileName && (
            <p className="mt-2 text-sm text-gray-500">File uploaded!</p>
          )}
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
        {selectedPolygon && selected.polygon && (
          <div className="mt-4 rounded flex flex-col">
            <p className="text-sm mb-2">Polygon is selected</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={downloadPolygon}
            >
              Download Polygon
            </Button>
          </div>
        )}
        <Button className="px-4 py-2 mt-4" onClick={handleExport}>
          Export
        </Button>
        {link !== "" && (
          <Button
            className="my-2"
            onClick={() => {
              window.open(link);
              setLink("");
            }}
          >
            Download
          </Button>
        )}
      </div>
    </div>
  );
}
