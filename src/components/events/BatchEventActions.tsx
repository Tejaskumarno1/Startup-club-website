
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, Copy, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteEvent, duplicateEvent } from "@/lib/eventHelpers";
import { CalendarEvent } from "@/lib/types";

interface BatchEventActionsProps {
  selectedEvents: CalendarEvent[];
  onClearSelection: () => void;
  onEventsUpdated: () => void;
}

export const BatchEventActions = ({
  selectedEvents,
  onClearSelection,
  onEventsUpdated,
}: BatchEventActionsProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedEvents.length} selected events?`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const deletePromises = selectedEvents.map(event => deleteEvent(event.id));
      await Promise.all(deletePromises);
      
      toast({
        title: "Events deleted",
        description: `Successfully deleted ${selectedEvents.length} events`,
      });
      
      onClearSelection();
      onEventsUpdated();
    } catch (error) {
      console.error("Error deleting events:", error);
      toast({
        title: "Error",
        description: "There was a problem deleting the selected events",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDuplicateSelected = async () => {
    if (selectedEvents.length > 5) {
      if (!window.confirm(`You're about to duplicate ${selectedEvents.length} events. Continue?`)) {
        return;
      }
    }

    setIsProcessing(true);
    try {
      const duplicatePromises = selectedEvents.map(event => duplicateEvent(event.id));
      const results = await Promise.all(duplicatePromises);
      
      const successCount = results.filter(r => r.success).length;
      
      toast({
        title: "Events duplicated",
        description: `Successfully duplicated ${successCount} events`,
      });
      
      onClearSelection();
      onEventsUpdated();
    } catch (error) {
      console.error("Error duplicating events:", error);
      toast({
        title: "Error",
        description: "There was a problem duplicating the selected events",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const exportToCsv = () => {
    // Format event data for CSV
    const headers = ["Title", "Start Date", "End Date", "Location", "Type", "Attendees"];
    const rows = selectedEvents.map(event => [
      event.title,
      new Date(event.start_datetime).toLocaleString(),
      new Date(event.end_datetime).toLocaleString(),
      event.location_type,
      event.event_type,
      event.attendees_count || 0
    ]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `events-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({
      title: "Export complete",
      description: `Exported ${selectedEvents.length} events to CSV`,
    });
  };

  if (selectedEvents.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-md">
      <div className="flex items-center gap-2">
        <Check className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">
          {selectedEvents.length} {selectedEvents.length === 1 ? 'event' : 'events'} selected
        </span>
      </div>
      
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onClearSelection}
          disabled={isProcessing}
        >
          Clear
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="default" 
              size="sm"
              disabled={isProcessing}
            >
              Actions <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Batch Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleDuplicateSelected}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={exportToCsv}>
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={handleDeleteSelected}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
