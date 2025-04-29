
import React, { useState, useEffect } from "react";
import { AdminPageTemplate } from "@/components/admin/AdminPageTemplate";
import { Building2, Plus, Trash2, Edit, Search, Filter, Star, EyeIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { StartupForm, StartupFormValues } from "@/components/startups/StartupForm";
import { useAuth } from "@/context/AuthContext";
import { 
  getAllStartups, createStartup, updateStartup, deleteStartup, toggleStartupFeature 
} from "@/lib/startupApiHelpers";

import type { Startup } from "@/lib/types";

const ManageStartups = () => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [filteredStartups, setFilteredStartups] = useState<Startup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStartup, setCurrentStartup] = useState<Partial<Startup> | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    fetchStartups();
  }, []);

  useEffect(() => {
    let results = [...startups];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (startup) =>
          (startup.name?.toLowerCase().includes(query)) ||
          (startup.description?.toLowerCase().includes(query)) ||
          (startup.industry?.toLowerCase().includes(query))
      );
    }
    
    if (industryFilter) {
      results = results.filter((startup) => startup.industry === industryFilter);
    }
    
    setFilteredStartups(results);
  }, [searchQuery, industryFilter, startups]);

  const fetchStartups = async () => {
    try {
      setLoading(true);
      const response = await getAllStartups();
      
      if (!response.success) {
        throw new Error(response.error);
      }
      
      setStartups(response.data || []);
      setFilteredStartups(response.data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching startups",
        description: error.message || "An error occurred while fetching startups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStartup = async (formData: StartupFormValues) => {
    try {
      setSubmitting(true);
      setFormError(null);
      
      const startupData = {
        ...formData,
        name: formData.name || "",
        founder_id: user?.id || "",
      };
      
      console.log("Creating startup with data:", startupData);
      
      const result = await createStartup(startupData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      if (result.data) {
        setStartups([result.data, ...startups]);
        setFilteredStartups([result.data, ...filteredStartups]);
      }
      
      toast({
        title: "Success",
        description: "Startup has been added successfully",
      });
      
      setShowAddDialog(false);
      setCurrentStartup(null);
    } catch (error: any) {
      setFormError(error.message || "Failed to add startup");
      toast({
        title: "Error adding startup",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStartup = async (formData: StartupFormValues) => {
    if (!currentStartup?.id) return;
    
    try {
      setSubmitting(true);
      setFormError(null);
      
      console.log("Updating startup ID:", currentStartup.id, "with data:", formData);
      
      const result = await updateStartup(currentStartup.id, formData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      if (result.data) {
        const updatedStartups = startups.map(startup => 
          startup.id === currentStartup.id ? result.data! : startup
        );
        
        setStartups(updatedStartups);
        
        let filtered = [...updatedStartups];
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(s => 
            s.name.toLowerCase().includes(query) ||
            (s.description || "").toLowerCase().includes(query) ||
            (s.industry || "").toLowerCase().includes(query)  
          );
        }
        
        if (industryFilter) {
          filtered = filtered.filter(s => s.industry === industryFilter);
        }
        
        setFilteredStartups(filtered);
      }
      
      toast({
        title: "Success",
        description: "Startup has been updated successfully",
      });
      
      setShowEditDialog(false);
      setCurrentStartup(null);
    } catch (error: any) {
      setFormError(error.message || "Failed to update startup");
      toast({
        title: "Error updating startup",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStartup = async () => {
    if (!currentStartup?.id) return;
    
    try {
      setSubmitting(true);
      
      const result = await deleteStartup(currentStartup.id);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      const updatedStartups = startups.filter(s => s.id !== currentStartup.id);
      setStartups(updatedStartups);
      
      let filtered = [...updatedStartups];
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(s => 
          s.name.toLowerCase().includes(query) ||
          (s.description || "").toLowerCase().includes(query) ||
          (s.industry || "").toLowerCase().includes(query)  
        );
      }
      
      if (industryFilter) {
        filtered = filtered.filter(s => s.industry === industryFilter);
      }
      
      setFilteredStartups(filtered);
      
      toast({
        title: "Success",
        description: "Startup has been deleted successfully",
      });
      
      setShowDeleteDialog(false);
      setCurrentStartup(null);
    } catch (error: any) {
      toast({
        title: "Error deleting startup",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFeature = async (startup: Startup) => {
    try {
      const result = await toggleStartupFeature(startup.id, !startup.is_featured);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      const updatedStartups = startups.map(s => 
        s.id === startup.id ? { ...s, is_featured: !s.is_featured } : s
      );
      
      setStartups(updatedStartups);
      
      const updatedFiltered = filteredStartups.map(s => 
        s.id === startup.id ? { ...s, is_featured: !s.is_featured } : s
      );
      
      setFilteredStartups(updatedFiltered);
      
      toast({
        title: "Success",
        description: `Startup has been ${!startup.is_featured ? 'featured' : 'unfeatured'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating startup",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  const industries = React.useMemo(() => {
    const uniqueIndustries = new Set<string>();
    startups.forEach(startup => {
      if (startup.industry) uniqueIndustries.add(startup.industry);
    });
    return Array.from(uniqueIndustries).sort();
  }, [startups]);

  return (
    <AdminPageTemplate
      title="Manage Startups"
      description="Create, edit, and manage startup profiles in your network."
      icon={Building2}
    >
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Startups Management</CardTitle>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search startups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full md:w-[250px]"
              />
            </div>

            <Select
              value={industryFilter || "all"}
              onValueChange={(value) => setIndustryFilter(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map(industry => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2 w-full md:w-auto">
              <Button 
                variant="outline" 
                className="flex-1 md:flex-none"
                onClick={() => {
                  setSearchQuery("");
                  setIndustryFilter(null);
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>

              <Button 
                onClick={() => {
                  setCurrentStartup({});
                  setFormError(null);
                  setShowAddDialog(true);
                }}
                className="flex-1 md:flex-none"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Startup
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner size="lg" />
            </div>
          ) : filteredStartups.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {startups.length === 0 ? (
                <div className="space-y-3">
                  <p>No startups have been added yet.</p>
                  <Button onClick={() => {
                    setCurrentStartup({});
                    setShowAddDialog(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Startup
                  </Button>
                </div>
              ) : (
                <p>No startups found matching your search criteria.</p>
              )}
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Industry</TableHead>
                    <TableHead className="hidden md:table-cell">Team Size</TableHead>
                    <TableHead className="hidden lg:table-cell">Funding Stage</TableHead>
                    <TableHead className="hidden lg:table-cell">Founded</TableHead>
                    <TableHead className="hidden lg:table-cell">Featured</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStartups.map((startup) => (
                    <TableRow key={startup.id} className="group">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {startup.logo_url ? (
                            <img 
                              src={startup.logo_url} 
                              alt={startup.name}
                              className="w-8 h-8 rounded object-contain bg-gray-50"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                              {startup.name.substring(0, 1).toUpperCase()}
                            </div>
                          )}
                          {startup.name}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {startup.industry || "Not specified"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {startup.team_size || "N/A"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline" className={
                          startup.funding_stage?.includes("Series") ? "bg-green-50 text-green-700 border-green-200" : ""
                        }>
                          {startup.funding_stage || "Not specified"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {startup.founding_date ? formatDate(startup.founding_date) : "N/A"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {startup.is_featured ? (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Featured
                          </Badge>
                        ) : (
                          <Badge variant="outline">Regular</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleFeature(startup)}
                            title={startup.is_featured ? "Unfeature" : "Feature"}
                          >
                            <Star className={`h-4 w-4 ${startup.is_featured ? "fill-yellow-400 text-yellow-400" : ""}`} />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              window.open(`/startups/${startup.id}`, "_blank");
                            }}
                            title="View startup page"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setCurrentStartup(startup);
                              setFormError(null);
                              setShowEditDialog(true);
                            }}
                            title="Edit startup"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setCurrentStartup(startup);
                              setShowDeleteDialog(true);
                            }}
                            className="text-destructive hover:text-destructive"
                            title="Delete startup"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2">Add New Startup</DialogTitle>
          </DialogHeader>
          
          <StartupForm 
            onSubmit={handleAddStartup}
            isLoading={submitting}
            error={formError}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl mb-2">Edit Startup</DialogTitle>
          </DialogHeader>
          
          <StartupForm 
            onSubmit={handleEditStartup}
            initialData={currentStartup as StartupFormValues}
            isLoading={submitting}
            error={formError}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">Confirm Deletion</DialogTitle>
          </DialogHeader>
          
          <p className="py-4">
            Are you sure you want to delete <strong>{currentStartup?.name}</strong>? This action cannot be undone.
          </p>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteStartup}
              disabled={submitting}
            >
              {submitting ? <Spinner className="mr-2" size="sm" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageTemplate>
  );
};

export default ManageStartups;
