
import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Calendar, Filter, Search, Calendar as CalendarIcon } from "lucide-react";
import { EventCarousel } from "@/components/events/EventCarousel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

const Events = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [eventType, setEventType] = useState("all");
  
  // Filter options
  const eventTypes = [
    { value: "all", label: "All Types" },
    { value: "workshop", label: "Workshops" },
    { value: "networking", label: "Networking" },
    { value: "pitch", label: "Pitch Events" },
    { value: "hackathon", label: "Hackathons" },
    { value: "mentorship", label: "Mentorship" },
    { value: "general", label: "General" }
  ];

  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-primary/5 to-background pt-6 pb-12">
        <PageHeader
          title="Events"
          description="Discover upcoming events, workshops, and networking opportunities to grow your startup journey."
          icon={Calendar}
        />
        
        <div className="container mx-auto mt-6 max-w-6xl">
          <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  {eventTypes.find(t => t.value === eventType)?.label || "All Types"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {eventTypes.map((type) => (
                  <DropdownMenuItem
                    key={type.value}
                    onClick={() => setEventType(type.value)}
                    className={eventType === type.value ? "bg-primary/10 text-primary" : ""}
                  >
                    {type.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button onClick={() => navigate("/events/calendar")} className="w-full sm:w-auto">
              <CalendarIcon className="h-4 w-4 mr-2" />
              View Calendar
            </Button>
          </div>
          
          <Tabs defaultValue="upcoming" className="mb-8">
            <TabsList className="w-full bg-background/70 backdrop-blur-sm border p-1">
              <TabsTrigger value="upcoming" className="flex-1">Upcoming Events</TabsTrigger>
              <TabsTrigger value="featured" className="flex-1">Featured</TabsTrigger>
              <TabsTrigger value="past" className="flex-1">Past Events</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="mt-6">
              <EventCarousel />
            </TabsContent>
            
            <TabsContent value="featured" className="mt-6">
              <Card className="overflow-hidden border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Featured Event: Startup Summit 2024</CardTitle>
                  <CardDescription className="text-base">Join the biggest startup event of the year</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative overflow-hidden rounded-lg">
                      <img 
                        src="https://images.unsplash.com/photo-1591115765373-5207764f72e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" 
                        alt="Startup Summit" 
                        className="rounded-lg w-full h-80 object-cover transition-transform duration-700 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-60 transition-opacity"></div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-lg">Join us for the annual Startup Summit where entrepreneurs, investors, and industry leaders gather to share knowledge and build connections.</p>
                      
                      <div className="bg-primary/5 p-6 rounded-xl space-y-3 border border-primary/10">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-primary" />
                          <span className="font-medium">July 15-17, 2024</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold mb-2">Key Highlights:</h4>
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <span className="text-primary mr-2">•</span>
                              <span>Keynote speeches from successful founders</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-primary mr-2">•</span>
                              <span>Investor pitch sessions</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-primary mr-2">•</span>
                              <span>Networking events and mentorship opportunities</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-primary mr-2">•</span>
                              <span>Startup showcase exhibition</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <Button size="lg" className="mt-4 w-full md:w-auto">
                        Reserve Your Spot
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="past" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Card key={item} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={`https://picsum.photos/seed/${item}/800/600`} 
                        alt={`Past Event ${item}`} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                    </div>
                    <CardHeader className="p-4 pb-0">
                      <CardTitle className="text-lg">Past Workshop {item}</CardTitle>
                      <CardDescription>April 2024</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="text-sm line-clamp-2">A recap of our successful workshop on startup funding strategies and pitching techniques.</p>
                      
                      <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/events/recordings")}>
                        Watch Recording
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Events;
