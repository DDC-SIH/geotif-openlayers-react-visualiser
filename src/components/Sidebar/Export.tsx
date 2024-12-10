import { useState } from 'react';
import { Button } from '../ui/button';
import { useGeoData } from '../../../contexts/GeoDataProvider';
import { Switch } from "../ui/switch";
import { getArea } from 'ol/sphere';
import GeoJSON from 'ol/format/GeoJSON';

export default function Export() {
    const { boundingBox, setSelectedAOI, selectedAOI, selectedPolygon, setSelectedPolygon, isPolygonSelectionEnabled, setIsPolygonSelectionEnabled, selectedIndex, colormapSettings, renderArray, setRenderArray, tiffUrls } = useGeoData();
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
        console.log("Exporting")
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
        console.log(renderArray.map((item) => {
            return tiffUrls[item.key].url
        }))
        let body = {
            urls: renderArray.map((item) => {
                return tiffUrls[item.key].url
            })
        }
        selected.aoi && (body['aoi'] = boundingBox)
        selected.effects && (body['effects'] = {
            colormap: colormapSettings.type,
            min: colormapSettings.min,
            max: colormapSettings.max,
            steps: colormapSettings.steps,
        })

        selected.polygon && (body['polygon'] = fullGeoJSON)
        // body[]
        fetch("https://6950-2401-4900-7c0c-518f-c886-24a5-a923-2e79.ngrok-free.app/process", {
            method: "POST",
            // mode: "no-cors",
            headers: {
                "Content-Type": "application/json",
                // "Access-Control-Allow-Origin": "*", // Add CORS header
            },
            body: JSON.stringify(body)
        }).then((res) => {
            console.log(res)
        })
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
            units: "degrees"
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
        setRenderArray(prevArray => {
            const updatedArray = [...prevArray];
            const index = updatedArray.findIndex(item => item.key === newItem.key);
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
                        <Button
                            variant="outline"
                            className="w-full mt-2"
                            onClick={downloadAOI}
                        >
                            Download AOI
                        </Button>
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
