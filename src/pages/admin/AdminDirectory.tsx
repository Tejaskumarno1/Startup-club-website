import React, { useState, useEffect } from "react";
import { UserSearch, Mail, Phone, Building, MapPin, Filter, UserPlus, Edit, Trash2 } from "lucide-react";
import { AdminPageTemplate } from "@/components/admin/AdminPageTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createUserProfileAsAdmin } from "@/lib/adminHelpers";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  company?: string;
  location?: string;
  profession?: string;
  interests?: string[];
  created_at: string;
  bio?: string;
  photo_url?: string;
}

const AdminDirectory = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    let result = [...profiles];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (profile) =>
          profile.first_name?.toLowerCase().includes(query) ||
          profile.last_name?.toLowerCase().includes(query) ||
          profile.email?.toLowerCase().includes(query) ||
          profile.company?.toLowerCase().includes(query) ||
          profile.location?.toLowerCase().includes(query) ||
          profile.profession?.toLowerCase().includes(query)
      );
    }
    
    if (roleFilter) {
      result = result.filter((profile) => profile.role === roleFilter);
    }
    
    setFilteredProfiles(result);
  }, [searchQuery, roleFilter, profiles]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setProfiles(data || []);
      setFilteredProfiles(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching profiles",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'mentor':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditUser = async () => {
    if (!currentProfile) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: currentProfile.first_name,
          last_name: currentProfile.last_name,
          email: currentProfile.email,
          role: currentProfile.role,
          company: currentProfile.company,
          location: currentProfile.location,
          profession: currentProfile.profession,
          bio: currentProfile.bio
        })
        .eq("id", currentProfile.id);
        
      if (error) throw error;
      
      const updatedProfiles = profiles.map(profile => 
        profile.id === currentProfile.id ? currentProfile : profile
      );
      
      setProfiles(updatedProfiles);
      setFilteredProfiles(
        updatedProfiles.filter(p => 
          (!searchQuery || 
            p.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.email?.toLowerCase().includes(searchQuery.toLowerCase())
          ) &&
          (!roleFilter || p.role === roleFilter)
      ));
      
      toast({
        title: "User updated",
        description: "User details have been updated successfully.",
      });
      
      setShowEditDialog(false);
    } catch (error: any) {
      toast({
        title: "Error updating user",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async () => {
    if (!currentProfile || !currentProfile.email) {
      toast({
        title: "Missing information",
        description: "Email is required.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", currentProfile.email)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingUser) {
        toast({
          title: "User already exists",
          description: "A user with this email already exists.",
          variant: "destructive",
        });
        return;
      }
      
      const newId = crypto.randomUUID();
      
      const { success, error } = await createUserProfileAsAdmin({
        id: newId,
        email: currentProfile.email,
        first_name: currentProfile.first_name || "",
        last_name: currentProfile.last_name || "",
        role: currentProfile.role || "student",
        company: currentProfile.company,
        location: currentProfile.location,
        profession: currentProfile.profession,
        bio: currentProfile.bio,
        created_at: new Date().toISOString()
      });
      
      if (!success) throw error;
      
      await fetchProfiles();
      
      toast({
        title: "User added",
        description: "New user has been added successfully.",
      });
      
      setCurrentProfile(null);
      setShowAddDialog(false);
    } catch (error: any) {
      toast({
        title: "Error adding user",
        description: error.message || "An error occurred while adding user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!currentProfile) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", currentProfile.id);
        
      if (error) throw error;
      
      const updatedProfiles = profiles.filter(profile => profile.id !== currentProfile.id);
      setProfiles(updatedProfiles);
      setFilteredProfiles(updatedProfiles.filter(p => 
        (!searchQuery || 
          p.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
          p.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
        ) &&
        (!roleFilter || p.role === roleFilter)
      ));
      
      toast({
        title: "User deleted",
        description: "User has been deleted successfully.",
      });
      
      setShowDeleteDialog(false);
    } catch (error: any) {
      toast({
        title: "Error deleting user",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AdminPageTemplate
      title="Member Directory"
      description="Browse and manage all members in the Startup Club."
      icon={UserSearch}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Member Directory</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[250px]"
              />
              <UserSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>

            <Select
              value={roleFilter || "all"}
              onValueChange={(value) => setRoleFilter(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="mentor">Mentors</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setRoleFilter(null);
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>

            <Button onClick={() => {
              setCurrentProfile({
                id: "",
                first_name: "",
                last_name: "",
                email: "",
                role: "student",
                created_at: new Date().toISOString()
              });
              setShowAddDialog(true);
            }}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No members found matching your search criteria.
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Company/Profession</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">
                        {profile.first_name} {profile.last_name}
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(profile.role)}>
                          {profile.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span className="text-xs truncate max-w-[150px]">{profile.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {profile.company || profile.profession ? (
                          <div className="flex items-center space-x-1">
                            <Building className="h-3 w-3" />
                            <span>{profile.company || profile.profession}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {profile.location ? (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{profile.location}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(profile.created_at)}</TableCell>
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
                              onClick={() => window.open(`/profile/${profile.id}`, '_blank')}
                            >
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setCurrentProfile(profile);
                                setShowEditDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const newRole = profile.role === 'student' ? 'mentor' : 
                                               profile.role === 'mentor' ? 'admin' : 'student';
                                const updatedProfile = {...profile, role: newRole};
                                setCurrentProfile(updatedProfile);
                                handleEditUser();
                              }}
                            >
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setCurrentProfile(profile);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
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

      {currentProfile && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user details. Required fields are marked with an asterisk (*).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="first_name" className="text-right">
                  First Name *
                </Label>
                <Input
                  id="first_name"
                  value={currentProfile.first_name}
                  onChange={(e) => setCurrentProfile({...currentProfile, first_name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="last_name" className="text-right">
                  Last Name *
                </Label>
                <Input
                  id="last_name"
                  value={currentProfile.last_name}
                  onChange={(e) => setCurrentProfile({...currentProfile, last_name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={currentProfile.email}
                  onChange={(e) => setCurrentProfile({...currentProfile, email: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select
                  value={currentProfile.role}
                  onValueChange={(value) => setCurrentProfile({...currentProfile, role: value})}
                >
                  <SelectTrigger id="role" className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="mentor">Mentor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company" className="text-right">
                  Company
                </Label>
                <Input
                  id="company"
                  value={currentProfile.company || ""}
                  onChange={(e) => setCurrentProfile({...currentProfile, company: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="profession" className="text-right">
                  Profession
                </Label>
                <Input
                  id="profession"
                  value={currentProfile.profession || ""}
                  onChange={(e) => setCurrentProfile({...currentProfile, profession: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input
                  id="location"
                  value={currentProfile.location || ""}
                  onChange={(e) => setCurrentProfile({...currentProfile, location: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="bio" className="text-right pt-2">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={currentProfile.bio || ""}
                  onChange={(e) => setCurrentProfile({...currentProfile, bio: e.target.value})}
                  className="col-span-3"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditUser}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {currentProfile && (
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Enter user details below. Required fields are marked with an asterisk (*).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add_email" className="text-right">
                  Email *
                </Label>
                <Input
                  id="add_email"
                  type="email"
                  value={currentProfile.email}
                  onChange={(e) => setCurrentProfile({...currentProfile, email: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add_first_name" className="text-right">
                  First Name
                </Label>
                <Input
                  id="add_first_name"
                  value={currentProfile.first_name}
                  onChange={(e) => setCurrentProfile({...currentProfile, first_name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add_last_name" className="text-right">
                  Last Name
                </Label>
                <Input
                  id="add_last_name"
                  value={currentProfile.last_name}
                  onChange={(e) => setCurrentProfile({...currentProfile, last_name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add_role" className="text-right">
                  Role
                </Label>
                <Select
                  value={currentProfile.role}
                  onValueChange={(value) => setCurrentProfile({...currentProfile, role: value})}
                >
                  <SelectTrigger id="add_role" className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="mentor">Mentor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add_company" className="text-right">
                  Company
                </Label>
                <Input
                  id="add_company"
                  value={currentProfile.company || ""}
                  onChange={(e) => setCurrentProfile({...currentProfile, company: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add_profession" className="text-right">
                  Profession
                </Label>
                <Input
                  id="add_profession"
                  value={currentProfile.profession || ""}
                  onChange={(e) => setCurrentProfile({...currentProfile, profession: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add_location" className="text-right">
                  Location
                </Label>
                <Input
                  id="add_location"
                  value={currentProfile.location || ""}
                  onChange={(e) => setCurrentProfile({...currentProfile, location: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the user {currentProfile?.first_name} {currentProfile?.last_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageTemplate>
  );
};

export default AdminDirectory;
