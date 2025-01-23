
import { useState, useEffect } from "react";
import { addWeeks, subWeeks, startOfToday, addDays, subDays, parseISO } from "date-fns";
import type { ViewMode } from "@/lib/meal-planner";
import { useLocation } from "wouter";

export function useCalendarNavigation() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const [viewMode, setViewMode] = useState<ViewMode>(
    (searchParams.get("view") as ViewMode) || "daily"
  );
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const dateParam = searchParams.get("date");
    return dateParam ? parseISO(dateParam) : new Date();
  });

  const updateUrl = (date: Date, mode: ViewMode) => {
    const params = new URLSearchParams();
    params.set("view", mode);
    params.set("date", date.toISOString().split('T')[0]);
    setLocation(`/meal-planner?${params.toString()}`);
  };

  const navigate = (direction: "prev" | "next") => {
    const newDate = viewMode === "weekly"
      ? direction === "prev" ? subWeeks(selectedDate, 1) : addWeeks(selectedDate, 1)
      : direction === "prev" ? subDays(selectedDate, 1) : addDays(selectedDate, 1);
    setSelectedDate(newDate);
    updateUrl(newDate, viewMode);
  };

  const setViewModeWithUrl = (mode: ViewMode) => {
    setViewMode(mode);
    updateUrl(selectedDate, mode);
  };

  const setSelectedDateWithUrl = (date: Date) => {
    setSelectedDate(date);
    updateUrl(date, viewMode);
  };

  const goToToday = () => {
    const today = startOfToday();
    setSelectedDate(today);
    setViewMode("daily");
    updateUrl(today, "daily");
  };

  return {
    selectedDate,
    setSelectedDate: setSelectedDateWithUrl,
    viewMode,
    setViewMode: setViewModeWithUrl,
    navigate,
    goToToday
  };
}
