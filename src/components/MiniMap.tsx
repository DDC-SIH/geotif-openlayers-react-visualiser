import React, { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/WebGLTile';
import XYZ from 'ol/source/XYZ';
import 'ol/ol.css';
import GeoTIFF from 'ol/source/GeoTIFF';
import { fromLonLat } from 'ol/proj';

interface MiniMapProps {
    geotiffUrl: string;
    minValue?: number;
    maxValue?: number;
    mapHeight?: string;
    zoomOut?: boolean; // New prop to enable the most zoomed-out view
    zoomedToTheBounding?: boolean; // New prop to enable zooming to layer's bounding box
}

export default function MiniMap({ geotiffUrl, minValue = 35, maxValue = 493, zoomOut = false, zoomedToTheBounding = false, mapHeight='438px' }: MiniMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<Map | null>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        const satelliteLayer = new TileLayer({
            source: new XYZ({
                url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
                maxZoom: 20,
                attributions: '© Google',
            }),
        });

        const geoTiffSource = new GeoTIFF({
            sources: [
                {
                    url: geotiffUrl,
                    bands: [1],
                    min: minValue,
                    max: maxValue,
                },
            ],
        });

        const tiffLayer = new TileLayer({
            className: 'tiff',
            source: geoTiffSource,
        });

        const mapView = new View({
            center: fromLonLat([78.9629, 20.5937]),
            zoom: zoomOut ? 2 : 5, // Adjust zoom based on the zoomOut prop
            maxZoom: 19,
            minZoom: 2,
        });

        const map = new Map({
            target: mapRef.current,
            layers: [satelliteLayer, tiffLayer],
            view: mapView,
        });

        mapInstanceRef.current = map;

        if (zoomOut) {
            mapView.animate({ zoom: 2, duration: 1000 }); // Add animation for zoomOut
        }
        if (zoomedToTheBounding) {
            geoTiffSource.on('change', () => {
                if (geoTiffSource.getState() === 'ready') {
                    const extent = geoTiffSource.getTileGrid()?.getExtent();
                    if (extent) {
                        const padding = 0.1; // Add 10% padding around the bounding box
                        const expandedExtent = [
                            extent[0] - (extent[2] - extent[0]) * padding,
                            extent[1] - (extent[3] - extent[1]) * padding,
                            extent[2] + (extent[2] - extent[0]) * padding,
                            extent[3] + (extent[3] - extent[1]) * padding,
                        ];
                        mapView.fit(expandedExtent, { duration: 1500 });
                    }
                }
            });
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setTarget(undefined);
                mapInstanceRef.current = null;
            }
        };
    }, [geotiffUrl, zoomOut, zoomedToTheBounding]); // Reinitialize map if props change

    return (
        <div className={`relative w-full h-[${mapHeight}] rounded-lg`} style={{ zIndex: 0 }}>
            <div 
                ref={mapRef} 
                className="absolute inset-0 rounded-lg"
                style={{ 
                    height: '100%', 
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                }} 
            />
        </div>
    );
}
