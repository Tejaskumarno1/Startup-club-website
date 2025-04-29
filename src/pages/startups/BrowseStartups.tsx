
import React, { useState, useEffect } from "react";
import { PageTemplate } from "@/components/common/PageTemplate";
import { Building2, Users, MapPin, Calendar, Search, Filter, ExternalLink, Mail, User, Briefcase } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Sheet,
  SheetContent, 
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { createConnectionRequest } from "@/lib/startupsHelpers";
import { useAuth } from "@/context/AuthContext";
import { getAllStartups, getStartupById } from "@/lib/startupApiHelpers";
import { Startup } from "@/lib/types";

interface StartupWithFounder extends Startup {
  founder?: {
    first_name: string;
    last_name: string;
    email: string;
    photo_url?: string;
  } | null;
}

const ITEMS_PER_PAGE = 12;

const BrowseStartups = () => {
  const [loading, setLoading] = useState(true);
  const [startups, setStartups] = useState<StartupWithFounder[]>([]);
  const [filteredStartups, setFilteredStartups] = useState<StartupWithFounder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [fundingFilter, setFundingFilter] = useState("all");
  const [selectedStartup, setSelectedStartup] = useState<StartupWithFounder | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loadingStartup, setLoadingStartup] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get unique industries for filtering
  const industries = React.useMemo(() => {
    const uniqueIndustries = new Set<string>();
    startups.forEach(startup => {
      if (startup.industry) uniqueIndustries.add(startup.industry);
    });
    return Array.from(uniqueIndustries).sort();
  }, [startups]);
  
  // Get unique funding stages for filtering
  const fundingStages = React.useMemo(() => {
    const uniqueStages = new Set<string>();
    startups.forEach(startup => {
      if (startup.funding_stage) uniqueStages.add(startup.funding_stage);
    });
    return Array.from(uniqueStages).sort();
  }, [startups]);
  
  useEffect(() => {
    fetchStartups();
  }, []);
  
  useEffect(() => {
    filterStartups();
  }, [searchTerm, industryFilter, fundingFilter, startups]);
  
  const fetchStartups = async () => {
    try {
      setLoading(true);
      const response = await getAllStartups();
      
      if (!response.success) {
        throw new Error(response.error);
      }
      
      // Add founder info to startups
      const startupsWithFounders: StartupWithFounder[] = await Promise.all(
        (response.data || []).map(async (startup) => {
          if (startup.founder_id) {
            try {
              const { data, error } = await supabase
                .from("profiles")
                .select("first_name, last_name, email, photo_url")
                .eq("id", startup.founder_id)
                .single();
              
              if (!error && data) {
                return {
                  ...startup,
                  founder: data
                };
              }
            } catch (err) {
              console.error("Error fetching founder:", err);
            }
          }
          return { ...startup, founder: null };
        })
      );
      
      setStartups(startupsWithFounders);
      setFilteredStartups(startupsWithFounders);
      setTotalResults(startupsWithFounders.length);
    } catch (error) {
      console.error("Error fetching startups:", error);
      toast({
        title: "Error",
        description: "Failed to load startups. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const filterStartups = () => {
    let results = [...startups];
    
    // Apply search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      results = results.filter(
        (startup) =>
          (startup.name?.toLowerCase().includes(query)) ||
          (startup.description?.toLowerCase().includes(query)) ||
          (startup.industry?.toLowerCase().includes(query))
      );
    }
    
    // Apply industry filter
    if (industryFilter !== "all") {
      results = results.filter((startup) => startup.industry === industryFilter);
    }
    
    // Apply funding stage filter
    if (fundingFilter !== "all") {
      results = results.filter((startup) => startup.funding_stage === fundingFilter);
    }
    
    setFilteredStartups(results);
    setTotalResults(results.length);
    setCurrentPage(1); // Reset to first page after filtering
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterStartups();
  };
  
  const clearFilters = () => {
    setSearchTerm("");
    setIndustryFilter("all");
    setFundingFilter("all");
  };

  const handleViewDetails = async (startup: StartupWithFounder) => {
    try {
      setSelectedStartup(startup);
      setLoadingStartup(true);
      setOpenDetails(true);
      
      // Fetch the full startup data including founder info
      const response = await getStartupById(startup.id);
      
      if (!response.success) {
        throw new Error(response.error);
      }
      
      // Get founder info if we don't have it already
      if (response.data && response.data.founder_id && (!startup.founder || Object.keys(startup.founder).length === 0)) {
        const { data, error } = await supabase
          .from("profiles")
          .select("first_name, last_name, email, photo_url")
          .eq("id", response.data.founder_id)
          .single();
        
        if (!error && data) {
          setSelectedStartup({
            ...response.data,
            founder: data
          });
          return;
        }
      }
      
      setSelectedStartup(response.data as StartupWithFounder);
    } catch (error) {
      console.error("Error fetching startup details:", error);
      // Continue showing the data we already have
    } finally {
      setLoadingStartup(false);
    }
  };

  const handleConnect = async (startupId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to connect with startups.",
        variant: "destructive",
      });
      return;
    }

    try {
      setConnectingTo(startupId);
      
      // Find the startup to get the founder_id
      const startup = startups.find(s => s.id === startupId);
      if (!startup || !startup.founder_id) {
        throw new Error("Startup founder information not found");
      }

      // Make connection request to the founder
      const result = await createConnectionRequest(user.id, startup.founder_id);
      
      if (result.success) {
        toast({
          title: "Connection Request Sent",
          description: `Your connection request to ${startup.name} has been sent.`,
        });
      } else {
        throw new Error(result.error || "Failed to create connection");
      }
    } catch (error) {
      console.error("Error connecting to startup:", error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to send connection request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnectingTo(null);
    }
  };
  
  const paginatedStartups = filteredStartups.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );
  
  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  return (
    <PageTemplate
      title="Browse Startups"
      description="Discover innovative startups in our community."
      icon={Building2}
    >
      {/* Search and filter section */}
      <form onSubmit={handleSearch} className="mb-6">
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-3 lg:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name, description, or industry"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={fundingFilter} onValueChange={setFundingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Funding Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {fundingStages.map(stage => (
                    <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={clearFilters}
                disabled={industryFilter === "all" && fundingFilter === "all" && searchTerm === ""}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
      
      {/* Results count */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">
          {loading ? "Loading startups..." : `${totalResults} result${totalResults === 1 ? '' : 's'}`}
        </h2>
      </div>
      
      {/* Startups grid/list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size="lg" />
          <p className="mt-4 text-muted-foreground">Loading startups...</p>
        </div>
      ) : filteredStartups.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="py-10">
            <p className="text-gray-600 mb-4">No startups match your search criteria.</p>
            <Button onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedStartups.map((startup) => (
              <Card key={startup.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="p-4 pb-0">
                  <div className="flex items-center gap-3">
                    {startup.logo_url ? (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={startup.logo_url} alt={startup.name} />
                        <AvatarFallback className="bg-primary/10">
                          {startup.name.substring(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10">
                          {startup.name.substring(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <CardTitle className="text-lg">{startup.name}</CardTitle>
                      <CardDescription>
                        {startup.industry || "Technology"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="line-clamp-3 text-sm text-gray-600 h-[4.5rem]">
                    {startup.description || "No description available"}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{startup.founding_date ? new Date(startup.founding_date).getFullYear() : "N/A"}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{startup.team_size || "N/A"} members</span>
                    </div>
                    
                    <div className="flex items-center gap-1 col-span-2">
                      <MapPin className="h-3 w-3" />
                      <span>{startup.funding_stage || "Bootstrapped"}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-4 pt-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDetails(startup)}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleConnect(startup.id)}
                    disabled={connectingTo === startup.id}
                  >
                    {connectingTo === startup.id ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Connecting...
                      </>
                    ) : (
                      "Connect"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1 mb-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                
                // Calculate what page numbers to show
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={i}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Startup details sheet */}
      <Sheet open={openDetails} onOpenChange={setOpenDetails}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl flex items-center gap-4">
              {selectedStartup?.logo_url && (
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedStartup.logo_url} alt={selectedStartup?.name} />
                  <AvatarFallback className="bg-primary/10">
                    {selectedStartup?.name.substring(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              {selectedStartup?.name}
            </SheetTitle>
            <SheetDescription>
              {selectedStartup?.industry && (
                <Badge variant="outline" className="mt-2">
                  {selectedStartup.industry}
                </Badge>
              )}
            </SheetDescription>
          </SheetHeader>

          {loadingStartup ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner size="lg" />
              <p className="mt-4 text-muted-foreground">Loading startup details...</p>
            </div>
          ) : (
            <Tabs defaultValue="about" className="mt-6">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="text-gray-700">{selectedStartup?.description || "No description provided."}</p>
                </div>
                
                {selectedStartup?.founder && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Founder</h3>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={selectedStartup.founder.photo_url || ""} />
                        <AvatarFallback className="bg-primary/10">
                          {`${selectedStartup.founder.first_name?.[0] || ''}${selectedStartup.founder.last_name?.[0] || ''}`}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {selectedStartup.founder.first_name} {selectedStartup.founder.last_name}
                        </p>
                        {selectedStartup.founder.email && (
                          <a 
                            href={`mailto:${selectedStartup.founder.email}`} 
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Mail className="h-3 w-3" />
                            {selectedStartup.founder.email}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedStartup?.website_url && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Website</h3>
                    <a 
                      href={selectedStartup.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {selectedStartup.website_url}
                    </a>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <h4 className="text-sm font-medium">Founded</h4>
                    </div>
                    <p>{selectedStartup?.founding_date ? formatDate(selectedStartup.founding_date) : "Not specified"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <h4 className="text-sm font-medium">Team Size</h4>
                    </div>
                    <p>{selectedStartup?.team_size || "Not specified"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <h4 className="text-sm font-medium">Funding Stage</h4>
                    </div>
                    <p className="text-green-600 font-medium">
                      {selectedStartup?.funding_stage || "Bootstrapped"}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <h4 className="text-sm font-medium">Founder</h4>
                    </div>
                    <p>
                      {selectedStartup?.founder ? (
                        `${selectedStartup.founder.first_name} ${selectedStartup.founder.last_name}`
                      ) : "Not specified"}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
            {selectedStartup?.website_url && (
              <Button variant="outline" asChild>
                <a href={selectedStartup.website_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Website
                </a>
              </Button>
            )}
            
            <Button
              onClick={() => {
                if (selectedStartup) {
                  handleConnect(selectedStartup.id);
                  setOpenDetails(false);
                }
              }}
              disabled={connectingTo === selectedStartup?.id}
            >
              {connectingTo === selectedStartup?.id ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </PageTemplate>
  );
};

export default BrowseStartups;
