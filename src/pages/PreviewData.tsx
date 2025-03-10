import { addDownload, searchFilesWithTime } from "@/api-client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, set } from "date-fns";
import { cn } from "@/lib/utils";
import type { TimePickerProps } from "antd";
import { TimePicker } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGeoData } from "../../contexts/GeoDataProvider";
import { OpenInNewWindowIcon } from "@radix-ui/react-icons";
import MiniMap from "@/components/MiniMap";
import { useAppContext } from "../../contexts/AppContext";

dayjs.extend(customParseFormat);

interface BandMetadata {
  wavelength: number;
  bandwidth: number;
  fill_value: number;
  data_range: { max: number; min: number };
  bits_per_pixel: number;
  resolution: number;
  dimensions: { width: number; height: number };
}

interface Band {
  metadata: BandMetadata;
  url: string;
}

interface ProductInfo {
  creation_time: string;
  title: string;
  type: string;
  level: string;
  file_name: string;
}

interface DateData {
  [date: string]: {
    [time: string]: {
      product_info: ProductInfo;
      bands: {
        [bandName: string]: Band;
      };
      satellite_info: {
        name: string;
        altitude: number;
        sensor: {
          name: string;
          id: string;
        };
      };
    };
  };
}

function extractBandFromUrl(url: string): string {
  const bandNamePattern = /IMG_(VIS|MIR|SWIR|WV|TIR1|TIR2|MIR_RADIANCE|SWIR_RADIANCE|TIR1_RADIANCE|TIR1_TEMP|TIR2_RADIANCE|TIR2_TEMP|VIS_ALBEDO|VIS_RADIANCE|WV_RADIANCE)_cog\.tif/;
  const match = url.match(bandNamePattern);

  if (match) {
    const bandName = match[1];
    console.log("Band Name:", bandName);
    // Use switch to handle each case
    switch (bandName) {
      case "VIS":
        return "VIS";
      case "MIR":
        return "MIR";
      case "SWIR":
        return "SWIR";
      case "WV":
        return "WV";
      case "TIR1":
        return "TIR1";
      case "TIR2":
        return "TIR2";
      case "MIR_RADIANCE":
        return "MIR_RADIANCE";
      case "SWIR_RADIANCE":
        return "SWIR_RADIANCE";
      case "TIR1_RADIANCE":
        return "TIR1_RADIANCE";
      case "TIR1_TEMP":
        return "TIR1_TEMP";
      case "TIR2_RADIANCE":
        return "TIR2_RADIANCE";
        case "TIR2_TEMP":
          return "TIR2_TEMP";
      case "VIS_ALBEDO":
        return "VIS_ALBEDO";
      case "VIS_RADIANCE":
        return "VIS_RADIANCE";
      case "WV_RADIANCE":
        return "WV_RADIANCE";
      default:
        return "VIS";
    }
  } else {
    return "Invalid URL or band name not found";
  }
}

