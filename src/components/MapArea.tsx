import { useEffect, useRef, useState } from "react";
import GeoJSON from "ol/format/GeoJSON.js";
import "ol/ol.css"; // OpenLayers CSS
import { Map, View } from "ol";
import TileLayer from "ol/layer/WebGLTile";
import GeoTIFF from "ol/source/GeoTIFF";
import colormap from "colormap";
import { applyTransform } from "ol/extent";
import {
    get as getProjection,
    getTransform,
    fromLonLat,
    transform,
} from "ol/proj";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { defaults as defaultControls, ZoomToExtent, Zoom } from "ol/control";
import { defaults as defaultInteractions } from "ol/interaction";
import { DragBox } from 'ol/interaction';
import { platformModifierKeyOnly } from 'ol/events/condition';
import MapSideBar from "./Sidebar/MapSideBar";
import { citiesData } from "@/../constants/consts";
import { mapSources } from "@/utils/mapSourcces";
import { useGeoData } from "../../contexts/GeoDataProvider";
import { useAppContext } from "../../contexts/AppContext";
import MapUserPopup from "./MapUserPropup";


const GeoTIFFMap = () => {
    const {isLoggedIn} = useAppContext();
    const { setBoundingBox } = useGeoData();
    const tiffUrls = {
        VIS: "https://final-cog.s3.ap-south-1.amazonaws.com/VIS.tif",
        TIR1: "https://final-cog.s3.ap-south-1.amazonaws.com/TIR1.tif"
    };
    const mapRef = useRef<HTMLDivElement>(null); // Reference to the map container
    const mapInstanceRef = useRef<Map | null>(null); // New ref for map instance
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [colormapSettings, setColormapSettings] = useState({
        type: "viridis",
        min: 0,
        max: 1,
        steps: 10,
        reverse: true,
        alpha: 0.7,
        brightness: 0,
        contrast: 0,
        saturation: 0,
        exposure: 0
    });
    const [tiffLayer, setTiffLayer] = useState<TileLayer | null>(null);
    const [basemapLayer, setBasemapLayer] = useState<TileLayer<any>>(mapSources[1].layer);
    const [selectedIndex, setSelectedIndex] = useState("ndvi");
    const [selectedColormap, setSelectedColormap] = useState("viridis");

    function getColorStops(
        name: string,
        min: number,
        max: number,
        steps: number,
        reverse: boolean,
        alpha: number
    ) {
        if (name === "none") {
            return [];
        }
        const delta = (max - min) / (steps - 1);
        const stops = new Array(steps * 2);
        let colors = colormap({
            colormap: name,
            nshades: steps,
            format: "rgba",
            alpha: alpha,
        });
        if (reverse) {
            colors.reverse();
        }
        // Manually add a transparent stop for NoData values
        stops[0] = min;
        stops[1] = "rgba(0,0,0,0)";
        for (let i = 1; i < steps; i++) {
            stops[i * 2] = min + i * delta;
            stops[i * 2 + 1] = colors[i];
        }
        return stops;
    }

    const setProjection = (
        code: string | null,
        name: string | null,
        proj4def: string | null,
        bbox: number[] | null
    ) => {
        if (code === null || name === null || proj4def === null || bbox === null) {
            alert("No results found, using default projection (EPSG:3857)");
            mapInstanceRef.current?.setView(
                new View({
                    projection: "EPSG:3857",
                    center: [0, 0],
                    zoom: 2,
                })
            );
            return;
        }

        proj4.defs(code, proj4def);
        register(proj4);
        const newProj = getProjection(code);
        if (!newProj) {
            alert("No results found, using default projection (EPSG:3857)");
            mapInstanceRef.current?.setView(
                new View({
                    projection: "EPSG:3857",
                    center: [0, 0],
                    zoom: 2,
                })
            );
            return;
        }
        const fromLonLat = getTransform("EPSG:4326", newProj);
        newProj.setWorldExtent(bbox);

        if (bbox[0] > bbox[2]) {
            bbox[2] += 360; // Handle world extent across the dateline
        }

        const extent = applyTransform(bbox, fromLonLat, undefined, 8);
        newProj.setExtent(extent);
        const newView = new View({
            projection: newProj,
        });
        mapInstanceRef.current?.setView(newView);
        newView.fit(extent);
    };

    const search = (query: string) => {
        // Find the city or country from the predefined array
        const result = citiesData.find(
            (item) => item.name.toLowerCase() === query.toLowerCase()
        );

        if (result) {
            const { name, code, proj4def, bbox } = result;

            if (code && proj4def && bbox && bbox.length === 4) {
                setProjection(code, name, proj4def, bbox);
            }
        } else {
            alert("No results found");
        }
    };
    const clipLayer = new VectorLayer({
        style: null,
        source: new VectorSource({
            url: "./india-osm.geojson",
            format: new GeoJSON(),
        }),
    });

    const updateColormap = () => {
        if (tiffLayer) {
            const { min, max } = getIndexMinMax(selectedIndex);
            if (selectedIndex !== "none") {
                tiffLayer.setStyle({
                    color: [
                        'case',
                        ['all',
                            ['>', ['band', 1], 0],
                            ['>', ['band', 2], 0],
                            ['>', ['band', 3], 0]
                        ],
                        [
                            'interpolate',
                            ['linear'],
                            getBandArithmeticExpression(selectedIndex),
                            ...getColorStops(colormapSettings.type, min, max, colormapSettings.steps, colormapSettings.reverse, colormapSettings.alpha),
                        ],
                        [0, 0, 0, 0]
                    ]
                });
            } else {
                tiffLayer.setStyle({});
            }

        }
    };

    useEffect(() => {
        updateColormap();
    }, [colormapSettings]);

    useEffect(() => {
        if (tiffLayer) {
            updateColormap();
        }
    }, [selectedIndex, tiffLayer]);

    useEffect(() => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.getLayers().setAt(0, basemapLayer);
        }
    }, [basemapLayer]);

    useEffect(() => {
        if (tiffLayer) {
            updateColormap();
        }
    }, [selectedColormap, selectedIndex, tiffLayer]);

    const addDragBoxInteraction = (map: Map) => {
        const dragBox = new DragBox({
            condition: platformModifierKeyOnly
        });

        dragBox.on('boxend', () => {
            const extent = dragBox.getGeometry().getExtent();

            // Convert to geographic coordinates (EPSG:4326 - lat/long)
            const bottomLeft = transform(
                [extent[0], extent[1]],
                map.getView().getProjection(),
                'EPSG:4326'
            );
            const topRight = transform(
                [extent[2], extent[3]],
                map.getView().getProjection(),
                'EPSG:4326'
            );

            const bbox = [
                Number(bottomLeft[0].toFixed(4)), // minLon
                Number(bottomLeft[1].toFixed(4)), // minLat
                Number(topRight[0].toFixed(4)),   // maxLon
                Number(topRight[1].toFixed(4))    // maxLat
            ];

            setBoundingBox(bbox);
            console.log(bbox);

        });

        map.addInteraction(dragBox);
    };

    const getBandArithmeticExpression = (type: string) => {
        switch (type) {
            case "none":
                return ['band', 1]; // Just show band 1 data
            case "ndvi":
                return ['/', ['-', ['band', 3], ['band', 2]], ['+', ['band', 3], ['band', 2]]];
            case "evi":
                return ['*', 2.5, ['/', ['-', ['band', 3], ['band', 2]], ['+', ['band', 3], ['*', 6, ['band', 2]], ['*', 7.5, ['band', 1]], 1]]];
            case "savi":
                return ['*', 1.5, ['/', ['-', ['band', 3], ['band', 2]], ['+', ['band', 3], ['band', 2], 0.5]]];
            case "nbr":
                return ['/', ['-', ['band', 3], ['band', 1]], ['+', ['band', 3], ['band', 1]]];
            case "msavi":
                return ['*', 0.5, ['+', 2, ['*', ['band', 3], 1], ['-', ['sqrt', ['-', ['*', ['*', 2, ['band', 3]], 1], ['*', 8, ['-', ['band', 3], ['band', 2]]]]], 1]]];
            case "ndwi":
                return ['/', ['-', ['band', 2], ['band', 3]], ['+', ['band', 2], ['band', 3]]];
            default:
                return ['band', 1];
        }
    };

    const getIndexMinMax = (type: string) => {
        switch (type) {
            case "none":
                return { min: 0, max: 255 }; // Typical range for raw image data
            case "ndvi":
            case "ndwi":
                return { min: -1, max: 1 };
            case "evi":
                return { min: -1, max: 1 };
            case "savi":
                return { min: -1.5, max: 1.5 };
            case "nbr":
                return { min: -1, max: 1 };
            case "msavi":
                return { min: -1, max: 1 };
            default:
                return { min: 0, max: 1 };
        }
    };

    const fetchGeoTIFF = async () => {
        const geoTIFFSource = new GeoTIFF({
            sources: [
                {
                    url: tiffUrls.VIS,
                    bands: [1],
                    min: 16,
                    max: 216,
                },
                {
                    url: tiffUrls.VIS,
                    bands: [1],
                    min: 16,
                    max: 216,
                },
                {
                    url: tiffUrls.TIR1,
                    bands: [1],
                    min: 496,
                    max: 942,
                },
            ],
        });

        const layer = new TileLayer({
            className: "tiff",
            source: geoTIFFSource,


        });

        setTiffLayer(layer);

        const openLayersMap = new Map({
            target: mapRef.current as HTMLElement,
            layers: [basemapLayer, layer], // Use the selected basemap layer
            controls: defaultControls().extend([
                new Zoom(),
                new ZoomToExtent({
                    extent: [
                        68.1766,
                        6.4627,
                        97.4026,
                        35.5175, // India's extent
                    ],
                }),
            ]),
            interactions: defaultInteractions({
                pinchRotate: false,
                doubleClickZoom: true,
                mouseWheelZoom: true,
            }),
            view: new View({
                center: fromLonLat([78.9629, 20.5937]), // India center coordinates
                zoom: 5,
                maxZoom: 19,
                minZoom: 2,
            }),
        });

        mapInstanceRef.current = openLayersMap;
        addDragBoxInteraction(openLayersMap);
        // Apply initial colormap
        updateColormap();
    };

    useEffect(() => {
        if (!mapInstanceRef.current && mapRef.current) {
            fetchGeoTIFF();
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setTarget(undefined);
                mapInstanceRef.current = null;
            }
        };
    }, []);

    return (
        <div className="w-screen h-screen relative overflow-hidden">
            <style>
                {`
        .ol-zoom {
          top: 4em;
          left: 0.5em;
        }
        .ol-control button {
          background-color: rgba(255, 255, 255, 0.8);
          color: #666;
        }
        .ol-control button:hover {
          background-color: rgba(255, 255, 255, 1);
        }
        html,
        body {
          overscroll-behavior-y: none;
          touch-action: none;
        }
        `}
            </style>

            {/* UI Layer */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Sidebar */}
                <MapSideBar
                    colormapSettings={colormapSettings}
                    setColormapSettings={setColormapSettings}
                    setBasemapLayer={setBasemapLayer}
                    selectedIndex={selectedIndex}
                    setSelectedIndex={setSelectedIndex}
                />

                {/* Search Bar */}
                <div className="fixed left-4 top-4 pointer-events-auto z-50">
                    <div className="flex items-center bg-white backdrop-blur-md rounded-full p-2 shadow-lg overflow-hidden">
                        <div
                            className={cn(
                                "transition-all duration-300 ease-in-out",
                                isSearchOpen ? "w-[200px] opacity-100" : "w-0 opacity-0 hidden"
                            )}
                        >
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search location..."
                                className="h-9 border-none bg-transparent px-2 focus:outline-none"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        search(searchQuery);
                                    }
                                }}
                            />
                        </div>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-full"
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

            </div>
            <div ref={mapRef} className="absolute inset-0 w-full h-full" />
                <MapUserPopup isLoggedIn={isLoggedIn} />
        </div>
    );
};

export default GeoTIFFMap;
