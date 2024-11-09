import React, { useState } from "react";

interface SatelliteDataSearchProps {
  satellites: string[];
  captureTypes: string[];
  bands: string[]; // Add an array of band options
  onSearch: (
    satellite: string,
    captureType: string,
    startDate: string,
    endDate: string,
    selectedBands: string[],
    parameterType: string
  ) => void;
  defaultStartDate?: string;
  defaultEndDate?: string;
}

const SatelliteDataSearch: React.FC<SatelliteDataSearchProps> = ({
  satellites,
  captureTypes,
  bands,
  onSearch,
  defaultStartDate = "",
  defaultEndDate = "",
}) => {
  const [satellite, setSatellite] = useState<string>(satellites[0] || "");
  const [captureType, setCaptureType] = useState<string>(captureTypes[0] || "");
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [bandOption, setBandOption] = useState<"All" | "Specific">("All");
  const [selectedBands, setSelectedBands] = useState<string[]>([]);
  const [parameterType, setParameterType] = useState<string>("DN");

  const handleBandOptionChange = (option: "All" | "Specific") => {
    setBandOption(option);
    setSelectedBands([]); // Reset selected bands when switching
  };

  const handleBandSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selected = Array.from(options)
      .filter((option) => option.selected)
      .map((option) => option.value);
    setSelectedBands(selected);
  };

  const handleSearch = () => {
    console.log(satellite, captureType, startDate, endDate, selectedBands, parameterType);
    onSearch(satellite, captureType, startDate, endDate, selectedBands, parameterType);
  };

  return (
    <div className="max-w-screen-md mx-auto p-4 bg-white">
      <h2 className="text-2xl font-semibold mb-4">Satellite Data Search</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Satellite Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Satellite</label>
          <select
            value={satellite}
            onChange={(e) => setSatellite(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {satellites.map((sat) => (
              <option key={sat} value={sat}>
                {sat}
              </option>
            ))}
          </select>
        </div>

        {/* Capture Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Capture Type</label>
          <select
            value={captureType}
            onChange={(e) => setCaptureType(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {captureTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Band Options */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Dataset</label>
          <div className="flex items-center space-x-4">
            <label>
              <input
                type="radio"
                name="bandOption"
                value="All"
                checked={bandOption === "All"}
                onChange={() => handleBandOptionChange("All")}
              />
              <span className="ml-2">All Band</span>
            </label>
            <label>
              <input
                type="radio"
                name="bandOption"
                value="Specific"
                checked={bandOption === "Specific"}
                onChange={() => handleBandOptionChange("Specific")}
              />
              <span className="ml-2">Specific Band</span>
            </label>
          </div>
          {bandOption === "Specific" && (
            <select
              multiple
              value={selectedBands}
              onChange={handleBandSelectChange}
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {bands.map((band) => (
                <option key={band} value={band}>
                  {band}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Parameter Type Selection */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Select Dataset Parameter Type</label>
          <div className="flex items-center space-x-4">
            {["DN", "Radiance", "BT", "Albedo"].map((type) => (
              <label key={type}>
                <input
                  type="radio"
                  name="parameterType"
                  value={type}
                  checked={parameterType === type}
                  onChange={(e) => setParameterType(e.target.value)}
                />
                <span className="ml-2">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Start Date Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date and Time</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* End Date Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={handleSearch}
          className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default SatelliteDataSearch;
