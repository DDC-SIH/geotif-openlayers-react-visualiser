import { Slider } from "antd";
import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useGeoData } from "../../contexts/GeoDataProvider";

function convertToTime(value: number): string {
  // Ensure the value is within the valid range
  if (value < 0 || value > 23.5) {
    throw new Error("Value must be between 0 and 23.5");
  }

  // Extract hours and minutes
  const hours = Math.floor(value); // Integer part is hours
  const minutes = value % 1 === 0.5 ? 30 : 0; // Fractional part determines minutes

  // Format hours and minutes as a time string (HH:mm)
  const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;

  return formattedTime;
}
function TimeLineSlider() {
  const { startDateTime, endDateTime, processingLevel } = useGeoData();
  console.log(startDateTime, endDateTime, processingLevel);
  const [value, setValue] = React.useState<number>(50);
  const [date, setDate] = React.useState<Date>();

  const handleChange = (newValue: any) => {
    console.log(newValue);
    setValue(newValue as number);
  };

  return (
    <div className="w-full fixed bottom-0 flex justify-center items-center py-6 px-32">
      <div className="bg-black bg-opacity-65 rounded-lg p-5 w-[-webkit-fill-available] flex gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"default"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-zinc-900 border-0 text-white"
            align="start"
          >
            <Calendar
              fromDate={new Date((startDateTime) || "2024-01-01")}
              toDate={new Date(endDateTime || "2024-12-31")}
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              className="bg-zinc-900 rounded-xl border-0 text-white"
            />
          </PopoverContent>
        </Popover>

        <Slider
          dots
          step={0.5}
          min={0}
          max={23.5}
          className="flex-1"
          classNames={{
            rail: "bg-black border-2 border-black",
            track: "bg-zinc-900 border-4  border-zinc-900",
          }}
          tooltip={{
            open: true,
            formatter: (value) =>
              value !== undefined ? `${convertToTime(value)}` : "",
          }}
        />
      </div>
    </div>
  );
}

export default TimeLineSlider;
