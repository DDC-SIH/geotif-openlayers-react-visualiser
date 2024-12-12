import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { TiffInfo } from '../types/tiff-info'

interface AdvancedOptionsProps {
  options: Record<string, any>
  setOptions: React.Dispatch<React.SetStateAction<Record<string, any>>>
  bandIndexes: any
  setBandIndexes: React.Dispatch<React.SetStateAction<any>>
  tiffInfo: TiffInfo | null
}

export function AdvancedOptions({ options, setOptions, tiffInfo,bandIndexes,setBandIndexes }: AdvancedOptionsProps) {
  const handleOptionChange = (key: string, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const getMinMaxValues = () => {
    if (tiffInfo?.statistics && tiffInfo.statistics.b1) {
      const { min, max } = tiffInfo.statistics.b1
      return { min, max }
    }
    return { min: 0, max: 255 }
  }

  const { min, max } = getMinMaxValues()

  const handleBandIndexChange = (e:any) => {
    console.log(e.target.value)
    setBandIndexes(e.target.value)
}
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="dst_crs">Output CRS</Label>
        <Input
          id="dst_crs"
          value={options.dst_crs || ''}
          onChange={(e) => handleOptionChange('dst_crs', e.target.value)}
          placeholder="e.g., EPSG:3857"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="resampling">Resampling Method</Label>
        <Select value={options.resampling || 'nearest'} onValueChange={(value) => handleOptionChange('resampling', value)}>
          <SelectTrigger id="resampling">
            <SelectValue placeholder="Select resampling method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nearest">Nearest</SelectItem>
            <SelectItem value="bilinear">Bilinear</SelectItem>
            <SelectItem value="cubic">Cubic</SelectItem>
            <SelectItem value="cubic_spline">Cubic Spline</SelectItem>
            <SelectItem value="lanczos">Lanczos</SelectItem>
            <SelectItem value="average">Average</SelectItem>
            <SelectItem value="mode">Mode</SelectItem>
            <SelectItem value="gauss">Gauss</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="unscale"
          checked={options.unscale || false}
          onCheckedChange={(checked) => handleOptionChange('unscale', checked)}
        />
        <Label htmlFor="unscale">Apply Scale/Offset</Label>
      </div>


      <div className="space-y-2">
        <Label htmlFor="band_index">Band Index</Label>
        <Input
          id="band_index"
          value={bandIndexes}
          onChange={(e) => handleBandIndexChange(e)}
          placeholder={`e.g., 1, 2, 3`}
        />
    
      </div>
      <div className="space-y-2">
        <Label htmlFor="rescale">Rescale</Label>
        <Input
          id="rescale"
          value={options.rescale || ''}
          onChange={(e) => handleOptionChange('rescale', e.target.value)}
          placeholder={`e.g., ${min},${max}`}
        />
      </div>

    </div>
  )
}

