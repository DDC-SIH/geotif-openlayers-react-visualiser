import { Slider } from "antd";
import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

function TimeLineSlider() {
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
          <PopoverContent className="w-auto p-0 bg-zinc-900 border-0 text-white" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              className="bg-zinc-900 rounded-xl border-0 text-white"
            />
          </PopoverContent>
        </Popover>

        <Slider dots step={0.5} min={0} max={24} className="flex-1" />
      </div>
    </div>
  );
}

export default TimeLineSlider;
