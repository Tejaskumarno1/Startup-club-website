import React, { useState } from "react";
import { AdminPageTemplate } from "@/components/admin/AdminPageTemplate";
import { 
  Star, Plus, Edit, Trash, Save, X, ExternalLink, 
  Globe, Linkedin, Twitter, Check, AlertTriangle, PlusCircle, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useImportantMembers } from "@/hooks/useImportantMembers";
import { ImportantMember } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { uploadMemberProfileImage } from "@/lib/api/memberStorageApi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const memberFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  bio: z.string().optional(),
  avatar_url: z.string().optional(),
  linkedin_url: z.string().optional(),
  twitter_url: z.string().optional(),
  website_url: z.string().optional(),
  display_order: z.number().int().nonnegative(),
  company: z.string().optional(),
  expertise: z.array(z.string()).default([])
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

const initialMemberForm: MemberFormValues = {
  id: "",
  name: "",
  role: "",
  bio: "",
  avatar_url: "",
  linkedin_url: "",
  twitter_url: "",
  website_url: "",
  display_order: 0,
  company: "",
  expertise: []
};

const expertiseOptions = [
  "Software Engineering",
  "Cloud Architecture",
  "AI",
  "Data Science",
  "UI/UX Design",
  "Product Management",
  "Entrepreneurship",
  "Business Development",
  "Marketing",
  "Sales",
  "Finance",
  "Venture Capital",
  "Legal"
];

