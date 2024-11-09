import { useEffect } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import 'ol/ol.css';
import { fromLonLat } from 'ol/proj';
import XYZ from 'ol/source/XYZ';
import LayerGroup from 'ol/layer/Group';
import { TileEndpoint } from '../../constants/consts';
import { useGeoData } from '../../contexts/GeoDataProvider';
import { GeoJSON } from '../../types/geojson';
import { GetBandMetaData } from '../utils/GetBandMetaData';
import { calculateCentroid } from '../utils/CalculateCentroid';

function MapComponent() {
    const { geoData, url,  loading, reqInfo } = useGeoData();
    useEffect(() => {
        if (geoData === null) {
            return;
        }
        const [longitude, latitude] = calculateCentroid((geoData as GeoJSON).geometry.coordinates);
        let titilerEndpoint = `${TileEndpoint}.${reqInfo.format}?url=${url}`;
        if (reqInfo.rescale && GetBandMetaData(geoData as GeoJSON) !== undefined) {
            titilerEndpoint = `${titilerEndpoint}&rescale=${GetBandMetaData(geoData as GeoJSON)[0].STATISTICS_MINIMUM},${GetBandMetaData(geoData as GeoJSON)[0].STATISTICS_MAXIMUM}`;
        }
        if (reqInfo.colormap_name && reqInfo.colormap_name !== undefined) {
            titilerEndpoint = `${titilerEndpoint}&colormap_name=${reqInfo.colormap_name}`;
        }
        const osmLayer = new TileLayer({
            preload: Infinity,
            source: new OSM(),
        })
        const tileLayer = new TileLayer({
            source: new XYZ({
                url: titilerEndpoint, // The TiTiler URL to fetch tiles
                maxZoom: (geoData as GeoJSON).properties.maxzoom,          // Set the maximum zoom level (adjust as needed)
                tileSize: 512,
            }),
        });
        const VisibleLayerGroup = new LayerGroup({
            layers: [osmLayer, tileLayer],
        })

        const map = new Map({
            target: 'map',
            layers: [VisibleLayerGroup],
            view: new View({
                center: fromLonLat([longitude, latitude]), // Adjust to your area of interest
                zoom: (geoData as GeoJSON).properties.minzoom,                     // Set the initial zoom level
            }),
        });

        return () => map.setTarget(undefined)
    }, [loading, reqInfo, geoData, url]);

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <>
            <div style={{ height: '90vh', width: '100%' }} id="map" className="map-container top-0 left-0" />
        </>
    );
}

export default MapComponent;