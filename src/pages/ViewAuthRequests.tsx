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
import { RefreshCw } from "lucide-react";

function ViewAuthRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]); // For displaying filtered requests
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllRequests();
      const reversedData = data.reverse();
      setRequests(reversedData);
      setFilteredRequests(reversedData); // Initialize filtered requests
    } catch (err) {
      setError("Error fetching requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const lowerQuery = query.toLowerCase();
    setFilteredRequests(
      requests.filter(
        (request) =>
          request.firstName.toLowerCase().includes(lowerQuery) ||
          request.lastName.toLowerCase().includes(lowerQuery) ||
          request.email.toLowerCase().includes(lowerQuery)
      )
    );
  };

  const handleRefresh = () => {
    setSearchQuery("");
    fetchRequests();
  };

  const handleMessageClick = (message: string) => {
    setSelectedMessage(message);
  };

  const handleClosePopup = () => {
    setSelectedMessage(null);
  };

  const handleStatusChange = async (uniqueId: string, status: string) => {
    try {
      const updatedData = await updateStatus(uniqueId, status);
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.uniqueId === uniqueId
            ? { ...request, status: updatedData.updatedItem.status }
            : request
        )
      );
      handleSearch(searchQuery); // Reapply search filter after update
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Error updating status");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-4">Authorization Requests</h2>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="border border-gray-300 flex-1 rounded px-4 py-2 w-full"
        />
        <Button onClick={handleRefresh}  className="ml-4">
          <RefreshCw/>
        </Button>
      </div>

      {loading && <p className="text-center text-lg">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {filteredRequests.length > 0 ? (
        <>
          <p className="mb-4">Total Requests: {filteredRequests.length}</p>
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
              {filteredRequests.map((request) => (
                <tr key={request.uniqueId} className="border-b border-gray-300">
                  <td className="p-2 text-xs">{request.uniqueId}</td>
                  <td className="p-2 text-sm">
                    {request.firstName} {request.lastName}
                  </td>
                  <td className="p-2 text-sm">{request.email}</td>
                  <td className="p-2 text-sm">{request.dataSource}</td>
                  <td className="p-2 text-sm">{request.category}</td>
                  <td className="p-2 text-sm">{request.profileCategory}</td>
                  <td className="p-2 flex gap-2">
                    <Button
                      onClick={() => handleMessageClick(request.message)}
                      variant={"default"}
                    >
                      Show Message
                    </Button>
                    <Button
                      variant={"outline"}
                      onClick={() =>
                        window.open(request.fileUrl, "_blank", "noopener,noreferrer")
                      }
                      className="text-blue-500 hover:underline"
                    >
                      View File
                    </Button>

                    <Select
                      onValueChange={(value) =>
                        handleStatusChange(request.uniqueId, value)
                      }
                      value={request.status}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder="Choose Status"
                          className="flex-1"
                        />
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
