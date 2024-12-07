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
import { defaults as defaultControls, ZoomToExtent } from "ol/control";
import { defaults as defaultInteractions } from "ol/interaction";
import { DragBox, Draw, Modify, Snap } from 'ol/interaction';
import { platformModifierKeyOnly } from 'ol/events/condition';
import MapSideBar from "./Sidebar/MapSideBar";
import { citiesData } from "@/../constants/consts";
import { mapSources } from "@/utils/mapSourcces";
import { useGeoData } from "../../contexts/GeoDataProvider";
import { useAppContext } from "../../contexts/AppContext";
import MapUserPopup from "./MapUserPropup";
import { Fill, Stroke, Style, Circle as CircleStyle } from 'ol/style';
import ImageTile from 'ol/source/ImageTile.js';

const GeoTIFFMap = () => {
    const { setBoundingBox, tiffUrls, renderArray, selectedPolygon, setSelectedPolygon, isPolygonSelectionEnabled, setIsPolygonSelectionEnabled } = useGeoData();
    const { isLoggedIn } = useAppContext();

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
        alpha: 0.75,
        brightness: 0,
        contrast: 0.5,
        saturation: 0.5,
        exposure: 0.5,
        hueshift: 0
    });
    const [tiffLayer, setTiffLayer] = useState<TileLayer | null>(null);
    const [basemapLayer, setBasemapLayer] = useState<any>(mapSources[1].layer);
    const [selectedIndex, setSelectedIndex] = useState("ndvi");
    const [selectedColormap, setSelectedColormap] = useState("viridis");
    const [isModifierKeyPressed, setIsModifierKeyPressed] = useState(false);
    const [draw, setDraw] = useState<Draw | null>(null);
    const [polygonLayer, setPolygonLayer] = useState<VectorLayer | null>(null);
    const [snapInteraction, setSnapInteraction] = useState<Snap | null>(null);

    // Create a dedicated vector layer for drawn features
    const drawVector = new VectorLayer({
        source: new VectorSource(),
        style: {
            'stroke-color': 'rgba(100, 255, 0, 1)',
            'stroke-width': 2,
            'fill-color': 'rgba(100, 255, 0, 0.3)',
        },
    });

    function getColorStops(
        name: string, min: number, max: number, steps: number, reverse: boolean, alpha: number, brightness: number, contrast: number, saturation: number, exposure: number, hueshift: number
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

        // Apply brightness, contrast, saturation, and exposure adjustments
        colors = colors.map(color => {
            const [r, g, b, a] = color;
            const adjustedColor = adjustColor([r, g, b], brightness, contrast, saturation, exposure, hueshift);
            return [adjustedColor[0], adjustedColor[1], adjustedColor[2], a];
        });

        // Add initial transparent stop for values below min
        stops[0] = min;
        stops[1] = "rgba(0,0,0,0)";

        // Add color stops within the min-max range
        for (let i = 1; i < steps; i++) {
            const value = min + i * delta;
            if (value >= colormapSettings.min && value <= colormapSettings.max) {
                stops[i * 2] = value;
                stops[i * 2 + 1] = colors[i];
            } else {
                stops[i * 2] = value;
                stops[i * 2 + 1] = "rgba(0,0,0,0)";
            }
        }

        // Add final transparent stop for values above max
        stops[steps * 2 - 2] = max;
        stops[steps * 2 - 1] = "rgba(0,0,0,0)";

        return stops;
    }


    function adjustColor([r, g, b]: number[], brightness: number, contrast: number, saturation: number, exposure: number, hueShift: number): number[] {
        // Apply brightness
        r = r + brightness * 255;
        g = g + brightness * 255;
        b = b + brightness * 255;

        // Apply contrast
        r = ((r - 128) * contrast * 2 + 128);
        g = ((g - 128) * contrast * 2 + 128);
        b = ((b - 128) * contrast * 2 + 128);

        // Apply saturation
        const gray = 0.3 * r + 0.59 * g + 0.11 * b;
        r = gray + (r - gray) * saturation * 1.33;
        g = gray + (g - gray) * saturation * 1.33;
        b = gray + (b - gray) * saturation * 1.33;

        // Apply exposure
        r = r * Math.pow(1.33, exposure);
        g = g * Math.pow(1.33, exposure);
        b = b * Math.pow(1.33, exposure);

        // Apply hue shift
        [r, g, b] = applyHueShift(r, g, b, hueShift);

        // Clamp values to [0, 255]
        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));

        return [r, g, b];
    }

    function applyHueShift(r: number, g: number, b: number, hueShift: number): number[] {
        const u = Math.cos(hueShift * Math.PI / 180);
        const w = Math.sin(hueShift * Math.PI / 180);

        const newR = 0.299 + 0.701 * u + 0.168 * w;
        const newG = 0.587 - 0.587 * u + 0.330 * w;
        const newB = 0.114 - 0.114 * u - 0.497 * w;

        return [
            r * newR + g * newG + b * newB,
            r * newG + g * newR + b * newB,
            r * newB + g * newG + b * newR
        ];
    }

    const cropToExtent = (bbox: number[]) => {
        if (!tiffLayer || !mapInstanceRef.current) return;

        // Convert bbox coordinates to map projection
        const [minLon, minLat, maxLon, maxLat] = bbox;
        const extent = [
            fromLonLat([minLon, minLat]),
            fromLonLat([maxLon, maxLat])
        ].flat();

        // Set the crop extent on the layer
        tiffLayer.setExtent(extent);

        // Animate view to the new extent
        mapInstanceRef.current.getView().fit(extent, {
            duration: 1000,
            padding: [50, 50, 50, 50]
        });
    };

    const search = (query: string) => {
        const result = citiesData.find(
            (item) => item.name.toLowerCase() === query.toLowerCase()
        );

        if (result) {
            const { bbox } = result;
            if (bbox && bbox.length === 4) {
                cropToExtent(bbox);
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
        if (tiffLayer && renderArray.length >= 3) {
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
                            ...getColorStops(colormapSettings.type, min, max, colormapSettings.steps, colormapSettings.reverse, colormapSettings.alpha, colormapSettings.brightness, colormapSettings.contrast, colormapSettings.saturation, colormapSettings.exposure, colormapSettings.hueshift),
                        ],
                        [0, 0, 0, 0]
                    ]
                });
            } else {
                setSelectedIndex("none");
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
    }, [selectedColormap, selectedIndex, tiffLayer, colormapSettings]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                setIsModifierKeyPressed(true);
                if (mapRef.current) {
                    mapRef.current.style.cursor = 'crosshair';
                }
            }
        };

        const handleKeyUp = () => {
            setIsModifierKeyPressed(false);
            if (mapRef.current) {
                mapRef.current.style.cursor = 'default';
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const addDragBoxInteraction = (map: Map) => {
        const dragBox = new DragBox({
            condition: platformModifierKeyOnly,
            className: 'dragbox-style' // Add this line
        });

        dragBox.on('boxstart', () => {
            if (mapRef.current) {
                mapRef.current.style.cursor = 'crosshair';
            }
        });

        dragBox.on('boxend', () => {
            if (mapRef.current) {
                mapRef.current.style.cursor = isModifierKeyPressed ? 'crosshair' : 'default';
            }

            const extent = dragBox.getGeometry().getExtent();
            const bottomLeft = transform(
                [extent[0], extent[1]],
                map.getView().getProjection(),
                'EPSG:4326'
            );
            const topRight = transform(
                [extent[2], [extent[3]]],
                map.getView().getProjection(),
                'EPSG:4326'
            );

            const bbox = [
                Number(bottomLeft[0].toFixed(4)),
                Number(bottomLeft[1].toFixed(4)),
                Number(topRight[0].toFixed(4)),
                Number(topRight[1].toFixed(4))
            ];

            setBoundingBox(bbox);
        });

        map.addInteraction(dragBox);
    };

    const applyPolygonClipping = (polygon) => {
        if (!tiffLayer) return;

        const coordinates = polygon.getCoordinates()[0];
        const { min, max } = getIndexMinMax(selectedIndex);

        const expression = getBandArithmeticExpression(selectedIndex);
        tiffLayer.setStyle({
            color: [
                'interpolate',
                ['linear'],
                expression,
                ...getColorStops(colormapSettings.type, min, max, colormapSettings.steps, colormapSettings.reverse, colormapSettings.alpha, colormapSettings.brightness, colormapSettings.contrast, colormapSettings.saturation, colormapSettings.exposure, colormapSettings.hueshift),
            ],
        });

        // Set the extent of the tiffLayer to the polygon's extent
        const extent = polygon.getExtent();
        tiffLayer.setExtent(extent);
    };

    const addPolygonInteraction = (map: Map) => {
        const source = new VectorSource();
        const vectorLayer = new VectorLayer({
            source: source,
            style: new Style({
                fill: new Fill({
                    color: 'rgba(0, 255, 0, 0.2)',
                }),
                stroke: new Stroke({
                    color: '#00ff00',
                    width: 2,
                }),
            }),
        });
        if (!isPolygonSelectionEnabled) {
            map.removeLayer(vectorLayer);
            return
        }

        map.addLayer(vectorLayer);
        setPolygonLayer(vectorLayer);

        const drawInteraction = new Draw({
            source: source,
            type: 'Polygon',
            style: new Style({
                stroke: new Stroke({
                    color: 'rgba(255, 255, 100, 0.5)',
                    width: 1.5,
                }),
                fill: new Fill({
                    color: 'rgba(255, 255, 100, 0.25)',
                }),
            }),
        });

        drawInteraction.on('drawend', (event) => {
            const polygon = event.feature.getGeometry();
            // Keep the feature in the vector layer
            vectorLayer?.getSource().clear();
            vectorLayer?.getSource().addFeature(event.feature);

            applyPolygonClipping(polygon);

            // Log polygon data
            const coordinates = polygon?.getCoordinates()[0];
            const polygonExtent = polygon?.getExtent();
            console.log('Polygon Coordinates:', coordinates);
            console.log('Polygon Extent:', polygonExtent);
            console.log('Polygon Area:', polygon?.getArea());

            // Convert to GeoJSON for easy sharing/storage
            if (!polygon) return;
            const geojson = new GeoJSON().writeGeometryObject(polygon);
            console.log('Polygon GeoJSON:', geojson);
            setSelectedPolygon(geojson);
            map.removeInteraction(drawInteraction);
        });

        map.addInteraction(drawInteraction);
        setDraw(drawInteraction);
    };

    useEffect(() => {
        if (mapInstanceRef.current && isPolygonSelectionEnabled) {
            addPolygonInteraction(mapInstanceRef.current);
        } else if (mapInstanceRef.current && !isPolygonSelectionEnabled) {
            if (draw) {
                mapInstanceRef.current.removeInteraction(draw);
                setDraw(null);
            }
            if (snapInteraction) {
                mapInstanceRef.current.removeInteraction(snapInteraction);
                setSnapInteraction(null);
            }
            // Remove draw vector layer when disabling
            if (polygonLayer) {
                mapInstanceRef.current.removeLayer(polygonLayer);
                setPolygonLayer(null);
            }
        }
    }, [isPolygonSelectionEnabled, mapInstanceRef.current]);

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
        // Remove existing tiffLayer if any
        if (tiffLayer) {
            mapInstanceRef.current?.removeLayer(tiffLayer);
        }

        // Create sources based on renderArray
        const sources = renderArray.map(layer => ({
            url: tiffUrls[layer.key].url,
            bands: [1],
            min: tiffUrls[layer.key].min,
            max: tiffUrls[layer.key].max,
        }));
        console.log(sources)
        const geoTIFFSource = new GeoTIFF({
            sources: sources,
        });

        const layer = new TileLayer({
            className: "tiff",
            source: geoTIFFSource,
        });

        setTiffLayer(layer);



        const openLayersMap = new Map({
            target: mapRef.current as HTMLElement,
            layers: [basemapLayer, layer], // Use the selected basemap layer
            controls: defaultControls({
                zoom: false // Disable default zoom controls
            }).extend([
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
        addPolygonInteraction(openLayersMap);
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
    }, [renderArray]);

    const downloadPolygon = () => {
        if (!selectedPolygon) {
            alert("No polygon selected");
            return;
        }

        const blob = new Blob([JSON.stringify(selectedPolygon)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "polygon.geojson";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-screen h-screen relative overflow-hidden">
            <style>
                {`
            html,
            body {
              overscroll-behavior-y: none;
              touch-action: none;
            }
            .dragbox-style {
                border: 2px solid #1a73e8;
                background-color: rgba(26, 115, 232, 0.2);
            }
            `}
            </style>

            {/* UI Layer */}
            <MapUserPopup isLoggedIn={isLoggedIn} />

            <div className="absolute inset-0 pointer-events-none">
                {/* Sidebar */}
                <MapSideBar
                    setColormapSettings={setColormapSettings}
                    colormapSettings={colormapSettings}
                    setBasemapLayer={setBasemapLayer}
                    selectedIndex={selectedIndex}
                    setSelectedIndex={setSelectedIndex}
                />

                {/* Search Bar and Controls Container */}
                <div className="fixed right-4 bottom-4 flex gap-2 items-end pointer-events-auto z-50 flex-col justify-end">
                    <div className="flex flex-col">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-none h-9 bg-white"
                            onClick={() => mapInstanceRef.current?.getView().setZoom(mapInstanceRef.current.getView().getZoom()! + 1)}
                        >
                            <span className="text-lg">+</span>
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-none h-9 bg-white"
                            onClick={() => mapInstanceRef.current?.getView().setZoom(mapInstanceRef.current.getView().getZoom()! - 1)}
                        >
                            <span className="text-lg">−</span>
                        </Button>
                    </div>
                    <div className="flex items-center bg-white shadow-lg overflow-hidden">
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
                            className="rounded-none h-9"
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>


                </div>
            </div>

            <div ref={mapRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
};

export default GeoTIFFMap;
