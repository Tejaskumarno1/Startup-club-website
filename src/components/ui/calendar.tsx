
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: cn("text-sm font-medium", isDarkMode ? "text-white" : ""),
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          isDarkMode ? "border-gray-700 text-gray-300 hover:bg-gray-800" : ""
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: cn(
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          isDarkMode ? "text-gray-400" : ""
        ),
        row: "flex w-full mt-2",
        cell: cn(
          "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          isDarkMode ? "[&:has([aria-selected])]:bg-gray-800" : ""
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
          isDarkMode ? "text-gray-200 hover:bg-gray-800 hover:text-white" : ""
        ),
        day_range_end: "day-range-end",
        day_selected: cn(
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          isDarkMode ? "bg-primary hover:bg-primary/90 text-white" : ""
        ),
        day_today: cn(
          "bg-accent text-accent-foreground",
          isDarkMode ? "bg-gray-700 text-white" : ""
        ),
        day_outside: cn(
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          isDarkMode ? "text-gray-500" : ""
        ),
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: cn(
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
          isDarkMode ? "aria-selected:bg-gray-800 aria-selected:text-white" : ""
        ),
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className={`h-4 w-4 ${isDarkMode ? "text-gray-300" : ""}`} />,
        IconRight: ({ ...props }) => <ChevronRight className={`h-4 w-4 ${isDarkMode ? "text-gray-300" : ""}`} />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
