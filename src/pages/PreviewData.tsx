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
import { format } from "date-fns";
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

dayjs.extend(customParseFormat);
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function PreviewData() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [isDataAvailable, setIsDataAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataNotAvailable, setIsDataNotAvailable] = useState(false);

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [processingLevel, setProcessingLevel] = useState<string>();

  const handleDetailedPreview = (
    processingLevel: string,
    startDateTime: string,
    endDateTime: string,
  ) => {
    const formattedStartDateTime = dayjs(startDateTime).format("YYYYMMMDD HHmm");
    const formattedEndDateTime = dayjs(endDateTime).format("YYYYMMMDD HHmm");
    console.log(new Date(startDateTime).toISOString(), new Date(endDateTime).toISOString())
    navigate(
      `/map/?p=${processingLevel}&st=${encodeURIComponent(formattedStartDateTime)}&ed=${encodeURIComponent(formattedEndDateTime)}`
    );
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
      console.log(searchParams)
      const data = await searchFilesWithTime(searchParams);
      console.log(data)
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

        <Select onValueChange={setProcessingLevel}>
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

        <Button
          onClick={() =>
            handleDateTimeInput()
          }
        >
          Submit
        </Button>
      </div>
      {isLoading && <div>Loading...</div>}
      {isDataNotAvailable && (
        <div>No data available for the selected range</div>
      )}
      {isDataAvailable && (
        <div>
          <Button
            onClick={() =>
              handleDetailedPreview(
                processingLevel || "",
                startDate ? startDate.toISOString() : "",
                endDate ? endDate.toISOString() : "",
              )
            }
          >
            Detailed Preview
          </Button>
        </div>
      )}
    </div>
  );
}

export default PreviewData;