function PreviewData() {
  const { showToast } = useAppContext();

  const {
    setStartDateTime,
    setEndDateTime,
    setProcessingLevel,
    setSearchResponseData,
    setDefaultLayer,
    setMetadata,
  } = useGeoData();
  const navigate = useNavigate();
  const [items, setItems] = useState<{
    [date: string]: {
      [time: string]: {
        product_info: ProductInfo;
        bands: { [bandName: string]: Band };
        satellite_info: {
          name: string;
          altitude: number;
          sensor: { name: string; id: string };
        };
      };
    };
  }>({});
  const [isDataAvailable, setIsDataAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataNotAvailable, setIsDataNotAvailable] = useState(false);

  const [startDate, setStartDate] = useState<Date>(new Date("04sep2024"));
  const [endDate, setEndDate] = useState<Date>(new Date("06SEP2024"));
  const [processingLevel, setProcessingLevelLayer] = useState<string>("L1C");
  const [tiffPreviewUrl, setTiffPreviewUrl] = useState<string>("");
  const [tiffPreviewMin, setTiffPreviewMin] = useState<number>(35);
  const [tiffPreviewMax, setTiffPreviewMax] = useState<number>(492);
  const [selectedBandUrl, setSelectedBandUrl] = useState<string>("");
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);

  // Function to find the first URL
  const initializeTiffPreviewUrl = () => {
    const dates = Object.keys(items).sort(); // Sort dates in ascending order
    for (const date of dates) {
      const times = Object.keys(items[date]).sort(); // Sort times in ascending order
      for (const time of times) {
        const bands = Object.keys(items[date][time].bands).sort();
        if (bands.length > 0) {
          const firstBand = bands[0];
          return {
            url: items[date][time].bands[firstBand].url,
            min: items[date][time].bands[firstBand].metadata.data_range.min,
            max: items[date][time].bands[firstBand].metadata.data_range.max,
            metadata: items[date][time],
          }; // Return the first URL
        }
      }
    }
    return ""; // Fallback if no URL is found
  };

  // Initialize state on component mount
  useEffect(() => {
    const defaultUrl = initializeTiffPreviewUrl();
    console.log("Default TIFF URL:", defaultUrl); // Log the default URL
    if (defaultUrl && typeof defaultUrl === "object") {
      setTiffPreviewUrl(defaultUrl.url);
      setSelectedBandUrl(defaultUrl.url);
      setTiffPreviewMin(defaultUrl.min);
      setTiffPreviewMax(defaultUrl.max);
      setMetadata(defaultUrl.metadata);
    }
    console.log("Default TIFF URL:", defaultUrl); // Log the default URL
  }, [items]);

  const handleDetailedPreview = (
    processingLevel: string,
    startDateTime: string,
    endDateTime: string
  ) => {
    const formattedStartDateTime =
      dayjs(startDateTime).format("YYYYMMMDD HHmm");
    const formattedEndDateTime = dayjs(endDateTime).format("YYYYMMMDD HHmm");
    setStartDateTime(formattedStartDateTime);
    setEndDateTime(formattedEndDateTime);
    setProcessingLevel(processingLevel);
    console.log(
      new Date(startDateTime).toISOString(),
      new Date(endDateTime).toISOString()
    );
    navigate(`/map`);
  };

  useEffect(() => {
    const fetchDataOnLoad = async () => {
      setIsLoading(true);
      setIsDataAvailable(false);
      setIsDataNotAvailable(false);

      try {
        const searchParams = {
          startDate: startDate?.toISOString() || "",
          endDate: endDate?.toISOString() || "",
          processingLevel: processingLevel || "",
        };
        console.log(searchParams);
        const data = await searchFilesWithTime(searchParams);
        console.log(data);

        const findDateWithBandUrls = (data: any) => {
          const result: any = {};
          for (const date in data) {
            for (const time in data[date]) {
              const bands = data[date][time].bands;
              for (const bandName in bands) {
                console.log(bandName,bands[bandName]);
                if (
                  bands[bandName] &&
                  bands[bandName].url.startsWith("https://")
                ) {
                  result[bandName] = {
                    url: bands[bandName].url.replace(".tiff", ".tif"),
                    min: bands[bandName].metadata.data_range.min,
                    max: bands[bandName].metadata.data_range.max,
                  };
                }
              }
              if (Object.keys(result).length > 0) {
                console.log(result);
                return result;
              }
            }
          }
        };

        setSearchResponseData(findDateWithBandUrls(data));
        console.log(" data 1: ",findDateWithBandUrls(data));
        setDefaultLayer(
          extractBandFromUrl(tiffPreviewUrl.replace(".tiff", ".tif"))
        );
        findDateWithBandUrls(data);
        if (data && Object.keys(data).length > 0) {
          setItems(data);
          setIsDataAvailable(true);
        } else {
          setIsDataNotAvailable(true);
        }
      } catch (error) {
        console.error("Error searching files:", error);
        setIsDataNotAvailable(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataOnLoad();
  }, []);

  const handleDateTimeInput = async () => {
    setIsLoading(true);
    setIsDataAvailable(false);
    setIsDataNotAvailable(false);

    try {
      const searchParams = {
        startDate: startDate?.toISOString() || "",
        endDate: endDate?.toISOString() || "",
        processingLevel: processingLevel || "",
      };
      console.log(searchParams);
      const data = await searchFilesWithTime(searchParams);
      console.log(data);
      // setSearchResponseData(Object.keys(data.bands).length > 0 ? data : null);
      // data[]

      const findDateWithBandUrls = (data: any) => {
        for (const date in data) {
          for (const time in data[date]) {
            const bands = data[date][time].bands;
            if (bands && bands.MIR && bands.MIR.url.startsWith("https://")) {
              const result = {
                MIR: {
                  url: bands.MIR.url.replace(".tiff", ".tif"),
                  min: bands.MIR.metadata.data_range.min,
                  max: bands.MIR.metadata.data_range.max,
                },
                MIR_RADIANCE: {
                  url: bands.MIR_RADIANCE.url.replace(".tiff", ".tif"),
                  min: bands.MIR_RADIANCE.metadata.data_range.min,
                  max: bands.MIR_RADIANCE.metadata.data_range.max,
                },
                SWIR: {
                  url: bands.SWIR.url.replace(".tiff", ".tif"),
                  min: bands.SWIR.metadata.data_range.min,
                  max: bands.SWIR.metadata.data_range.max,
                },
                SWIR_RADIANCE: {
                  url: bands.SWIR_RADIANCE.url.replace(".tiff", ".tif"),
                  min: bands.SWIR_RADIANCE.metadata.data_range.min,
                  max: bands.SWIR_RADIANCE.metadata.data_range.max,
                },
                TIR1: {
                  url: bands.TIR1.url.replace(".tiff", ".tif"),
                  min: bands.TIR1.metadata.data_range.min,
                  max: bands.TIR1.metadata.data_range.max,
                },
                TIR1_TEMP: {
                  url: bands.TIR1_TEMP.url.replace(".tiff", ".tif"),
                  min: bands.TIR1_TEMP.metadata.data_range.min,
                  max: bands.TIR1_TEMP.metadata.data_range.max,
                },
                TIR1_RADIANCE: {
                  url: bands.TIR1_RADIANCE.url.replace(".tiff", ".tif"),
                  min: bands.TIR1_RADIANCE.metadata.data_range.min,
                  max: bands.TIR1_RADIANCE.metadata.data_range.max,
                },
                TIR2: {
                  url: bands.TIR2.url.replace(".tiff", ".tif"),
                  min: bands.TIR2.metadata.data_range.min,
                  max: bands.TIR2.metadata.data_range.max,
                },
                TIR2_RADIANCE: {
                  url: bands.TIR2_RADIANCE.url.replace(".tiff", ".tif"),
                  min: bands.TIR2_RADIANCE.metadata.data_range.min,
                  max: bands.TIR2_RADIANCE.metadata.data_range.max,
                },
                TIR2_TEMP: {
                  url: bands.TIR2_TEMP.url.replace(".tiff", ".tif"),
                  min: bands.TIR2_TEMP.metadata.data_range.min,
                  max: bands.TIR2_TEMP.metadata.data_range.max,
                },
                VIS: {
                  url: bands.VIS.url.replace(".tiff", ".tif"),
                  min: bands.VIS.metadata.data_range.min,
                  max: bands.VIS.metadata.data_range.max,
                },
                VIS_ALBEDO: {
                  url: bands.VIS_ALBEDO.url.replace(".tiff", ".tif"),
                  min: bands.VIS_ALBEDO.metadata.data_range.min,
                  max: bands.VIS_ALBEDO.metadata.data_range.max,
                },
                VIS_RADIANCE: {
                  url: bands.VIS_RADIANCE.url.replace(".tiff", ".tif"),
                  min: bands.VIS_RADIANCE.metadata.data_range.min,
                  max: bands.VIS_RADIANCE.metadata.data_range.max,
                },
                WV_RADIANCE: {
                  url: bands.WV_RADIANCE.url.replace(".tiff", ".tif"),
                  min: bands.WV_RADIANCE.metadata.data_range.min,
                  max: bands.WV_RADIANCE.metadata.data_range.max,
                },
                WV: {
                  url: bands.WV.url.replace(".tiff", ".tif"),
                  min: bands.WV.metadata.data_range.min,
                  max: bands.WV.metadata.data_range.max,
                },
              };
              console.log(result);
              return result;
            }
          }
        }
      };

      // console.log(findDateWithBandUrls(data));
      setSearchResponseData(findDateWithBandUrls(data));
      setDefaultLayer(
        extractBandFromUrl(tiffPreviewUrl.replace(".tiff", ".tif"))
      );
      findDateWithBandUrls(data);
      if (data && Object.keys(data).length > 0) {
        setItems(data);
        setIsDataAvailable(true);
      } else {
        setIsDataNotAvailable(true);
      }
    } catch (error) {
      console.error("Error searching files:", error);
      setIsDataNotAvailable(true);
    } finally {
      setIsLoading(false);
    }
  };

  const onStartTimeChange: TimePickerProps["onChange"] = (
    _time,
    timeString
  ) => {
    if (startDate) {
      const updatedDate = new Date(startDate);
      const [hours, minutes] = (timeString as string).split(":").map(Number);
      updatedDate.setHours(hours, minutes);
      setStartDate(updatedDate);
    }
  };
  const onEndTimeChange: TimePickerProps["onChange"] = (_time, timeString) => {
    if (endDate) {
      const updatedDate = new Date(endDate);
      const [hours, minutes] = (timeString as string).split(":").map(Number);
      updatedDate.setHours(hours, minutes);
      setEndDate(updatedDate);
    }
  };

  const handleBandClick = (
    url: string,
    bandMin: number,
    bandMax: number,
    metadata: any
  ) => {
    console.log("Band URL:", url, bandMax, bandMin, metadata);
    setTiffPreviewUrl(url.replace(".tiff", ".tif"));
    setTiffPreviewMin(bandMin);
    setTiffPreviewMax(bandMax);
    setDefaultLayer(extractBandFromUrl(url.replace(".tiff", ".tif")));
    setMetadata(metadata);

    setSelectedBandUrl(url.replace(".tiff", ".tif"));
  };
  const handleDownloadRawButtonClick = () => {
    setShowDownloadPopup(true);
  };
  const handleDownloadSelectedBands = async () => {
    try {
      console.log(selectedBands);
      await addDownload({
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        processingLevel,
        selectedBands,
      });
      showToast({ message: "Ordered Successfully", type: "SUCCESS" });
      Object.values(selectedBands).forEach((times) => {
        Object.values(times).forEach((bands) => {
          Object.values(bands).forEach((url) => {
            window.open(url, "_blank");
          });
        });
      });
      setShowDownloadPopup(false);
    } catch (error) {
      console.error("Failed to add download:", error);
      showToast({ message: "Failed to add order", type: "ERROR" });
    }
  };

  const [selectedBands, setSelectedBands] = useState<{
    [date: string]: { [time: string]: { [bandName: string]: string } };
  }>({});

  const handleBandSelectorClick = (
    url: string,
    date: string,
    time: string,
    bandName: string,
    metadata: any
  ) => {
    console.log(metadata);
    setMetadata(metadata);
    console.log("Band URL:", url);
    setSelectedBands((prevSelectedBands) => {
      const isCurrentlySelected =
        prevSelectedBands[date]?.[time]?.[bandName] === url;

      if (isCurrentlySelected) {
        // Remove the band
        const newSelectedBands = { ...prevSelectedBands };
        delete newSelectedBands[date][time][bandName];

        // Clean up empty objects
        if (Object.keys(newSelectedBands[date][time]).length === 0) {
          delete newSelectedBands[date][time];
        }
        if (Object.keys(newSelectedBands[date]).length === 0) {
          delete newSelectedBands[date];
        }

        return newSelectedBands;
      } else {
        // Add the band
        return {
          ...prevSelectedBands,
          [date]: {
            ...prevSelectedBands[date],
            [time]: {
              ...(prevSelectedBands[date]?.[time] ?? {}),
              [bandName]: url,
            },
          },
        };
      }
    });
  };
  return (
    <div className="p-3">
      <h1 className="text-3xl font-bold">Order Data</h1>
      <div className="flex gap-2 my-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon />
              {startDate ? (
                format(startDate, "PPP")
              ) : (
                <span>Pick start date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
            />
            <TimePicker
              onChange={onStartTimeChange}
              value={dayjs(
                startDate
                  ? `${startDate.getHours()}:${startDate.getMinutes()}:${startDate.getSeconds()}`
                  : "00:00:00",
                "HH:mm:ss"
              )}
              showSecond={false}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon />
              {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
            />
            <TimePicker
              onChange={onEndTimeChange}
              value={dayjs(
                endDate
                  ? `${endDate.getHours()}:${endDate.getMinutes()}:${endDate.getSeconds()}`
                  : "00:00:00",
                "HH:mm:ss"
              )}
              showSecond={false}
            />
          </PopoverContent>
        </Popover>

        <Select onValueChange={setProcessingLevelLayer} defaultValue="L1C">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Choose Processing Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="L1B">L1B</SelectItem>
            <SelectItem value="L1C">L1C</SelectItem>
            <SelectItem value="L2B">L2B</SelectItem>
            <SelectItem value="L2C">L2C</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={() => handleDateTimeInput()}>Submit</Button>
      </div>
      {isLoading && <div>Loading...</div>}
      {isDataNotAvailable && (
        <div>No data available for the selected range</div>
      )}
      {isDataAvailable && (
        <div className="grid grid-cols-2 gap-4">
          <p className="text-4xl font-bold col-span-2">Quick Preview</p>
          <MiniMap
            geotiffUrl={tiffPreviewUrl}
            zoomedToTheBounding
            minValue={tiffPreviewMin}
            maxValue={tiffPreviewMax}
          />
          <div>
            <div className="rounded-lg border w-[40rem] p-2 h-96 overflow-y-scroll  no-visible-scrollbar">
              {Object.keys(items)
                .sort()
                .map((date) => (
                  <div key={date}>
                    <h2 className="text font-bold">{date}</h2>
                    {Object.keys(items[date])
                      .sort()
                      .map((time) => (
                        <div key={time} className="mb-2">
                          <h3 className="text-sm">
                            Available Bands at {time.slice(0, 2)}:
                            {time.slice(2, 4)} :
                          </h3>
                          <div className="grid grid-flow-col-dense w-full gap-2">
                            {Object.keys(items[date][time].bands)
                              .sort()
                              .map((bandName) => {
                                const bandUrl =
                                  items[date][time].bands[bandName].url || "";
                                const bandMin =
                                  items[date][time].bands[bandName].metadata
                                    .data_range.min;
                                const bandMax =
                                  items[date][time].bands[bandName].metadata
                                    .data_range.max;
                                return (
                                  <Button
                                    key={bandName}
                                    onClick={() =>
                                      handleBandClick(
                                        bandUrl,
                                        bandMin,
                                        bandMax,
                                        items[date][time]
                                      )
                                    }
                                    variant={
                                      selectedBandUrl === bandUrl
                                        ? "secondary"
                                        : "outline"
                                    }
                                    className="w-full"
                                  >
                                    {bandName}
                                  </Button>
                                );
                              })}
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() =>
                  handleDetailedPreview(
                    processingLevel || "",
                    startDate ? startDate.toISOString() : "",
                    endDate ? endDate.toISOString() : ""
                  )
                }
              >
                Open in Visualizer <OpenInNewWindowIcon />
              </Button>
              <Button
                variant={"outline"}
                onClick={handleDownloadRawButtonClick}
              >
                Download Raw <Download />
              </Button>
            </div>
          </div>
        </div>
      )}
      {showDownloadPopup && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">
            <h2 className="text-2xl font-bold">Download Raw Data</h2>
            <div>
              <div className="rounded-lg border w-fit p-2 h-96 overflow-y-scroll no-visible-scrollbar">
                {/* Update the band button onClick to pass date, time, and bandName */}
                {Object.keys(items)
                  .sort()
                  .map((date) => (
                    <div key={date}>
                      <h2 className="text font-bold">{date}</h2>
                      {Object.keys(items[date])
                        .sort()
                        .map((time) => (
                          <div key={time} className="mb-2">
                            <h3 className="text-sm">
                              Available Bands at {time.slice(0, 2)}:
                              {time.slice(2, 4)} :
                            </h3>
                            <div className="grid grid-cols-6 w-full gap-2">
                              {Object.keys(items[date][time].bands)
                                .sort()
                                .map((bandName) => {
                                  const bandUrl =
                                    items[date][time].bands[bandName].url || "";
                                  const isSelected =
                                    selectedBands[date]?.[time]?.[bandName] ===
                                    bandUrl;
                                  return (
                                    <Button
                                      key={bandName}
                                      onClick={() =>
                                        handleBandSelectorClick(
                                          bandUrl,
                                          date,
                                          time,
                                          bandName,
                                          items[date][time]
                                        )
                                      }
                                      variant={
                                        isSelected ? "default" : "outline"
                                      }
                                      className="w-full"
                                    >
                                      {bandName}
                                    </Button>
                                  );
                                })}
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex justify-end w-full gap-2 mt-4">
              <Button
                onClick={() => setShowDownloadPopup(false)}
                variant={"outline"}
              >
                Close
              </Button>
              <Button onClick={handleDownloadSelectedBands}>Download</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PreviewData;
