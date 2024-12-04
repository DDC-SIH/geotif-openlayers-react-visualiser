import { deepSearchFiles, searchFiles } from "@/api-client";
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

dayjs.extend(customParseFormat);
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function PreviewData() {
  const navigate = useNavigate();
  const query = useQuery();
  const [items, setItems] = useState([]);
  const [commonData, setCommonData] = useState([]);
  const [isDataAvailable, setIsDataAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataNotAvailable, setIsDataNotAvailable] = useState(false);

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  useEffect(() => {
    const product = query.get("p");
    const prefix = product?.split("_")[0];
    const dataProcessingLevel = product?.split("_")[1];
    const standard = product?.split("_")[2];
    const version = query.get("v");

    if (prefix && dataProcessingLevel && standard && version) {
      searchFiles({ prefix, dataProcessingLevel, standard, version })
        .then((data) => {
          console.log(data);
          setItems(data.items);
          setCommonData(data.commonAttributes);
        })
        .catch((error) => console.error("Error fetching data:", error));
    }
  }, []);

  const handleDetailedPreview = (
    groupName: string,
    startDateTime: string,
    endDateTime: string,
    version: string
  ) => {
    const formattedStartDateTime = new Date(startDateTime)
      .toISOString()
      .replace(/[-:.]/g, "")
      .slice(0, -5);
    const formattedEndDateTime = new Date(endDateTime)
      .toISOString()
      .replace(/[-:.]/g, "")
      .slice(0, -5);
    navigate(
      `/map/?p=${groupName}&st=${formattedStartDateTime}&ed=${formattedEndDateTime}&v=${version}`
    );
  };

  const handleDateTimeInput = async (groupName: string, version: string) => {
    setIsLoading(true);
    setIsDataAvailable(false);
    setIsDataNotAvailable(false);

    await deepSearchFiles({
      prefix: groupName.split("_")[0],
      dataProcessingLevel: groupName.split("_")[1],
      standard: groupName.split("_")[2],
      version,
      startDate: startDate ? startDate.toISOString() : "",
      endDate: endDate ? endDate.toISOString() : "",
    })
      .then((data) => {
        console.log("Deep search data:", data);
        if (!data.items) {
          setIsDataNotAvailable(true);
          setIsDataAvailable(false);
          setIsLoading(false);
          return;
        }
        setIsDataAvailable(true);
        setIsLoading(false);
        setIsDataNotAvailable(false);
      })
      .catch((error) => console.error("Error performing deep search:", error));
  };

  const onStartTimeChange: TimePickerProps["onChange"] = (time, timeString) => {
    if (startDate) {
      const updatedDate = new Date(startDate);
      const [hours, minutes] = (timeString as string).split(":").map(Number);
      updatedDate.setHours(hours, minutes);
      setStartDate(updatedDate);
    }
  };
  const onEndTimeChange: TimePickerProps["onChange"] = (time, timeString) => {
    if (endDate) {
      const updatedDate = new Date(endDate);
      const [hours, minutes] = (timeString as string).split(":").map(Number);
      updatedDate.setHours(hours, minutes);
      setEndDate(updatedDate);
    }
  };

  return (
    <div className="p-3">
      <h1 className="text-3xl font-bold">Preview Data</h1>
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

        <Button
          onClick={() =>
            handleDateTimeInput(query.get("p") || "", query.get("v") || "")
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
                query.get("p") || "",
                startDate ? startDate.toISOString() : "",
                endDate ? endDate.toISOString() : "",
                query.get("v") || ""
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
