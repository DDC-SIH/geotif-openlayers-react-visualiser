import { searchFilesWithTime } from "@/api-client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

function PreviewData() {
  const { setStartDateTime, setEndDateTime, setProcessingLevel } = useGeoData();
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

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [processingLevel, setProcessingLevelLayer] = useState<string>();
  const [tiffPreviewUrl, setTiffPreviewUrl] = useState<string>("");
  const [selectedBandUrl, setSelectedBandUrl] = useState<string>("");

  // Function to find the first URL
  const initializeTiffPreviewUrl = () => {
    const dates = Object.keys(items).sort(); // Sort dates in ascending order
    for (const date of dates) {
      const times = Object.keys(items[date]).sort(); // Sort times in ascending order
      for (const time of times) {
        const bands = Object.keys(items[date][time].bands).sort();
        if (bands.length > 0) {
          const firstBand = bands[0];
          return items[date][time].bands[firstBand].url; // Return the first URL
        }
      }
    }
    return ""; // Fallback if no URL is found
  };


    // Initialize state on component mount
    useEffect(() => {
      const defaultUrl = initializeTiffPreviewUrl();
      setTiffPreviewUrl(defaultUrl);
      setSelectedBandUrl(defaultUrl); 
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

  const handleBandClick = (url: string) => {
    console.log("Band URL:", url);
    setTiffPreviewUrl(url);
    setSelectedBandUrl(url); 
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

        <Select onValueChange={setProcessingLevelLayer}>
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
          <MiniMap geotiffUrl={tiffPreviewUrl} zoomedToTheBounding/>
          <div>
            <div className="rounded-lg border w-fit p-2 h-96 overflow-y-scroll  no-visible-scrollbar">
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
                            {Object.keys(items[date][time].bands).sort().map(
                              (bandName) => {
                                const bandUrl =
                                  items[date][time].bands[bandName].url || "";
                                return (
                                  <Button
                                    key={bandName}
                                    onClick={() => handleBandClick(bandUrl)}
                                    variant={
                                      selectedBandUrl === bandUrl ? "secondary" : "outline"
                                    }
                                    className="w-full"
                                  >
                                    {bandName}
                                  </Button>
                                );
                              }
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
            </div>
            <div className="mt-4">
              <Button
                onClick={() =>
                  handleDetailedPreview(
                    processingLevel || "",
                    startDate ? startDate.toISOString() : "",
                    endDate ? endDate.toISOString() : ""
                  )
                }
              >
                Open in Editor <OpenInNewWindowIcon />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PreviewData;
