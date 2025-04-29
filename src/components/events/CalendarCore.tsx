
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "@/lib/types";
import { useTheme } from "@/context/ThemeContext";
import { Badge } from "@/components/ui/badge";

interface CalendarCoreProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateChange: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onAddEvent?: (date: Date) => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  isAdmin?: boolean;
}

export const CalendarCore: React.FC<CalendarCoreProps> = ({
  currentDate,
  events,
  onDateChange,
  onEventClick,
  onAddEvent,
  selectedDate,
  onSelectDate,
  isAdmin = false,
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  
  const goToPreviousMonth = () => {
    onDateChange(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    onDateChange(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    onDateChange(new Date());
    onSelectDate(new Date());
  };

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.start_datetime), day));
  };

  // Map event types to colors
  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'workshop':
        return isDarkMode ? 'bg-blue-800/70 text-blue-100' : 'bg-blue-100 text-blue-800';
      case 'networking':
        return isDarkMode ? 'bg-purple-800/70 text-purple-100' : 'bg-purple-100 text-purple-800';
      case 'pitch':
        return isDarkMode ? 'bg-yellow-700/70 text-yellow-100' : 'bg-yellow-100 text-yellow-800';
      case 'hackathon':
        return isDarkMode ? 'bg-green-800/70 text-green-100' : 'bg-green-100 text-green-800';
      case 'mentorship':
        return isDarkMode ? 'bg-indigo-800/70 text-indigo-100' : 'bg-indigo-100 text-indigo-800';
      case 'conference':
        return isDarkMode ? 'bg-orange-800/70 text-orange-100' : 'bg-orange-100 text-orange-800';
      case 'seminar':
        return isDarkMode ? 'bg-pink-800/70 text-pink-100' : 'bg-pink-100 text-pink-800';
      case 'webinar':
        return isDarkMode ? 'bg-teal-800/70 text-teal-100' : 'bg-teal-100 text-teal-800';
      default:
        return isDarkMode ? 'bg-gray-700/70 text-gray-100' : 'bg-gray-100 text-gray-800';
    }
  };

  // Generate calendar days for the month view
  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    // Add day headers (Sun, Mon, etc.)
    const dayHeaders = [];
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 0; i < 7; i++) {
      dayHeaders.push(
        <div key={`header-${i}`} className={`font-medium text-center text-sm py-2 ${isDarkMode ? "text-gray-300" : ""}`}>
          {weekDays[i]}
        </div>
      );
    }
    rows.push(<div key="header" className="grid grid-cols-7 gap-1">{dayHeaders}</div>);

    // Create calendar cells
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const eventsForDay = getEventsForDay(cloneDay);
        const isSelectedDay = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, new Date());
        const isCurrentMonth = isSameMonth(day, currentDate);

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "h-24 border rounded-md p-1 relative transition-colors",
              isCurrentMonth 
                ? isDarkMode ? "bg-gray-800/70" : "bg-white" 
                : isDarkMode ? "bg-gray-900/70 text-gray-500" : "bg-gray-50 text-gray-400",
              isSelectedDay 
                ? isDarkMode ? "border-primary/70" : "border-primary" 
                : isDarkMode ? "border-gray-700" : "border-gray-100",
              isToday 
                ? isDarkMode ? "bg-gray-700/70" : "bg-primary/5" 
                : "",
              isDarkMode 
                ? "hover:border-gray-500 cursor-pointer" 
                : "hover:border-primary/70 cursor-pointer"
            )}
            onClick={() => onSelectDate(cloneDay)}
          >
            <div className={cn(
              "flex justify-between items-center",
              isToday 
                ? isDarkMode ? "font-bold text-primary" : "font-bold text-primary" 
                : isDarkMode ? "text-gray-300" : ""
            )}>
              <span className="text-sm">{format(day, "d")}</span>
              {isAdmin && isCurrentMonth && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-5 w-5 opacity-0 hover:opacity-100 group-hover:opacity-100 ${
                    isDarkMode ? "text-gray-300 hover:bg-gray-700" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddEvent && onAddEvent(cloneDay);
                  }}
                >
                  <span className="text-xs font-bold">+</span>
                </Button>
              )}
            </div>

            {eventsForDay.length > 0 && (
              <div className="mt-1 space-y-1 max-h-[calc(100%-20px)] overflow-hidden">
                {eventsForDay.slice(0, 3).map((event, index) => (
                  <div
                    key={`${event.id}-${index}`}
                    className={cn(
                      "text-xs rounded px-1 py-0.5 truncate cursor-pointer",
                      getEventTypeColor(event.event_type)
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick && onEventClick(event);
                    }}
                  >
                    {format(new Date(event.start_datetime), "h:mm a")} {event.title}
                  </div>
                ))}
                {eventsForDay.length > 3 && (
                  <div className={`text-xs font-medium text-center ${
                    isDarkMode ? "text-gray-300" : "text-primary"
                  }`}>
                    +{eventsForDay.length - 3} more
                  </div>
                )}
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }

    return rows;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-semibold ${isDarkMode ? "text-white" : ""}`}>{format(currentDate, 'MMMM yyyy')}</h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={goToPreviousMonth}
            className={isDarkMode ? "border-gray-700 hover:bg-gray-800 text-white" : ""}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToToday}
            className={isDarkMode ? "border-gray-700 hover:bg-gray-800 text-white" : ""}
          >
            Today
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={goToNextMonth}
            className={isDarkMode ? "border-gray-700 hover:bg-gray-800 text-white" : ""}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        {getCalendarDays()}
      </div>
      
      <div className="flex flex-wrap gap-2 mt-2">
        <div className="text-xs font-medium mr-2">Event Types:</div>
        <Badge className={isDarkMode ? "bg-blue-800/70 text-blue-100" : "bg-blue-100 text-blue-800"}>Workshop</Badge>
        <Badge className={isDarkMode ? "bg-purple-800/70 text-purple-100" : "bg-purple-100 text-purple-800"}>Networking</Badge>
        <Badge className={isDarkMode ? "bg-green-800/70 text-green-100" : "bg-green-100 text-green-800"}>Hackathon</Badge>
        <Badge className={isDarkMode ? "bg-orange-800/70 text-orange-100" : "bg-orange-100 text-orange-800"}>Conference</Badge>
      </div>
    </div>
  );
};
