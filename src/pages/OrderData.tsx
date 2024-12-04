import { useEffect, useState } from 'react';
import { fetchGroupedFiles } from '../api-client';

function OrderData() {
    interface DataItem {
        GroupName: string;
        StartDateTime: string;
        EndDateTime: string;
    }

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
                                <button className="bg-blue-500 w-full hover:bg-blue-600 text-white px-4 py-2 rounded">Order</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default OrderData;