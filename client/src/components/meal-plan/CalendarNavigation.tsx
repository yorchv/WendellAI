
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronLeft, ChevronRight, CalendarDays, CalendarRange } from "lucide-react";
import { format, startOfToday } from "date-fns";

interface CalendarNavigationProps {
  viewMode: "daily" | "weekly";
  selectedDate: Date;
  weekStart: Date;
  setViewMode: (mode: "daily" | "weekly") => void;
  setSelectedDate: (date: Date) => void;
  navigate: (direction: "prev" | "next") => void;
  goToToday: () => void;
}

export function CalendarNavigation({
  viewMode,
  selectedDate,
  weekStart,
  setViewMode,
  setSelectedDate,
  navigate,
  goToToday,
}: CalendarNavigationProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="flex items-center space-x-2">
        <Button
          variant={viewMode === "weekly" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("weekly")}
        >
          <CalendarRange className="h-4 w-4 mr-2" />
          Weekly
        </Button>
        <Button
          variant={viewMode === "daily" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("daily")}
        >
          <CalendarDays className="h-4 w-4 mr-2" />
          Daily
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
          className={viewMode === "daily" && format(selectedDate, "yyyy-MM-dd") === format(startOfToday(), "yyyy-MM-dd") ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
        >
          Today
        </Button>
        <Button variant="outline" size="icon" onClick={() => navigate("prev")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {viewMode === "weekly"
                ? `Week of ${format(weekStart, "MMM d, yyyy")}`
                : format(selectedDate, "MMM d, yyyy")
              }
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button variant="outline" size="icon" onClick={() => navigate("next")}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
