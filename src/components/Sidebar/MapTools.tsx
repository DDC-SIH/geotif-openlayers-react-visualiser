import { Switch } from "../ui/switch";
function MapTools({
  showCoordinates,
  setShowCoordinates,
  basemapCoordinates,
  setBasemapCoordinates,
}: {
  showCoordinates: boolean;
  setShowCoordinates: (value: boolean) => void;
  basemapCoordinates: boolean;
  setBasemapCoordinates: (value: boolean) => void;
}) {
  return (
    <div>
      <h3 className="font-semibold mb-4">Map Tools</h3>
      <div className="grid grid-cols-1 gap-2">
        <div className="flex w-full justify-between text-base">
          <label>
            Show Basemap
          </label>
            <Switch
              id="switch"
              checked={showCoordinates}
              onCheckedChange={() => {
                setShowCoordinates(!showCoordinates);
                console.log(showCoordinates);
              }}
            />
        </div>
        <div className="flex justify-between text-base">
          <label>
            Show Coordinates
          </label>
            <Switch
              id="switch"
              checked={basemapCoordinates}
              onCheckedChange={() => {
                setBasemapCoordinates(!basemapCoordinates);
                console.log(basemapCoordinates);
              }}
            />
        </div>
      </div>

      
    </div>
  );
}

export default MapTools;
