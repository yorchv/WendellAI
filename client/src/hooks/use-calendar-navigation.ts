
import { useState } from "react";
import { addWeeks, subWeeks, startOfToday, addDays, subDays } from "date-fns";
import type { ViewMode } from "@/lib/meal-planner";

export function useCalendarNavigation() {
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const navigate = (direction: "prev" | "next") => {
    if (viewMode === "weekly") {
      setSelectedDate(direction === "prev" ? subWeeks(selectedDate, 1) : addWeeks(selectedDate, 1));
    } else {
      setSelectedDate(direction === "prev" ? subDays(selectedDate, 1) : addDays(selectedDate, 1));
    }
  };

  const goToToday = () => {
    setSelectedDate(startOfToday());
    setViewMode("daily");
  };

  return {
    selectedDate,
    setSelectedDate,
    viewMode,
    setViewMode,
    navigate,
    goToToday
  };
}
