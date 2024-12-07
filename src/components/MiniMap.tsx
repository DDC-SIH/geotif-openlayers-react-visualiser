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
}

export default function MiniMap({ geotiffUrl }: MiniMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<Map | null>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        const satelliteLayer = new TileLayer({
            source: new XYZ({
                url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
                maxZoom: 20,
                attributions: '© Google'
            })
        });

        const geoTiffSource = new GeoTIFF({
            sources: [{
                url: geotiffUrl,
                bands: [1],
                min: 35,
                max: 493,
            }]
        });

        const tiffLayer = new TileLayer({
            className: 'tiff',
            source: geoTiffSource
        });

        const map = new Map({
            target: mapRef.current,
            layers: [satelliteLayer, tiffLayer],
            view: new View({
                center: fromLonLat([78.9629, 20.5937]),
                zoom: 5,
                maxZoom: 19,
                minZoom: 2,
            })
        });

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setTarget(undefined);
                mapInstanceRef.current = null;
            }
        };
    }, [geotiffUrl]);

    return (
        <div className="relative w-full h-[400px]" style={{ zIndex: 0 }}>
            <div 
                ref={mapRef} 
                className="absolute inset-0"
                style={{ 
                    height: '100%', 
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden'
                }} 
            />
        </div>
    );
}
