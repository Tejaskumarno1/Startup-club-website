import React, { useState, useEffect } from "react";
import { Search, Building, Users, MapPin, Filter, Star, Plus, Edit, Trash2 } from "lucide-react";
import { AdminPageTemplate } from "@/components/admin/AdminPageTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Startup } from "@/lib/types";

// Extended type that includes founder information
interface StartupWithFounder extends Startup {
  founder?: {
    id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  featured?: boolean; // Add this for proper TypeScript compatibility
}

// Interface for startup form data
interface StartupFormData {
  id?: string;
  name: string;
  description: string;
  industry: string;
  website_url: string;
  team_size: number;
  funding_stage: string;
  founder_id?: string;
  featured?: boolean;
}

const AdminBrowseStartups = () => {
  const [startups, setStartups] = useState<StartupWithFounder[]>([]);
  const [filteredStartups, setFilteredStartups] = useState<StartupWithFounder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentStartup, setCurrentStartup] = useState<StartupFormData>({
    name: "",
    description: "",
    industry: "",
    website_url: "",
    team_size: 1,
    funding_stage: "pre-seed",
    featured: false
  });
  const [availableFounders, setAvailableFounders] = useState<{ id: string; name: string; email: string }[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const { toast } = useToast();

  // Fetch startups
  useEffect(() => {
    fetchStartups();
    fetchFounders();
  }, []);

  // Filter startups when search or industry filter changes
  useEffect(() => {
    let result = [...startups];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (startup) =>
          startup.name?.toLowerCase().includes(query) ||
          startup.description?.toLowerCase().includes(query) ||
          startup.industry?.toLowerCase().includes(query) ||
          (startup.founder?.first_name && startup.founder.first_name.toLowerCase().includes(query)) ||
          (startup.founder?.last_name && startup.founder.last_name.toLowerCase().includes(query))
      );
    }
    
    // Apply industry filter
    if (industryFilter) {
      result = result.filter((startup) => startup.industry === industryFilter);
    }
    
    setFilteredStartups(result);
  }, [searchQuery, industryFilter, startups]);

  const fetchStartups = async () => {
    try {
      setLoading(true);
      
      // Use a more robust query that doesn't rely on foreign key relationships
      const { data: startupsData, error } = await supabase
        .from("startups")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Fetch founder profiles separately for each startup
      const startupsWithFounders: StartupWithFounder[] = [];
      
      for (const startup of startupsData || []) {
        let founderData = null;
        
        if (startup.founder_id) {
          const { data: founder, error: founderError } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, email")
            .eq("id", startup.founder_id)
            .maybeSingle();
            
          if (!founderError && founder) {
            founderData = founder;
          }
        }
        
        startupsWithFounders.push({
          ...startup,
          featured: startup.is_featured,
          founder: founderData || undefined
        });
      }
      
      // Extract unique industries for filtering
      const uniqueIndustries = [...new Set(startupsWithFounders.map(s => s.industry).filter(Boolean))] as string[];
      setIndustries(uniqueIndustries);
      
      setStartups(startupsWithFounders);
      setFilteredStartups(startupsWithFounders);
    } catch (error: any) {
      console.error("Error fetching startups:", error);
      toast({
        title: "Error fetching startups",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFounders = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .order("first_name", { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        setAvailableFounders(data.map(founder => ({
          id: founder.id,
          name: `${founder.first_name || ''} ${founder.last_name || ''}`.trim(),
          email: founder.email
        })));
      }
    } catch (error: any) {
      console.error("Error fetching founders:", error);
    }
  };

  const handleCreateStartup = async () => {
    try {
      if (!currentStartup.name || !currentStartup.industry) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }
      
      // Create new startup
      const { data, error } = await supabase
        .from("startups")
        .insert({
          name: currentStartup.name,
          description: currentStartup.description,
          industry: currentStartup.industry,
          website_url: currentStartup.website_url,
          team_size: currentStartup.team_size,
          funding_stage: currentStartup.funding_stage,
          founder_id: currentStartup.founder_id,
          is_featured: currentStartup.featured
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // If successful, refresh the list
      await fetchStartups();
      
      toast({
        title: "Startup created",
        description: "The startup has been successfully created.",
      });
      
      // Reset form and close dialog
      resetForm();
      setShowAddDialog(false);
    } catch (error: any) {
      toast({
        title: "Error creating startup",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditStartup = async () => {
    try {
      if (!currentStartup.id || !currentStartup.name) {
        toast({
          title: "Missing information",
          description: "Startup ID and name are required.",
          variant: "destructive",
        });
        return;
      }
      
      // Update startup
      const { error } = await supabase
        .from("startups")
        .update({
          name: currentStartup.name,
          description: currentStartup.description,
          industry: currentStartup.industry,
          website_url: currentStartup.website_url,
          team_size: currentStartup.team_size,
          funding_stage: currentStartup.funding_stage,
          founder_id: currentStartup.founder_id,
          is_featured: currentStartup.featured
        })
        .eq("id", currentStartup.id);
      
      if (error) throw error;
      
      // If successful, refresh the list
      await fetchStartups();
      
      toast({
        title: "Startup updated",
        description: "The startup has been successfully updated.",
      });
      
      // Reset form and close dialog
      resetForm();
      setShowEditDialog(false);
    } catch (error: any) {
      toast({
        title: "Error updating startup",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteStartup = async () => {
    try {
      if (!currentStartup.id) {
        toast({
          title: "Error",
          description: "No startup selected for deletion.",
          variant: "destructive",
        });
        return;
      }
      
      // Delete startup
      const { error } = await supabase
        .from("startups")
        .delete()
        .eq("id", currentStartup.id);
      
      if (error) throw error;
      
      // If successful, refresh the list
      const updatedStartups = startups.filter(s => s.id !== currentStartup.id);
      setStartups(updatedStartups);
      setFilteredStartups(updatedStartups.filter(s => 
        (!searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (!industryFilter || s.industry === industryFilter)
      ));
      
      toast({
        title: "Startup deleted",
        description: "The startup has been successfully deleted.",
      });
      
      // Reset form and close dialog
      resetForm();
      setShowDeleteDialog(false);
    } catch (error: any) {
      toast({
        title: "Error deleting startup",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (startup: StartupWithFounder) => {
    setCurrentStartup({
      id: startup.id,
      name: startup.name,
      description: startup.description || "",
      industry: startup.industry || "",
      website_url: startup.website_url || "",
      team_size: startup.team_size || 1,
      funding_stage: startup.funding_stage || "pre-seed",
      founder_id: startup.founder_id,
      featured: startup.featured || false
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (startup: StartupWithFounder) => {
    setCurrentStartup({
      id: startup.id,
      name: startup.name,
      description: startup.description || "",
      industry: startup.industry || "",
      website_url: startup.website_url || "",
      team_size: startup.team_size || 1,
      funding_stage: startup.funding_stage || "pre-seed",
      featured: startup.featured || false
    });
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setCurrentStartup({
      name: "",
      description: "",
      industry: "",
      website_url: "",
      team_size: 1,
      funding_stage: "pre-seed",
      featured: false
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <AdminPageTemplate
      title="Browse Startups"
      description="View and manage all startups in the Startup Club."
      icon={Building}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Startups</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search startups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[250px]"
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>

            <Select
              value={industryFilter || "all"}
              onValueChange={(value) => setIndustryFilter(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setIndustryFilter(null);
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Startup
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Add New Startup</DialogTitle>
                  <DialogDescription>
                    Enter startup details below. Required fields are marked with an asterisk (*).
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      value={currentStartup.name}
                      onChange={(e) => setCurrentStartup({...currentStartup, name: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="industry" className="text-right">
                      Industry *
                    </Label>
                    <Input
                      id="industry"
                      value={currentStartup.industry}
                      onChange={(e) => setCurrentStartup({...currentStartup, industry: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="website" className="text-right">
                      Website
                    </Label>
                    <Input
                      id="website"
                      value={currentStartup.website_url || ""}
                      onChange={(e) => setCurrentStartup({...currentStartup, website_url: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="team-size" className="text-right">
                      Team Size
                    </Label>
                    <Input
                      id="team-size"
                      type="number"
                      value={currentStartup.team_size || ""}
                      onChange={(e) => setCurrentStartup({...currentStartup, team_size: parseInt(e.target.value) || 1})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="funding" className="text-right">
                      Funding Stage
                    </Label>
                    <Select
                      value={currentStartup.funding_stage || "pre-seed"}
                      onValueChange={(value) => setCurrentStartup({...currentStartup, funding_stage: value})}
                    >
                      <SelectTrigger id="funding" className="col-span-3">
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                        <SelectItem value="seed">Seed</SelectItem>
                        <SelectItem value="series-a">Series A</SelectItem>
                        <SelectItem value="series-b">Series B</SelectItem>
                        <SelectItem value="series-c">Series C</SelectItem>
                        <SelectItem value="growth">Growth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="founder" className="text-right">
                      Founder
                    </Label>
                    <Select
                      value={currentStartup.founder_id || ""}
                      onValueChange={(value) => setCurrentStartup({...currentStartup, founder_id: value})}
                    >
                      <SelectTrigger id="founder" className="col-span-3">
                        <SelectValue placeholder="Select founder" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None Selected</SelectItem>
                        {availableFounders.map((founder) => (
                          <SelectItem key={founder.id} value={founder.id}>
                            {founder.name} ({founder.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="featured" className="text-right">
                      Featured
                    </Label>
                    <Select
                      value={currentStartup.featured ? "true" : "false"}
                      onValueChange={(value) => setCurrentStartup({...currentStartup, featured: value === "true"})}
                    >
                      <SelectTrigger id="featured" className="col-span-3">
                        <SelectValue placeholder="Featured status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Featured</SelectItem>
                        <SelectItem value="false">Not Featured</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right pt-2">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={currentStartup.description || ""}
                      onChange={(e) => setCurrentStartup({...currentStartup, description: e.target.value})}
                      className="col-span-3"
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateStartup}>Create Startup</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredStartups.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No startups found matching your search criteria.
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Founder</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Team Size</TableHead>
                    <TableHead>Funding Stage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStartups.map((startup) => (
                    <TableRow key={startup.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          {startup.featured && (
                            <Star className="h-4 w-4 text-yellow-500" />
                          )}
                          <span>{startup.name}</span>
                        </div>
                        {startup.website_url && (
                          <a 
                            href={startup.website_url.startsWith('http') ? startup.website_url : `https://${startup.website_url}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline"
                          >
                            {startup.website_url}
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        {startup.founder ? (
                          <div>
                            <div>{startup.founder.first_name} {startup.founder.last_name}</div>
                            <div className="text-xs text-gray-500">{startup.founder.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {startup.industry ? (
                          <Badge variant="outline">{startup.industry}</Badge>
                        ) : (
                          <span className="text-gray-400">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {startup.team_size ? (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{startup.team_size}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {startup.funding_stage ? (
                          <Badge className={
                            startup.funding_stage === 'pre-seed' ? 'bg-blue-100 text-blue-800' :
                            startup.funding_stage === 'seed' ? 'bg-green-100 text-green-800' :
                            startup.funding_stage === 'series-a' ? 'bg-purple-100 text-purple-800' :
                            startup.funding_stage === 'series-b' ? 'bg-indigo-100 text-indigo-800' :
                            startup.funding_stage === 'series-c' ? 'bg-pink-100 text-pink-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {startup.funding_stage.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {startup.featured ? (
                          <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                        ) : (
                          <Badge variant="outline">Regular</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="12" cy="5" r="1" />
                                <circle cx="12" cy="19" r="1" />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => window.open(`/startups/${startup.id}`, '_blank')}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(startup)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Startup
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(startup)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Startup
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Startup Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Startup: {currentStartup.name}</DialogTitle>
            <DialogDescription>
              Update startup details below. Required fields are marked with an asterisk (*).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name *
              </Label>
              <Input
                id="edit-name"
                value={currentStartup.name}
                onChange={(e) => setCurrentStartup({...currentStartup, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-industry" className="text-right">
                Industry *
              </Label>
              <Input
                id="edit-industry"
                value={currentStartup.industry}
                onChange={(e) => setCurrentStartup({...currentStartup, industry: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-website" className="text-right">
                Website
              </Label>
              <Input
                id="edit-website"
                value={currentStartup.website_url || ""}
                onChange={(e) => setCurrentStartup({...currentStartup, website_url: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-team-size" className="text-right">
                Team Size
              </Label>
              <Input
                id="edit-team-size"
                type="number"
                value={currentStartup.team_size || ""}
                onChange={(e) => setCurrentStartup({...currentStartup, team_size: parseInt(e.target.value) || 1})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-funding" className="text-right">
                Funding Stage
              </Label>
              <Select
                value={currentStartup.funding_stage || "pre-seed"}
                onValueChange={(value) => setCurrentStartup({...currentStartup, funding_stage: value})}
              >
                <SelectTrigger id="edit-funding" className="col-span-3">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                  <SelectItem value="seed">Seed</SelectItem>
                  <SelectItem value="series-a">Series A</SelectItem>
                  <SelectItem value="series-b">Series B</SelectItem>
                  <SelectItem value="series-c">Series C</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-founder" className="text-right">
                Founder
              </Label>
              <Select
                value={currentStartup.founder_id || ""}
                onValueChange={(value) => setCurrentStartup({...currentStartup, founder_id: value})}
              >
                <SelectTrigger id="edit-founder" className="col-span-3">
                  <SelectValue placeholder="Select founder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None Selected</SelectItem>
                  {availableFounders.map((founder) => (
                    <SelectItem key={founder.id} value={founder.id}>
                      {founder.name} ({founder.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-featured" className="text-right">
                Featured
              </Label>
              <Select
                value={currentStartup.featured ? "true" : "false"}
                onValueChange={(value) => setCurrentStartup({...currentStartup, featured: value === "true"})}
              >
                <SelectTrigger id="edit-featured" className="col-span-3">
                  <SelectValue placeholder="Featured status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Featured</SelectItem>
                  <SelectItem value="false">Not Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={currentStartup.description || ""}
                onChange={(e) => setCurrentStartup({...currentStartup, description: e.target.value})}
                className="col-span-3"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditStartup}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the startup "{currentStartup.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteStartup}>
              Delete Startup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageTemplate>
  );
};

export default AdminBrowseStartups;
