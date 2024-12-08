import { useState } from 'react';
import { Button } from '../ui/button';
import { useGeoData } from '../../../contexts/GeoDataProvider';
import { Switch } from "../ui/switch";
import { getArea } from 'ol/sphere';
import GeoJSON from 'ol/format/GeoJSON';

export default function Export() {
    const { boundingBox, setSelectedAOI, selectedAOI, selectedPolygon, setSelectedPolygon, isPolygonSelectionEnabled, setIsPolygonSelectionEnabled } = useGeoData();
    const [selected, setSelected] = useState({
        aoi: false,
        effects: false,
        polygon: false
    });

    const handleClick = (type: 'aoi' | 'effects' | 'polygon') => {
        setSelected(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    const handleExport = () => {
        // Logic to export data
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
                    units: "degrees"
                }
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

    return (
        <div className="space-y-6">
            <h3 className="font-semibold ">Export Options</h3>
            <div className='flex flex-col'>
                <div className='flex justify-between'>
                    <div className='font-semibold'>Send AOI</div>
                    <Switch
                        checked={selected.aoi}
                        onCheckedChange={() => handleClick('aoi')}
                    />
                </div>
                {selected.aoi &&
                    <p className="text-sm">To select AOI, press Ctrl + drag</p>
                }
                {boundingBox && selected.aoi && (
                    <div className="mt-4   rounded flex flex-col">
                        <h4 className="font-semibold">Selected AOI</h4>
                        <p className="text-sm">North: {boundingBox[0]}</p>
                        <p className="text-sm">South: {boundingBox[1]}</p>
                        <p className="text-sm">East: {boundingBox[2]}</p>
                        <p className="text-sm">West: {boundingBox[3]}</p>
                    </div>
                )}
                <div className='flex justify-between mt-5'>
                    <div className='font-semibold'>Send Effects</div>
                    <Switch
                        checked={selected.effects}
                        onCheckedChange={() => handleClick('effects')}
                    />
                </div>
                <div className='flex justify-between mt-5'>
                    <div className='font-semibold'>Send Polygon</div>
                    <Switch
                        checked={selected.polygon}
                        onCheckedChange={() => {
                            handleClick('polygon');
                            setIsPolygonSelectionEnabled(!isPolygonSelectionEnabled)
                        }}
                    />
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
                <Button
                    className="px-4 py-2 mt-4"
                    onClick={handleExport}
                >
                    Export
                </Button>
            </div>
        </div>
    );
}
