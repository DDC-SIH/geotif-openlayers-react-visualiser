import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface BboxInputsProps {
  bbox: { minx: number; miny: number; maxx: number; maxy: number }
  setBbox: React.Dispatch<React.SetStateAction<{ minx: number; miny: number; maxx: number; maxy: number }>>
}

export function BboxInputs({ bbox, setBbox }: BboxInputsProps) {
  const handleBboxChange = (key: keyof typeof bbox, value: string) => {
    setBbox(prev => ({ ...prev, [key]: parseFloat(value) || 0 }))
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="minx">Min X</Label>
        <Input
          id="minx"
          type="number"
          value={bbox.minx}
          onChange={(e) => handleBboxChange('minx', e.target.value)}
          required
          step="0.000001"
          min="-180"
          max="180"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="miny">Min Y</Label>
        <Input
          id="miny"
          type="number"
          value={bbox.miny}
          onChange={(e) => handleBboxChange('miny', e.target.value)}
          required
          step="0.000001"
          min="-90"
          max="90"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="maxx">Max X</Label>
        <Input
          id="maxx"
          type="number"
          value={bbox.maxx}
          onChange={(e) => handleBboxChange('maxx', e.target.value)}
          required
          step="0.000001"
          min="-180"
          max="180"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="maxy">Max Y</Label>
        <Input
          id="maxy"
          type="number"
          value={bbox.maxy}
          onChange={(e) => handleBboxChange('maxy', e.target.value)}
          required
          step="0.000001"
          min="-90"
          max="90"
        />
      </div>
    </div>
  )
}

