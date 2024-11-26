import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import StadiaMaps from "ol/source/StadiaMaps";
import XYZ from "ol/source/XYZ";


export const mapSources = [
    {
        name: "Stadia Maps",
        type: "Stamen Toner",
        previewUrl: "https://placehold.co/100x100?text=Stadia",
        layer: new TileLayer({
            source: new StadiaMaps({
                layer: "stamen_toner",
            }),
        }),
    },
    {
        name: "OpenStreetMap",
        type: "Street Map",
        previewUrl: "https://placehold.co/100x100?text=OSM",
        layer: new TileLayer({
            source: new OSM(),
        }),
    },
    {
        name: "Satellite",
        type: "Satellite Imagery",
        previewUrl: "https://placehold.co/100x100?text=Satellite",
        layer: new TileLayer({
            source: new XYZ({
                url: "https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png",
            }),
        }),
    },

];