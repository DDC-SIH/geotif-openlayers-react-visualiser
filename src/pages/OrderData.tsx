import { useEffect, useState } from 'react';
import { fetchGroupedFiles } from '../api-client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DataItem {
    GroupName: string;
    StartDateTime: string;
    EndDateTime: string;
    Versions: string[];
}
function OrderData() {
const navigate = useNavigate();
    const [data, setData] = useState<DataItem[]>([]);
    

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await fetchGroupedFiles();
                setData(result);
            } catch (error:any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleOrderButtonClick = (groupName: string, startDateTime: string, endDateTime: string, version:string) => {
        const formattedStartDateTime = new Date(startDateTime).toISOString().replace(/[-:.]/g, '').slice(0, -5);
        const formattedEndDateTime = new Date(endDateTime).toISOString().replace(/[-:.]/g, '').slice(0, -5);
        navigate(`/preview/?p=${groupName}&st=${formattedStartDateTime}&ed=${formattedEndDateTime}&v=${version}`);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold my-4">Order Data</h1>
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="py-2">Sl No</th>
                        <th className="py-2">Product Name</th>
                        <th className="py-2">Start Date and Time</th>
                        <th className="py-2">End Date and Time</th>
                        <th className="py-2">Version</th>
                        <th className="py-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td className="border px-4 py-2">{index + 1}</td>
                            <td className="border px-4 py-2">{item.GroupName}</td>
                            <td className="border px-4 py-2">{new Date(item.StartDateTime).toLocaleString()}</td>
                            <td className="border px-4 py-2">{new Date(item.EndDateTime).toLocaleString()}</td>
                            <td className="border px-4 py-2">
                                <select className="w-full border px-2 py-1" id={`version-select-${index}`}>
                                    {item.Versions.map((version, vIndex) => (
                                        <option key={vIndex} value={version}>{version}</option>
                                    ))}
                                </select>
                            </td>
                            <td className="border px-4 py-2">
                                <Button className="w-full px-4 py-2 rounded" onClick={() => handleOrderButtonClick(item.GroupName, item.StartDateTime, item.EndDateTime, (document.querySelector(`#version-select-${index}`) as HTMLSelectElement).value)}>Order</Button>
                            </td>
                        
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default OrderData;