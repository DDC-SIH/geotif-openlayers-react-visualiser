import { useEffect, useRef, useState } from 'react';
import GeoJSON from 'ol/format/GeoJSON.js';
import 'ol/ol.css'; // OpenLayers CSS
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/WebGLTile';
import GeoTIFF from 'ol/source/GeoTIFF';
import colormap from 'colormap';
import { applyTransform } from 'ol/extent';
import { get as getProjection, getTransform, Projection } from 'ol/proj';
import { fromEPSGCode, register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { StadiaMaps } from 'ol/source';
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
    const tiffUrl = 'https://final-cog.s3.ap-south-1.amazonaws.com/INS.tif'; // URL to the GeoTIFF file
    const mapRef = useRef<HTMLDivElement>(null); // Reference to the map container
    const mapInstanceRef = useRef<Map | null>(null);  // New ref for map instance
    const [searchQuery, setSearchQuery] = useState<string>('');


    function getColorStops(name: string, min: number, max: number, steps: number, reverse: boolean) {
        const delta = (max - min) / (steps - 1);
        const stops = new Array(steps * 2);
        const colors = colormap({ colormap: name, nshades: steps, format: 'rgba', alpha: 0.7 });
        if (reverse) {
            colors.reverse();
        }
        for (let i = 0; i < steps; i++) {
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
    useEffect(() => {
        if (!mapInstanceRef.current && mapRef.current) {
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

                const openLayersMap = new Map({
                    target: mapRef.current as HTMLElement,
                    layers: [
                        // background,
                        new TileLayer({
                            source: geoTIFFSource,
                            // style: {
                            //     color: [
                            //         'interpolate',
                            //         ['linear'],
                            //         ['/', ['band', 1], 2],
                            //         ...getColorStops('jet', -0.5, 1, 10, true),
                            //     ],
                            // },
                        }), clipLayer
                    ],
                    view: geoTIFFSource
                        .getView()
                        .then((viewConfig) =>
                            fromEPSGCode(viewConfig?.projection?.getCode()).then(() => viewConfig),
                        ),
                });

                mapInstanceRef.current = openLayersMap;

                geoTIFFSource.getView().then((viewConfig) => {
                    if (viewConfig?.extent) {
                        openLayersMap.getView().fit(viewConfig.extent, { size: openLayersMap.getSize() });
                    }
                });
            };

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
        <div style={{
            height: '100vh',
            width: '100vw',
        }}>
            <div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a location"
                />
                <button onClick={() => search(searchQuery)}>Search</button>
            </div>
            <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />
        </div>
    );
};

export default GeoTIFFMap;