const ManageImportantMembers = () => {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<ImportantMember | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [newExpertise, setNewExpertise] = useState("");
  
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: initialMemberForm
  });

  const { 
    data: members, 
    isLoading, 
    error,
    addMember,
    updateMember,
    deleteMember,
    isAddingMember,
    isUpdatingMember,
    isDeletingMember
  } = useImportantMembers();

  const handleAvatarChange = async (file: File) => {
    setIsUploading(true);
    try {
      const { url } = await uploadMemberProfileImage(file);
      form.setValue('avatar_url', url);
      toast({
        title: "Image uploaded",
        description: "Profile image has been uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading the image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddNew = () => {
    setEditingMember(null);
    form.reset(initialMemberForm);
    setActiveTab("basic");
    setIsOpen(true);
  };

  const handleEdit = (member: ImportantMember) => {
    setEditingMember(member);
    form.reset({
      id: member.id,
      name: member.name,
      role: member.role,
      bio: member.bio || "",
      avatar_url: member.avatar_url || "",
      linkedin_url: member.linkedin_url || "",
      twitter_url: member.twitter_url || "",
      website_url: member.website_url || "",
      display_order: member.display_order || 0,
      company: member.company || "",
      expertise: member.expertise || []
    });
    setActiveTab("basic");
    setIsOpen(true);
  };

  const onSubmit = async (data: MemberFormValues) => {
    try {
      const memberData = {
        name: data.name,
        role: data.role,
        bio: data.bio || "",
        avatar_url: data.avatar_url || "",
        linkedin_url: data.linkedin_url || "",
        twitter_url: data.twitter_url || "",
        website_url: data.website_url || "",
        display_order: data.display_order,
        company: data.company || "",
        expertise: data.expertise || [],
      };

      if (editingMember) {
        await updateMember({
          ...editingMember,
          ...memberData
        });
        toast({
          title: "Member updated",
          description: "The member has been successfully updated",
        });
      } else {
        await addMember(memberData);
        toast({
          title: "Member added",
          description: "The new member has been successfully added",
        });
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving member:", error);
      toast({
        title: "Error",
        description: "There was a problem saving the member data",
        variant: "destructive",
      });
    }
  };

  const openDeleteConfirmation = (id: string) => {
    setMemberToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (memberToDelete) {
      try {
        await deleteMember(memberToDelete);
        toast({
          title: "Member deleted",
          description: "The member has been successfully removed",
        });
        setDeleteDialogOpen(false);
        setMemberToDelete(null);
      } catch (error) {
        console.error("Error deleting member:", error);
        toast({
          title: "Error",
          description: "There was a problem deleting the member",
          variant: "destructive",
        });
      }
    }
  };

  const addExpertiseTag = () => {
    if (!newExpertise.trim()) return;
    
    const currentExpertise = form.getValues("expertise") || [];
    if (!currentExpertise.includes(newExpertise)) {
      form.setValue("expertise", [...currentExpertise, newExpertise]);
    }
    setNewExpertise("");
  };

  const removeExpertiseTag = (tag: string) => {
    const currentExpertise = form.getValues("expertise") || [];
    form.setValue(
      "expertise", 
      currentExpertise.filter(item => item !== tag)
    );
  };

  const addPredefinedExpertise = (expertise: string) => {
    const currentExpertise = form.getValues("expertise") || [];
    if (!currentExpertise.includes(expertise)) {
      form.setValue("expertise", [...currentExpertise, expertise]);
    }
  };

  if (!isAdmin) {
    return (
      <AdminPageTemplate
        title="Important Members"
        description="Manage important members displayed on the website"
        icon={Star}
      >
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
          <p className="text-yellow-800">You do not have permission to access this page. Please contact an administrator.</p>
        </div>
      </AdminPageTemplate>
    );
  }

  return (
    <AdminPageTemplate
      title="Important Members"
      description="Manage important members displayed on the website"
      icon={Star}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Members List</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage key members that appear on the website
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Member
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-6 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">Error loading members data. Please try again later.</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : members && members.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Company</TableHead>
                  <TableHead className="w-[60px] text-center">Order</TableHead>
                  <TableHead className="hidden md:table-cell">Expertise</TableHead>
                  <TableHead className="hidden md:table-cell">Social</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.sort((a, b) => a.display_order - b.display_order).map((member) => (
                  <TableRow key={member.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={member.avatar_url || ""} alt={member.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {member.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell className="hidden md:table-cell">{member.company || "—"}</TableCell>
                    <TableCell className="text-center">{member.display_order}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {member.expertise && member.expertise.length > 0 ? (
                          member.expertise.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                        {member.expertise && member.expertise.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.expertise.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex gap-2">
                        {member.linkedin_url && (
                          <a 
                            href={member.linkedin_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                            aria-label="LinkedIn profile"
                          >
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                        {member.twitter_url && (
                          <a 
                            href={member.twitter_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50"
                            aria-label="Twitter profile"
                          >
                            <Twitter className="h-4 w-4" />
                          </a>
                        )}
                        {member.website_url && (
                          <a 
                            href={member.website_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-50"
                            aria-label="Website"
                          >
                            <Globe className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(member)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200" 
                          onClick={() => openDeleteConfirmation(member.id)}
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Members Found</CardTitle>
            <CardDescription>
              There are no important members in the system yet. Click "Add New Member" to create one.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Button onClick={handleAddNew} variant="outline" size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Member
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md md:max-w-xl lg:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? 'Edit Member' : 'Add New Member'}
            </DialogTitle>
            <DialogDescription>
              {editingMember 
                ? "Update the member's information below." 
                : "Fill in the details to add a new important member."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="bio">Biography</TabsTrigger>
                  <TabsTrigger value="social">Social Media</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6 pt-4">
                  <div className="flex flex-col items-center mb-6">
                    <ProfileAvatar
                      photoUrl={form.watch('avatar_url')}
                      firstName={form.watch('name').split(' ')[0]}
                      lastName={form.watch('name').split(' ')[1] || ''}
                      onFileChange={handleAvatarChange}
                      isUploading={isUploading}
                      size="lg"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Click on the profile image to upload a photo or enter URL below
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role/Title <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="CEO, Director, Advisor, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Company name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="display_order"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Order <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              step="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)} 
                            />
                          </FormControl>
                          <FormDescription>
                            Lower numbers will appear first
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="avatar_url"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Profile Image URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://example.com/image.jpg" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Direct URL or upload by clicking the profile image above
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="md:col-span-2">
                      <FormItem>
                        <FormLabel>Expertise Tags</FormLabel>
                        <div className="space-y-4">
                          {form.watch("expertise")?.length ? (
                            form.watch("expertise").map((tag) => (
                              <Badge key={tag} className="pl-2 pr-1 py-1 flex items-center gap-1">
                                {tag}
                                <button 
                                  type="button"
                                  onClick={() => removeExpertiseTag(tag)} 
                                  className="h-5 w-5 rounded-full hover:bg-accent flex items-center justify-center"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm py-1">No expertise tags added yet</span>
                          )}
                          <div className="flex gap-2">
                            <Input
                              value={newExpertise}
                              onChange={(e) => setNewExpertise(e.target.value)}
                              placeholder="Add a custom expertise tag"
                              className="flex-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addExpertiseTag();
                                }
                              }}
                            />
                            <Button 
                              type="button" 
                              variant="secondary" 
                              onClick={addExpertiseTag}
                            >
                              Add
                            </Button>
                          </div>
                          <div>
                            <FormLabel className="text-xs">Suggested Tags</FormLabel>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {expertiseOptions.map(option => (
                                <Badge 
                                  key={option}
                                  variant="outline"
                                  className={`cursor-pointer transition-colors hover:bg-secondary ${
                                    form.watch("expertise")?.includes(option) ? "bg-secondary" : ""
                                  }`}
                                  onClick={() => addPredefinedExpertise(option)}
                                >
                                  {option}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <FormDescription>
                          Add tags to highlight the member's areas of expertise
                        </FormDescription>
                      </FormItem>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="bio" className="space-y-6 pt-4">
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biography</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="A brief description of the member" 
                            className="min-h-[200px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Share relevant background, achievements, and expertise
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="social" className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="linkedin_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <Linkedin className="h-4 w-4" /> LinkedIn Profile
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://linkedin.com/in/username" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="twitter_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <Twitter className="h-4 w-4" /> Twitter/X Profile
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://twitter.com/username" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <Globe className="h-4 w-4" /> Website
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://example.com" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="bg-muted/30 p-4 rounded-md border">
                      <h4 className="text-sm font-medium mb-3">Preview</h4>
                      <div className="flex gap-3">
                        {form.watch('linkedin_url') && (
                          <a 
                            href={form.watch('linkedin_url')} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm hover:bg-blue-100"
                          >
                            <Linkedin className="h-4 w-4 mr-1.5" />
                            LinkedIn
                          </a>
                        )}
                        
                        {form.watch('twitter_url') && (
                          <a 
                            href={form.watch('twitter_url')} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-500 rounded-md text-sm hover:bg-blue-100"
                          >
                            <Twitter className="h-4 w-4 mr-1.5" />
                            Twitter
                          </a>
                        )}
                        
                        {form.watch('website_url') && (
                          <a 
                            href={form.watch('website_url')} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                          >
                            <Globe className="h-4 w-4 mr-1.5" />
                            Website
                          </a>
                        )}
                        
                        {!form.watch('linkedin_url') && !form.watch('twitter_url') && !form.watch('website_url') && (
                          <p className="text-muted-foreground text-sm">No social links added yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-8 border-t pt-4 flex justify-between items-center">
                <div className="flex gap-1 text-sm">
                  <span className="text-red-500">*</span>
                  <span className="text-muted-foreground">Required fields</span>
                </div>
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isAddingMember || isUpdatingMember || isUploading}
                  >
                    {(isAddingMember || isUpdatingMember || isUploading) ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></div>
                        {editingMember ? 'Saving...' : 'Adding...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {editingMember ? 'Update Member' : 'Add Member'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the member
              and remove their data from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={isDeletingMember}
            >
              {isDeletingMember ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>Delete</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPageTemplate>
  );
};

export default ManageImportantMembers;
