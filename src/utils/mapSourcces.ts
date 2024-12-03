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
    name: "CartoDB Voyager",
    type: "Voyager",
    previewUrl: "https://placehold.co/100x100?text=Voyager",
    layer: new TileLayer({
      source: new XYZ({
        url: "https://{a-d}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
      }),
    }),
  },
  {
    name: "Satellite Imagery",
    type: "Satellite Imagery",
    previewUrl: "https://placehold.co/100x100?text=Esri",
    layer: new TileLayer({
      source: new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      }),
    }),
  },

  {
    name: "Google Satellite",
    type: "Satellite",
    previewUrl: "https://placehold.co/100x100?text=GSat",
    layer: new TileLayer({
      source: new XYZ({
        url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      }),
    }),
  },
  {
    name: "Google Hybrid",
    type: "Satellite with Labels",
    previewUrl: "https://placehold.co/100x100?text=Hybrid",
    layer: new TileLayer({
      source: new XYZ({
        url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      }),
    }),
  },
  {
    name: "Google Streets",
    type: "Street Map",
    previewUrl: "https://placehold.co/100x100?text=GStreets",
    layer: new TileLayer({
      source: new XYZ({
        url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      }),
    }),
  },
  {
    name: "Google Terrain",
    type: "Terrain",
    previewUrl: "https://placehold.co/100x100?text=GTerrain",
    layer: new TileLayer({
      source: new XYZ({
        url: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
      }),
    }),
  },
  {
    name: "OpenTopoMap",
    type: "Topographic",
    previewUrl: "https://placehold.co/100x100?text=Topo",
    layer: new TileLayer({
      source: new XYZ({
        url: "https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png",
      }),
    }),
  },
  {
    name: "Dark Matter",
    type: "Dark Theme",
    previewUrl: "https://placehold.co/100x100?text=Dark",
    layer: new TileLayer({
      source: new XYZ({
        url: "https://cartodb-basemaps-{a-c}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png",
      }),
    }),
  },
  {
    name: "Positron",
    type: "Light Theme",
    previewUrl: "https://placehold.co/100x100?text=Light",
    layer: new TileLayer({
      source: new XYZ({
        url: "https://cartodb-basemaps-{a-c}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
      }),
    }),
  },
  {
    name: "Thunderforest Outdoors",
    type: "Outdoor",
    previewUrl: "https://placehold.co/100x100?text=Outdoor",
    layer: new TileLayer({
      source: new XYZ({
        url: "https://{a-c}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=7cbcf31e3c6c4a7bb650ba30c3792669"
      })
    })
  },
{
    name: "OpenCycleMap",
    type: "Cycling",
    previewUrl: "https://placehold.co/100x100?text=Cycle",
    layer: new TileLayer({
      source: new XYZ({
        url: "https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=7cbcf31e3c6c4a7bb650ba30c3792669"
      })
    })
  },
  {
    name: "Transport",
    type: "Transport",
    previewUrl: "https://placehold.co/100x100?text=Transport",
    layer: new TileLayer({
      source: new XYZ({
        url: "https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=7cbcf31e3c6c4a7bb650ba30c3792669"
      })
    })
  },
  {
    name: "Landscape",
    type: "Landscape",
    previewUrl: "https://placehold.co/100x100?text=Landscape",
    layer: new TileLayer({
      source: new XYZ({
        url: "https://tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=7cbcf31e3c6c4a7bb650ba30c3792669"
      })
    })
  },
  {
    name: "Transport Dark",
    type: "Transport Dark",
    previewUrl: "https://placehold.co/100x100?text=TransDark",
    layer: new TileLayer({
      source: new XYZ({
        url: "https://tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey=7cbcf31e3c6c4a7bb650ba30c3792669"
      })
    })
  },
  {
    name: "Spinal Map",
    type: "Spinal",
    previewUrl: "https://placehold.co/100x100?text=Spinal",
    layer: new TileLayer({
      source: new XYZ({
        url: "https://tile.thunderforest.com/spinal-map/{z}/{x}/{y}.png?apikey=7cbcf31e3c6c4a7bb650ba30c3792669"
      })
    })
  },
  {
    name: "Pioneer",
    type: "Pioneer",
    previewUrl: "https://placehold.co/100x100?text=Pioneer",
    layer: new TileLayer({
      source: new XYZ({
        url: "https://tile.thunderforest.com/pioneer/{z}/{x}/{y}.png?apikey=7cbcf31e3c6c4a7bb650ba30c3792669"
      })
    })
  },
  {
    name: "Mobile Atlas",
    type: "Mobile",
    previewUrl: "https://placehold.co/100x100?text=Mobile",
    layer: new TileLayer({
      source: new XYZ({
        url: "https://tile.thunderforest.com/mobile-atlas/{z}/{x}/{y}.png?apikey=7cbcf31e3c6c4a7bb650ba30c3792669"
      })
    })
  },
  {
    name: "Neighbourhood",
    type: "Neighbourhood",
    previewUrl: "https://placehold.co/100x100?text=Neighbour",
    layer: new TileLayer({
      source: new XYZ({
        url: "https://tile.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey=7cbcf31e3c6c4a7bb650ba30c3792669"
      })
    })
  },
  {
    name: "Atlas",
    type: "Atlas",
    previewUrl: "https://placehold.co/100x100?text=Atlas",
    layer: new TileLayer({
      source: new XYZ({
        url: "https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=7cbcf31e3c6c4a7bb650ba30c3792669"
      })
    })
  },
  {
    name: "CyclOSM",
    type: "Cycling",
    previewUrl: "https://placehold.co/100x100?text=Cycle",
    layer: new TileLayer({
      source: new XYZ({
        url: "https://{a-c}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
      })
    })
  },
  {
    name: "Humanitarian",
    type: "Humanitarian",
    previewUrl: "https://placehold.co/100x100?text=HDM",
    layer: new TileLayer({
      source: new XYZ({
        url: "https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
      })
    })
  },

  {
    name: "Wikimedia Maps",
    type: "Wiki",
    previewUrl: "https://placehold.co/100x100?text=Wiki",
    layer: new TileLayer({
      source: new XYZ({
        url: "https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png"
      })
    })
  },

  {
    name: "ArcGIS Topo",
    type: "Topographic",
    previewUrl: "https://placehold.co/100x100?text=ArcTopo",
    layer: new TileLayer({
      source: new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
      })
    })
  },
  
]