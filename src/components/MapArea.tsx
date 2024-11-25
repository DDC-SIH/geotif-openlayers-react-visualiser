import { useEffect, useRef, useState } from 'react';
import GeoJSON from 'ol/format/GeoJSON.js';
import 'ol/ol.css'; // OpenLayers CSS
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/WebGLTile';
import GeoTIFF from 'ol/source/GeoTIFF';
import colormap from 'colormap';
import { applyTransform } from 'ol/extent';
import { get as getProjection, getTransform, Projection, fromLonLat } from 'ol/proj';
import { fromEPSGCode, register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { StadiaMaps } from 'ol/source';
import { Search, Layers, Settings, Info, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { defaults as defaultControls, ZoomToExtent, Zoom } from 'ol/control';
import { defaults as defaultInteractions } from 'ol/interaction';

const citiesData = [
    {
        name: "New Delhi",
        code: "IN:DEL",
        proj4def: "+proj=longlat +datum=WGS84 +no_defs",
        bbox: [77.0369, 28.6139, 77.3616, 28.8590], // Example bounding box for New Delhi
    },
    {
        name: "Mumbai",
        code: "IN:MUM",
        proj4def: "+proj=longlat +datum=WGS84 +no_defs",
        bbox: [72.7397, 18.9282, 72.9447, 19.3070], // Example bounding box for Mumbai
    },
    {
        name: "Bangalore",
        code: "IN:BLR",
        proj4def: "+proj=longlat +datum=WGS84 +no_defs",
        bbox: [77.5043, 12.9000, 77.6900, 13.2015], // Example bounding box for Bangalore
    },
    {
        name: "Chennai",
        code: "IN:CHE",
        proj4def: "+proj=longlat +datum=WGS84 +no_defs",
        bbox: [80.1161, 13.0475, 80.2870, 13.3020], // Example bounding box for Chennai
    },
    {
        name: "India",
        code: "IN",
        proj4def: "+proj=longlat +datum=WGS84 +no_defs",
        bbox: [68.1766, 6.4627, 97.4026, 35.5175], // Bounding box for all of India
    }
];

const GeoTIFFMap = () => {
    const tiffUrl = 'https://final-cog.s3.ap-south-1.amazonaws.com/3RIMG_04SEP2024_1015_L2C_INS_V01R00_INS_cog.tif'; // URL to the GeoTIFF file
    const mapRef = useRef<HTMLDivElement>(null); // Reference to the map container
    const mapInstanceRef = useRef<Map | null>(null);  // New ref for map instance
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [activeSidebar, setActiveSidebar] = useState<string | null>(null);
    const [colormapSettings, setColormapSettings] = useState({
        type: 'none',
        min: 0,
        max: 1,
        steps: 10,
        reverse: true,
        alpha: 0.7
    });
    const [tiffLayer, setTiffLayer] = useState<TileLayer<GeoTIFF> | null>(null);


    function getColorStops(name: string, min: number, max: number, steps: number, reverse: boolean, alpha: number) {
        if (name === 'none') {
            return [];
        }
        const delta = (max - min) / (steps - 1);
        const stops = new Array(steps * 2);
        let colors = colormap({ colormap: name, nshades: steps, format: 'rgba', alpha: alpha });
        if (reverse) {
            colors.reverse();
        }
        // Manually add a transparent stop for NoData values
        stops[0] = min;
        stops[1] = 'rgba(0,0,0,0)';
        for (let i = 1; i < steps; i++) {
            stops[i * 2] = min + i * delta;
            stops[i * 2 + 1] = colors[i];
        }
        return stops;
    }

    const setProjection = (code: string | null, name: string | null, proj4def: string | null, bbox: number[] | null) => {
        if (code === null || name === null || proj4def === null || bbox === null) {
            alert('No results found, using default projection (EPSG:3857)');
            mapInstanceRef.current?.setView(
                new View({
                    projection: 'EPSG:3857',
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
            alert('No results found, using default projection (EPSG:3857)');
            mapInstanceRef.current?.setView(
                new View({
                    projection: 'EPSG:3857',
                    center: [0, 0],
                    zoom: 2,
                })
            );
            return;
        }
        const fromLonLat = getTransform('EPSG:4326', newProj);
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
        const result = citiesData.find(item => item.name.toLowerCase() === query.toLowerCase());

        if (result) {
            const { name, code, proj4def, bbox } = result;

            if (code && proj4def && bbox && bbox.length === 4) {
                setProjection(code, name, proj4def, bbox);
            }
        } else {
            alert('No results found');
        }
    };
    const clipLayer = new VectorLayer({
        style: null,
        source: new VectorSource({
            url: './india-osm.geojson',
            format: new GeoJSON(),
        }),
    });
    const background = new TileLayer({
        className: 'toner',
        source: new StadiaMaps({
            layer: 'stamen_toner',
        }),
    });
    const updateColormap = () => {
        if (tiffLayer) {
            if (colormapSettings.type === 'none') {
                tiffLayer.setStyle({}); // Remove colormap style
            } else {
                tiffLayer.setStyle({
                    color: [
                        'interpolate',
                        ['linear'],
                        ['/', ['band', 1], 2],
                        ...getColorStops(
                            colormapSettings.type,
                            Math.min(colormapSettings.min, colormapSettings.max), // Ensure min value is <= max value
                            Math.max(colormapSettings.min, colormapSettings.max), // Ensure max value is >= min value
                            colormapSettings.steps,
                            colormapSettings.reverse,
                            colormapSettings.alpha
                        ),
                    ],
                    opacity: [
                        'case',
                        ['<', ['band', 1], 0], // Ensure NoData values are always transparent
                        0, // Transparent
                        1  // Opaque
                    ]
                });
            }
        }
    };

    useEffect(() => {
        updateColormap();
    }, [colormapSettings]);

    const fetchGeoTIFF = async () => {
        const geoTIFFSource = new GeoTIFF({
            sources: [
                {
                    url: tiffUrl,
                    bands: [1],
                    min: 26,
                    max: 461,
                },
            ],
        });

        const layer = new TileLayer({
            source: geoTIFFSource,
        });

        setTiffLayer(layer);

        const openLayersMap = new Map({
            target: mapRef.current as HTMLElement,
            layers: [background, layer],
            controls: defaultControls().extend([
                new Zoom(),
                new ZoomToExtent({
                    extent: [
                        68.1766, 6.4627, 97.4026, 35.5175 // India's extent
                    ]
                })
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
            })
        });

        mapInstanceRef.current = openLayersMap;

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
        <div className='w-screen h-screen relative overflow-hidden'>
            <style jsx global>{`
                .ol-zoom {
                    top: 4em;
                    left: .5em;
                }
                .ol-control button {
                    background-color: rgba(255,255,255,0.8);
                    color: #666;
                }
                .ol-control button:hover {
                    background-color: rgba(255,255,255,1);
                }
                html, body {
                    overscroll-behavior-y: none;
                    touch-action: none;
                }
            `}</style>

            {/* UI Layer */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Sidebar */}
                <div className="h-full flex pointer-events-auto">
                    {/* Icons Bar */}
                    <div className="h-full bg-white/80 backdrop-blur-sm shadow-lg flex flex-col gap-2 p-2 z-50">
                        <Button
                            size="icon"
                            variant={activeSidebar === 'layers' ? 'default' : 'ghost'}
                            className="rounded-full"
                            onClick={() => setActiveSidebar(activeSidebar === 'layers' ? null : 'layers')}
                        >
                            <Layers className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant={activeSidebar === 'settings' ? 'default' : 'ghost'}
                            className="rounded-full"
                            onClick={() => setActiveSidebar(activeSidebar === 'settings' ? null : 'settings')}
                        >
                            <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant={activeSidebar === 'info' ? 'default' : 'ghost'}
                            className="rounded-full"
                            onClick={() => setActiveSidebar(activeSidebar === 'info' ? null : 'info')}
                        >
                            <Info className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Expandable Section */}
                    <div className={cn(
                        "fixed left-[52px] h-full bg-white/80 backdrop-blur-sm shadow-lg transition-transform duration-200 ease-out pointer-events-auto z-40",
                        activeSidebar ? "translate-x-0" : "-translate-x-full"
                    )}>
                        <div className="w-[300px] h-full p-4">
                            {activeSidebar === 'layers' && (
                                <div>
                                    <h3 className="font-semibold mb-4">Layers</h3>
                                    {/* Add layer controls here */}
                                </div>
                            )}
                            {activeSidebar === 'settings' && (
                                <div className="space-y-6">
                                    <h3 className="font-semibold mb-4">Settings</h3>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Colormap Type</label>
                                            <Select
                                                value={colormapSettings.type}
                                                onValueChange={(value) => {
                                                    if (value === 'none') {
                                                        setColormapSettings(prev => ({ ...prev, type: value }))
                                                    } else {
                                                        setColormapSettings(prev => ({ ...prev, type: value }))
                                                    }
                                                }
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select colormap" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {['none', 'jet', 'rainbow', 'portland', 'bone'].map(type => (
                                                        <SelectItem key={type} value={type}>
                                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Min Value</label>
                                            <Slider
                                                value={[colormapSettings.min]}
                                                min={-2}
                                                max={2}
                                                step={0.1}
                                                onValueChange={([value]) => setColormapSettings(prev => ({ ...prev, min: Math.min(value, colormapSettings.max) }))}
                                            />
                                            <div className="flex justify-between text-xs">
                                                <span>{colormapSettings.min}</span>
                                                <span>2</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Max Value</label>
                                            <Slider
                                                value={[colormapSettings.max]}
                                                min={-2}
                                                max={2}
                                                step={0.1}
                                                onValueChange={([value]) => setColormapSettings(prev => ({ ...prev, max: Math.max(value, colormapSettings.min) }))}
                                            />
                                            <div className="flex justify-between text-xs">
                                                <span>-2</span>
                                                <span>{colormapSettings.max}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Steps</label>
                                            <Slider
                                                value={[colormapSettings.steps]}
                                                min={5}
                                                max={20}
                                                step={1}
                                                onValueChange={([value]) => setColormapSettings(prev => ({ ...prev, steps: value }))}
                                            />
                                            <div className="flex justify-between text-xs">
                                                <span>5</span>
                                                <span>{colormapSettings.steps}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Transparency</label>
                                            <Slider
                                                value={[colormapSettings.alpha]}
                                                min={0}
                                                max={1}
                                                step={0.1}
                                                onValueChange={([value]) => setColormapSettings(prev => ({ ...prev, alpha: value }))}
                                            />
                                            <div className="flex justify-between text-xs">
                                                <span>0</span>
                                                <span>{colormapSettings.alpha}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => setColormapSettings(prev => ({ ...prev, reverse: !prev.reverse }))}
                                            >
                                                {colormapSettings.reverse ? "Reverse Colors: On" : "Reverse Colors: Off"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeSidebar === 'info' && (
                                <div>
                                    <h3 className="font-semibold mb-4">Information</h3>
                                    {/* Add information content here */}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="fixed right-4 top-4 pointer-events-auto z-50">
                    <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full shadow-lg overflow-hidden">
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
                                    if (e.key === 'Enter') {
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

        </div>
    );
};

export default GeoTIFFMap;
