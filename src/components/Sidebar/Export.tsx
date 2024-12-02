import { useState } from 'react';
import { Button } from '../ui/button';
import { useGeoData } from '../../../contexts/GeoDataProvider';
import { Switch } from "../ui/switch";

export default function Export() {
    const { boundingBox, setSelectedAOI, selectedAOI } = useGeoData();
    const [selected, setSelected] = useState({
        aoi: false,
        effects: false,
    });
    const handleClick = (type: 'aoi' | 'effects') => {
        setSelected(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    const handleExport = () => {
        // Logic to export data
    };

    const handleSendAOI = () => {
        // Logic to send AOI
    };

    return (
        <div className="space-y-6 p-2">
            <h3 className="font-semibold ">Export Options</h3>
            <div className='flex flex-col'>
                <div className='flex justify-between'>
                    <div className='font-semibold'>Send AOI</div>
                    <Switch
                        checked={selected.aoi}
                        onCheckedChange={() => handleClick('aoi')}
                    />
                </div>
                {selected.aoi &&
                    <p className="text-sm">To select AOI, press Ctrl + drag</p>
                }
                {boundingBox && selected.aoi && (
                    <div className="mt-4   rounded flex flex-col">
                        <h4 className="font-semibold">Selected AOI</h4>
                        <p className="text-sm">North: {boundingBox[0]}</p>
                        <p className="text-sm">South: {boundingBox[1]}</p>
                        <p className="text-sm">East: {boundingBox[2]}</p>
                        <p className="text-sm">West: {boundingBox[3]}</p>
                    </div>
                )}
                <div className='flex justify-between mt-5'>
                    <div className='font-semibold'>Send Effects</div>
                    <Switch
                        checked={selected.effects}
                        onCheckedChange={() => handleClick('effects')}
                    />
                </div>
                <Button
                    className="px-4 py-2 mt-4"
                    onClick={handleExport}
                >
                    Export
                </Button>
            </div>
        </div>
    );
}
