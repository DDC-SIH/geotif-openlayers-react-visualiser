import { fetchAllRequests, updateStatus } from "@/api-client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";


function ViewAuthRequests() {
  const [requests, setRequests] = useState<any[]>([]);  // Array to store fetched requests
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);  // To store selected message for the popup

  useEffect(() => {
    const getAllRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAllRequests();
        setRequests(data.reverse()); 
      } catch (err) {
        setError('Error fetching requests');
      } finally {
        setLoading(false);
      }
    };

    getAllRequests();
  }, []);

  const handleMessageClick = (message: string) => {
    setSelectedMessage(message);  // Set the message to be shown in the popup
  };

  const handleClosePopup = () => {
    setSelectedMessage(null);  // Close the popup by clearing the selected message
  };

  const handleStatusChange = async (uniqueId: string, status: string) => {
    try {
      const updatedData = await updateStatus(uniqueId, status);
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.uniqueId === uniqueId ? { ...request, status: updatedData.updatedItem.status } : request
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Error updating status");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-4">Authorization Requests</h2>

      {loading && <p className="text-center text-lg">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {requests.length > 0 ? (
        <>
          <p className="mb-4">Total Requests: {requests.length}</p>
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Datasource</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Profile</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.uniqueId} className="border-b border-gray-300">
                  <td className="p-2 text-xs">{request.uniqueId}</td>
                  <td className="p-2 text-sm">{request.firstName}{" "}{request.lastName}</td>
                  <td className="p-2 text-sm">{request.email}</td>
                  <td className="p-2 text-sm">{request.dataSource}</td>
                  <td className="p-2 text-sm">{request.category}</td>
                  <td className="p-2 text-sm">{request.profileCategory}</td>
                  <td className="p-2 flex gap-2">
                    <Button onClick={() => handleMessageClick(request.message)} variant={'default'}>
                      Show Message
                    </Button>
                    <Button
                    variant={'outline'}
                      onClick={() => window.open(request.fileUrl, '_blank', 'noopener,noreferrer')}
                      className="text-blue-500 hover:underline"
                    >
                      View File
                    </Button>


                <Select onValueChange={(value) => handleStatusChange(request.uniqueId, value)} value= {request.status}>
                    <SelectTrigger >
                        <SelectValue placeholder="Choose Status"  className="flex-1"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="DECLINED">Declined</SelectItem>
                        <SelectItem value="ACCEPTED">Accepted</SelectItem>
                    </SelectContent>
                </Select>
                  
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p>No requests available.</p>
      )}

      {selectedMessage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">Message</h3>
            <p>{selectedMessage}</p>
            <div className="mt-4">
              <button
                onClick={handleClosePopup}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewAuthRequests;

