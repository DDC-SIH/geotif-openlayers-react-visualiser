import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css'; // OpenLayers CSS
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/WebGLTile';
import GeoTIFF from 'ol/source/GeoTIFF';

const GeoTIFFMap = () => {
    const tiffUrl = 'https://final-cog.s3.ap-south-1.amazonaws.com/output_cog122VISWeb.tif'; // URL to the GeoTIFF file
    const mapRef = useRef<HTMLDivElement>(null); // Reference to the map container
    const [map, setMap] = useState<Map | null>(null); // State to hold the map instance

    useEffect(() => {
        // Only initialize the map if it doesn't already exist
        if (!map) {
            const fetchGeoTIFF = async () => {
                // Fetch the GeoTIFF file (blob format)
                // const response = await fetch(tiffUrl);
                // const blob = await response.blob();

                // Create the GeoTIFF source
                const geoTIFFSource = new GeoTIFF({
                    sources: [
                        {
                            url: tiffUrl,
                            bands: [1],
                            min: 0,
                            max: 491,
                        },
                    ],
                });

                // Initialize the map
                const openLayersMap = new Map({
                    target: mapRef.current as HTMLElement,
                    layers: [
                        new TileLayer({
                            source: geoTIFFSource,
                            
                            
                        }),
                    ],
                    view: new View({
                        center: [0, 0], // Default center, will update once the extent is determined
                        zoom: 2,         // Default zoom level
                    }),
                });

                // Once the GeoTIFF source is ready, update the view with proper extent
                geoTIFFSource.getView().then((viewConfig) => {
                    // Ensure the map shows the full extent of the GeoTIFF
                    openLayersMap.getView().fit(viewConfig.extent, { size: openLayersMap.getSize() });
                });

                // Save the map instance to state
                setMap(openLayersMap);
            };

            fetchGeoTIFF();
        }

        // Cleanup function to remove the map when the component is unmounted
        return () => {
            if (map) {
                map.setTarget(null); // Remove the map target when unmounting
                setMap(null); // Clear the map state
            }
        };
    }, [tiffUrl, map]); // Only rerun effect if tiffUrl or map state changes

    return <div id="map" ref={mapRef} style={{ width: '100%', height: '100vh' }} />;
};

export default GeoTIFFMap;
