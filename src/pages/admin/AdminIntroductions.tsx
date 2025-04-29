
import React, { useState, useEffect } from "react";
import { UsersRound, Filter, Search, AlertCircle, CheckCheck, X, Edit, Trash2 } from "lucide-react";
import { AdminPageTemplate } from "@/components/admin/AdminPageTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IntroductionRequest } from "@/lib/types";

// User profile interface
interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company?: string;
  role?: string;
  photo_url?: string;
}

// Extended introduction interface with user profiles
interface Introduction extends IntroductionRequest {
  requester: UserProfile;
  intermediary: UserProfile;
  target: UserProfile;
}

const AdminIntroductions = () => {
  const [introductions, setIntroductions] = useState<Introduction[]>([]);
  const [filteredIntroductions, setFilteredIntroductions] = useState<Introduction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentIntroduction, setCurrentIntroduction] = useState<Introduction | null>(null);
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const { toast } = useToast();

  // Fetch introductions
  useEffect(() => {
    fetchIntroductions();
    fetchAvailableUsers();
  }, []);

  // Filter introductions when search or tab changes
  useEffect(() => {
    let result = [...introductions];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (intro) =>
          intro.requester.first_name?.toLowerCase().includes(query) ||
          intro.requester.last_name?.toLowerCase().includes(query) ||
          intro.intermediary.first_name?.toLowerCase().includes(query) ||
          intro.intermediary.last_name?.toLowerCase().includes(query) ||
          intro.target.first_name?.toLowerCase().includes(query) ||
          intro.target.last_name?.toLowerCase().includes(query) ||
          intro.message?.toLowerCase().includes(query)
      );
    }
    
    // Apply tab filter
    if (currentTab !== "all") {
      result = result.filter((intro) => intro.status === currentTab);
    }
    
    setFilteredIntroductions(result);
  }, [searchQuery, currentTab, introductions]);

  const fetchAvailableUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, company, role, photo_url")
        .order("first_name", { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        setAvailableUsers(data as UserProfile[]);
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchIntroductions = async () => {
    try {
      setLoading(true);
      
      const { data: introRequests, error } = await supabase
        .from("introduction_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // For each introduction, fetch the user profiles
      if (introRequests) {
        const introductionsWithProfiles: Introduction[] = [];
        
        for (const intro of introRequests) {
          // Fetch requester profile
          const { data: requesterData } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, email, company, role, photo_url")
            .eq("id", intro.requester_id)
            .single();
            
          // Fetch intermediary profile
          const { data: intermediaryData } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, email, company, role, photo_url")
            .eq("id", intro.intermediary_id)
            .single();
            
          // Fetch target profile
          const { data: targetData } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, email, company, role, photo_url")
            .eq("id", intro.target_id)
            .single();
            
          const introWithProfiles = {
            ...intro,
            requester: requesterData || { 
              id: intro.requester_id,
              first_name: "Unknown", 
              last_name: "User",
              email: ""
            },
            intermediary: intermediaryData || { 
              id: intro.intermediary_id,
              first_name: "Unknown", 
              last_name: "User",
              email: ""
            },
            target: targetData || { 
              id: intro.target_id,
              first_name: "Unknown", 
              last_name: "User",
              email: ""
            }
          };
          
          introductionsWithProfiles.push(introWithProfiles as Introduction);
        }
        
        setIntroductions(introductionsWithProfiles);
        setFilteredIntroductions(introductionsWithProfiles);
      }
    } catch (error: any) {
      console.error("Error fetching introductions:", error);
      toast({
        title: "Error fetching introductions",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateIntroductionStatus = async (id: string, status: "pending" | "accepted" | "rejected" | "completed") => {
    try {
      const { error } = await supabase
        .from("introduction_requests")
        .update({ status })
        .eq("id", id);
        
      if (error) throw error;
      
      // Update local state
      const updatedIntroductions = introductions.map(intro => 
        intro.id === id ? { ...intro, status } : intro
      );
      
      setIntroductions(updatedIntroductions);
      setFilteredIntroductions(
        filteredIntroductions.map(intro => 
          intro.id === id ? { ...intro, status } : intro
        )
      );
      
      toast({
        title: "Introduction updated",
        description: `Introduction status changed to ${status}`,
      });
      
    } catch (error: any) {
      toast({
        title: "Error updating introduction",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditIntroduction = async () => {
    if (!currentIntroduction) return;
    
    try {
      const { error } = await supabase
        .from("introduction_requests")
        .update({
          requester_id: currentIntroduction.requester.id,
          intermediary_id: currentIntroduction.intermediary.id,
          target_id: currentIntroduction.target.id,
          message: currentIntroduction.message,
          status: currentIntroduction.status
        })
        .eq("id", currentIntroduction.id);
        
      if (error) throw error;
      
      // Update local state
      const updatedIntroductions = introductions.map(intro => 
        intro.id === currentIntroduction.id ? currentIntroduction : intro
      );
      
      setIntroductions(updatedIntroductions);
      setFilteredIntroductions(
        filteredIntroductions.map(intro => 
          intro.id === currentIntroduction.id ? currentIntroduction : intro
        )
      );
      
      toast({
        title: "Introduction updated",
        description: "Introduction details have been updated successfully.",
      });
      
      setShowEditDialog(false);
    } catch (error: any) {
      toast({
        title: "Error updating introduction",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteIntroduction = async () => {
    if (!currentIntroduction) return;
    
    try {
      const { error } = await supabase
        .from("introduction_requests")
        .delete()
        .eq("id", currentIntroduction.id);
        
      if (error) throw error;
      
      // Update local state
      const updatedIntroductions = introductions.filter(intro => 
        intro.id !== currentIntroduction.id
      );
      
      setIntroductions(updatedIntroductions);
      setFilteredIntroductions(
        filteredIntroductions.filter(intro => 
          intro.id !== currentIntroduction.id
        )
      );
      
      toast({
        title: "Introduction deleted",
        description: "Introduction has been deleted successfully.",
      });
      
      setShowDeleteDialog(false);
    } catch (error: any) {
      toast({
        title: "Error deleting introduction",
        description: error.message,
        variant: "destructive",
      });
    }
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

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminPageTemplate
      title="Manage Introductions"
      description="Review and manage introduction requests between startup founders and mentors."
      icon={UsersRound}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Introduction Requests</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[250px]"
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setCurrentTab("all");
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredIntroductions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No introduction requests found matching your search criteria.
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requester</TableHead>
                    <TableHead>Intermediary</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIntroductions.map((intro) => (
                    <TableRow key={intro.id}>
                      <TableCell>
                        <div className="font-medium">
                          {intro.requester.first_name} {intro.requester.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {intro.requester.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {intro.intermediary.first_name} {intro.intermediary.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {intro.intermediary.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {intro.target.first_name} {intro.target.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {intro.target.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(intro.status)}>
                          {intro.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(intro.created_at)}</TableCell>
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
                              onClick={() => {
                                // View details functionality
                                toast({
                                  title: "View Details",
                                  description: `Message: ${intro.message || "No message provided"}`,
                                });
                              }}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setCurrentIntroduction(intro);
                                setShowEditDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Introduction
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateIntroductionStatus(intro.id, "accepted")}
                              disabled={intro.status === "accepted"}
                            >
                              <CheckCheck className="h-4 w-4 mr-2" />
                              Mark as Accepted
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateIntroductionStatus(intro.id, "completed")}
                              disabled={intro.status === "completed"}
                            >
                              <CheckCheck className="h-4 w-4 mr-2" />
                              Mark as Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateIntroductionStatus(intro.id, "rejected")}
                              disabled={intro.status === "rejected"}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject Introduction
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setCurrentIntroduction(intro);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Introduction
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

      {/* Edit Introduction Dialog */}
      {currentIntroduction && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Edit Introduction</DialogTitle>
              <DialogDescription>
                Update introduction request details. All fields are required.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="requester" className="text-right">
                  Requester
                </Label>
                <Select
                  value={currentIntroduction.requester.id}
                  onValueChange={(value) => {
                    const selectedUser = availableUsers.find(user => user.id === value);
                    if (selectedUser) {
                      setCurrentIntroduction({
                        ...currentIntroduction,
                        requester: selectedUser
                      });
                    }
                  }}
                >
                  <SelectTrigger id="requester" className="col-span-3">
                    <SelectValue placeholder="Select requester" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={`req-${user.id}`} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="intermediary" className="text-right">
                  Intermediary
                </Label>
                <Select
                  value={currentIntroduction.intermediary.id}
                  onValueChange={(value) => {
                    const selectedUser = availableUsers.find(user => user.id === value);
                    if (selectedUser) {
                      setCurrentIntroduction({
                        ...currentIntroduction,
                        intermediary: selectedUser
                      });
                    }
                  }}
                >
                  <SelectTrigger id="intermediary" className="col-span-3">
                    <SelectValue placeholder="Select intermediary" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={`int-${user.id}`} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="target" className="text-right">
                  Target
                </Label>
                <Select
                  value={currentIntroduction.target.id}
                  onValueChange={(value) => {
                    const selectedUser = availableUsers.find(user => user.id === value);
                    if (selectedUser) {
                      setCurrentIntroduction({
                        ...currentIntroduction,
                        target: selectedUser
                      });
                    }
                  }}
                >
                  <SelectTrigger id="target" className="col-span-3">
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={`tar-${user.id}`} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={currentIntroduction.status}
                  onValueChange={(value: "pending" | "accepted" | "rejected" | "completed") => {
                    setCurrentIntroduction({
                      ...currentIntroduction,
                      status: value
                    });
                  }}
                >
                  <SelectTrigger id="status" className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="message" className="text-right pt-2">
                  Message
                </Label>
                <Textarea
                  id="message"
                  value={currentIntroduction.message || ""}
                  onChange={(e) => setCurrentIntroduction({
                    ...currentIntroduction,
                    message: e.target.value
                  })}
                  className="col-span-3"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditIntroduction}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this introduction request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteIntroduction}>
              Delete Introduction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageTemplate>
  );
};

export default AdminIntroductions;
