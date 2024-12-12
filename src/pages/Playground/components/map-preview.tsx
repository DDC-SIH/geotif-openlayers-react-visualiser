"use client"

import { useEffect, useRef, useState } from 'react'
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat, transformExtent } from 'ol/proj'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Feature } from 'ol'
import { Polygon } from 'ol/geom'
import Draw from 'ol/interaction/Draw'
import XYZ from 'ol/source/XYZ'
import { TiffInfo, BoundingBox } from '../types/tiff-info'

const ENDPOINT = "https://5ng8ntubj6.execute-api.ap-south-1.amazonaws.com"

interface MapPreviewProps {
  bbox: BoundingBox
  url: string
  min: number
  max: number
  tiffInfo: TiffInfo | null
  setBbox: React.Dispatch<React.SetStateAction<BoundingBox>>
}

export function MapPreview({ bbox, url, tiffInfo, setBbox, min, max }: MapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<Map | null>(null)
  const [drawInteraction, setDrawInteraction] = useState<Draw | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: fromLonLat([(bbox.minx + bbox.maxx) / 2, (bbox.miny + bbox.maxy) / 2]),
        zoom: 2
      })
    })

    mapInstanceRef.current = map

    const draw = new Draw({
      source: new VectorSource(),
      type: 'Polygon'
    })

    draw.on('drawend', (event) => {
      const feature = event.feature
      const geometry = feature.getGeometry() as Polygon
      const extent = geometry.getExtent()
      const [minx, miny, maxx, maxy] = transformExtent(extent, 'EPSG:3857', 'EPSG:4326')
      setBbox({ minx, miny, maxx, maxy })
    })

    map.addInteraction(draw)
    setDrawInteraction(draw)

    return () => {
      map.setTarget(undefined)
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current || !url || !tiffInfo) return

    const extent = tiffInfo.bounds

    // Remove existing layers
    mapInstanceRef.current.getLayers().clear()

    // Add OSM base layer
    const osmLayer = new TileLayer({
      source: new OSM()
    })
    mapInstanceRef.current.addLayer(osmLayer)

    // Add TIFF layer using XYZ tiling
    const tiffLayer = new TileLayer({
      source: new XYZ({
        url: `${ENDPOINT}/cog/tiles/WebMercatorQuad/{z}/{x}/{y}?url=${encodeURIComponent(url)}`,
        maxZoom: 20,
      })
    })
    mapInstanceRef.current.addLayer(tiffLayer)

    // Update view
    mapInstanceRef.current.getView().fit(extent, { padding: [50, 50, 50, 50] })
  }, [bbox, url, tiffInfo])

  return <div ref={mapRef} className="w-full h-64 rounded-lg overflow-hidden" />
}

