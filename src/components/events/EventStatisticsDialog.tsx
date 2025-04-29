
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CalendarEvent } from "@/lib/types";
import { getEventStatistics } from "@/lib/eventHelpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Users, Building, Calendar, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface EventStatisticsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent | null;
}

export const EventStatisticsDialog = ({
  isOpen,
  onOpenChange,
  event,
}: EventStatisticsDialogProps) => {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!event || !isOpen) return;
      
      setIsLoading(true);
      try {
        const stats = await getEventStatistics(event.id);
        setData(stats);
      } catch (error) {
        console.error("Error fetching event statistics:", error);
        toast({
          title: "Error",
          description: "Failed to load event statistics",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, [event, isOpen, toast]);

  const exportCsv = () => {
    if (!data) return;
    
    const registrationData = Object.entries(data.registrationsByDate).map(
      ([date, count]) => ({ date, count })
    );
    
    const headers = ["Date", "Registrations"];
    const rows = registrationData.map(item => [item.date, item.count]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `event-stats-${event?.id}.csv`;
    link.click();
  };

  const chartData = data?.registrationsByDate 
    ? Object.entries(data.registrationsByDate).map(([date, count]) => ({
        date,
        registrations: count,
      }))
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Event Statistics</DialogTitle>
          {event && (
            <DialogDescription>
              Analytics and statistics for {event.title}
            </DialogDescription>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-[100px]" />
              <Skeleton className="h-[100px]" />
              <Skeleton className="h-[100px]" />
            </div>
          </div>
        ) : data ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.totalRegistered}</div>
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 mt-2">
                      <Users className="h-3 w-3" />
                      <span>Attendees</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Companies Represented</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.uniqueCompanies}</div>
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 mt-2">
                      <Building className="h-3 w-3" />
                      <span>Organizations</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Date & Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium flex items-center mb-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {event && format(parseISO(event.start_datetime), "MMM d, yyyy")}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {event && (
                      <>
                        {format(parseISO(event.start_datetime), "h:mm a")} - {format(parseISO(event.end_datetime), "h:mm a")}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {chartData.length > 0 && (
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-base">Registration Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="registrations"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex justify-center py-8">
            <p>No data available</p>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          {data && (
            <Button onClick={exportCsv}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
