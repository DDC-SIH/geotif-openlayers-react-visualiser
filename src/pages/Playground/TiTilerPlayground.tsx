"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { toast } from "@/components/use-toast"
import { BboxInputs } from './components/bbox-inputs'
import { AdvancedOptions } from './components/advanced-options'
import { ImageDisplay } from './components/image-display'
import { MapPreview } from './components/map-preview'
import { TiffInfo, BoundingBox } from './types/tiff-info'
import { uploadTifFile } from '@/api-client'

const ENDPOINT = "https://5ng8ntubj6.execute-api.ap-south-1.amazonaws.com"




export default function TiTilerPlayground() {
  const [url, setUrl] = useState("https://kdg-raw.s3.ap-south-1.amazonaws.com/test_combined.tif")
  const [bbox, setBbox] = useState<BoundingBox>({ minx: -180, miny: -90, maxx: 180, maxy: 90 })
  const [width, setWidth] = useState(256)
  const [height, setHeight] = useState(256)
  const [format, setFormat] = useState("png")
  const [advancedOptions, setAdvancedOptions] = useState({})
  const [imageUrl, setImageUrl] = useState("")
  const [apiUrl, setApiUrl] = useState("")
  const [curlCommand, setCurlCommand] = useState("")
  const [tiffInfo, setTiffInfo] = useState<TiffInfo | null>(null)
  const [bandArithmetic, setBandArithmetic] = useState("")
  const [colorMap, setColorMap] = useState("")
  const [bandIndexes, setBandIndexes] = useState<string>(""); // Add this state

  useEffect(() => {
    if (url) {
      fetchTiffInfo(url)
    }
  }, [url])




  const fetchTiffInfo = async (tiffUrl: string) => {
    try {
      const [infoResponse, statsResponse] = await Promise.all([
        fetch(`${ENDPOINT}/cog/info?url=${encodeURIComponent(tiffUrl)}`),
        fetch(`${ENDPOINT}/cog/statistics?url=${encodeURIComponent(tiffUrl)}`)
      ])
      
      if (!infoResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch TIFF info or statistics')
      }
      
      const infoData: TiffInfo = await infoResponse.json()
      const statsData = await statsResponse.json()
      
      const updatedTiffInfo: TiffInfo = {
        ...infoData,
        statistics: statsData
      }
      
      setTiffInfo(updatedTiffInfo)
      setBbox({
        minx: parseFloat(updatedTiffInfo.bounds[0].toFixed(2)),
        miny: parseFloat(updatedTiffInfo.bounds[1].toFixed(2)),
        maxx: parseFloat(updatedTiffInfo.bounds[2].toFixed(2)),
        maxy: parseFloat(updatedTiffInfo.bounds[3].toFixed(2))
      })
      setWidth(updatedTiffInfo.width)
      setHeight(updatedTiffInfo.height)
    } catch (error) {
      console.error('Error fetching TIFF info:', error)
    //   toast({ title: "Error", description: "Failed to fetch TIFF info", variant: "destructive" })
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      const result = await uploadTifFile(file);
      if (result && result.data.Location) {
        setUrl(result.data.Location); // Update URL state with the S3 URL
      }
    } catch (error) {
      console.error("File upload failed:", error);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

      // Parse band indexes into URL params
      console.log(bandIndexes)
const bandParams = bandIndexes
    .split(',')
    .filter(value => value.trim() !== "")
    .map((value, index) => `bidx${index + 1}=${value.trim()}`)
    .join('&');


  const queryParams = new URLSearchParams({ 
    url, 
    ...advancedOptions,
    ...(bandArithmetic && { expression: bandArithmetic }),
    ...(colorMap && colorMap !== 'none' && { colormap_name: colorMap })
  });
    const bboxString = `${bbox.minx},${bbox.miny},${bbox.maxx},${bbox.maxy}`
    const generatedApiUrl = `${ENDPOINT}/cog/bbox/${bboxString}/${width}x${height}.${format}?${queryParams}&${bandParams}`;
    setApiUrl(generatedApiUrl)
    setCurlCommand(`curl -X 'GET' "${generatedApiUrl}" -H 'accept: image/png' --output preview.png`)
    console.log(generatedApiUrl)
    try {
      const response = await fetch(generatedApiUrl)
      console.log(response)
      if (!response.ok) throw new Error('API request failed')
      setImageUrl(`${ENDPOINT}/cog/bbox/${bboxString}/${width}x${height}.png?${queryParams}&${bandParams}`)
    //   toast({ title: "Success", description: "Image generated successfully" })
    } catch (error) {
    //   toast({ title: "Error", description: "Failed to generate image", variant: "destructive" })
    }
  }

  return (
    <Card className="w-full max-w-5xl my-10 mx-auto">
      <CardHeader>
        <CardTitle className='text-4xl'>Data Interaction Platform</CardTitle>
        <CardDescription className='text-xl'>Manipulate Your .tif files in realtime</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
          <Label htmlFor="upload">Upload TIFF File</Label>
            <Input
              id="upload"
              type="file"
              accept=".tif"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url">TIFF URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter TIFF URL"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bandArithmetic">Custom Band Arithmetic</Label>
            <Input
              id="bandArithmetic"
              value={bandArithmetic}
              onChange={(e) => setBandArithmetic(e.target.value)}
              placeholder="e.g., b1/b2"
            />
          </div>
          <div>
            <Label htmlFor="bandArithmetic">Example Description (rio-tiler's band math expression)</Label>
            <p><b>b1/b2;b2+b3</b>  -  Semicolon (;) delimited expressions (band1: b1/b2, band2: b2+b3).</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="colorMap">Color Map</Label>
            <Select value={colorMap} onValueChange={setColorMap}>
              <SelectTrigger id="colorMap">
                <SelectValue placeholder="Select color map" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="viridis">Viridis</SelectItem>
                <SelectItem value="plasma">Plasma</SelectItem>
                <SelectItem value="inferno">Inferno</SelectItem>
                <SelectItem value="magma">Magma</SelectItem>
                <SelectItem value="cividis">Cividis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BboxInputs bbox={bbox} setBbox={setBbox} />
            {/* <MapPreview bbox={bbox} url={url} tiffInfo={tiffInfo} setBbox={setBbox}  min={updatedTiffInfo.statistics[b1].min}/> */}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Width</Label>
              <Slider
                id="width"
                min={1}
                max={tiffInfo?.width || 2048}
                step={1}
                value={[width]}
                onValueChange={(value) => setWidth(value[0])}
              />
              <div className="text-right">{width}px</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Slider
                id="height"
                min={1}
                max={tiffInfo?.height || 2048}
                step={1}
                value={[height]}
                onValueChange={(value) => setHeight(value[0])}
              />
              <div className="text-right">{height}px</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger id="format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="tif">TIFF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="basic">
            <TabsList>
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
            </TabsList>
            <TabsContent value="basic">
              <p>Basic options are set above.</p>
            </TabsContent>
            <TabsContent value="advanced">
              <AdvancedOptions bandIndexes={bandIndexes} setBandIndexes={setBandIndexes} options={advancedOptions} setOptions={setAdvancedOptions} tiffInfo={tiffInfo} />
            </TabsContent>
          </Tabs>

          <Button type="submit">Generate Image</Button>
        </form>

        <div className="mt-6">
          {apiUrl && (
                <><h3 className="text-lg font-semibold mb-2">Generated API URL</h3><div className="flex items-center space-x-2">
                          <Input value={apiUrl} readOnly className="flex-grow" />
                          <Button
                              onClick={() => {
                                  navigator.clipboard.writeText(apiUrl)
                                  //   toast({ title: "Copied", description: "API URL copied to clipboard" })
                              } }
                          >
                              Copy
                          </Button>
                      </div></>
          )}
          {curlCommand && (
                <><h3 className="mt-4 text-lg font-semibold mb-2">Curl Command</h3><div className="flex items-center space-x-2">
                          <Input value={curlCommand.replace('.tif', '.png')} readOnly className="flex-grow" />
                          <Button
                              onClick={() => {
                                  navigator.clipboard.writeText(curlCommand)
                                  //   toast({ title: "Copied", description: "API URL copied to clipboard" })
                              } }
                          >
                              Copy
                          </Button>
                      </div></>
          )}
        </div>
        <ImageDisplay imageUrl={imageUrl} />
      </CardContent>
    </Card>
  )
}

