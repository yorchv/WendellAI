
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { CalendarNavigation } from "./CalendarNavigation";
import type { ViewMode } from "@/lib/meal-planner";

interface CalendarNavigationContainerProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  viewMode: ViewMode;
  weekStart: Date;
  setViewMode: (mode: ViewMode) => void;
  navigate: (direction: "prev" | "next") => void;
  goToToday: () => void;
  variant?: "mobile" | "desktop";
}

export function CalendarNavigationContainer({
  selectedDate,
  setSelectedDate,
  viewMode,
  weekStart,
  setViewMode,
  navigate,
  goToToday,
  variant = "desktop"
}: CalendarNavigationContainerProps) {
  if (variant === "mobile") {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <CalendarDays className="h-4 w-4 mr-2" />
            {format(selectedDate, 'MMM d, yyyy')}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[400px]">
          <SheetHeader>
            <SheetTitle>Date & View Options</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <CalendarNavigation
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              viewMode={viewMode}
              weekStart={weekStart}
              setViewMode={setViewMode}
              navigate={navigate}
              goToToday={goToToday}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <CalendarNavigation
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      viewMode={viewMode}
      weekStart={weekStart}
      setViewMode={setViewMode}
      navigate={navigate}
      goToToday={goToToday}
    />
  );
}
