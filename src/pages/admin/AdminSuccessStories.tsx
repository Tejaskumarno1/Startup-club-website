
import React, { useState, useEffect } from "react";
import { Trophy, PlusCircle, Edit, Trash2, Search, X, ArrowUpDown, ChevronDown } from "lucide-react";
import { AdminPageTemplate } from "@/components/admin/AdminPageTemplate";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SuccessStory } from "@/lib/types";
import { createSuccessStory, deleteSuccessStory, updateSuccessStory } from "@/lib/successStoriesHelpers";
import { useAuth } from "@/context/AuthContext";

const AdminSuccessStories = () => {
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Form states for creating/editing
  const [formData, setFormData] = useState({
    company_name: "",
    founder: "",
    year: new Date().getFullYear(),
    industry: "",
    description: "",
    achievements: [""],
    featured: false,
    image_url: ""
  });

  useEffect(() => {
    fetchSuccessStories();
  }, []);

  useEffect(() => {
    if (selectedStory) {
      setFormData({
        company_name: selectedStory.company_name || "",
        founder: selectedStory.founder || "",
        year: selectedStory.year || new Date().getFullYear(),
        industry: selectedStory.industry || "",
        description: selectedStory.description || "",
        achievements: selectedStory.achievements || [""],
        featured: selectedStory.featured || false,
        image_url: selectedStory.image_url || ""
      });
    }
  }, [selectedStory]);

  const fetchSuccessStories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('success_stories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setStories(data as SuccessStory[]);
    } catch (error) {
      console.error('Error fetching success stories:', error);
      toast({
        title: "Failed to load success stories",
        description: "An error occurred while loading success stories.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      company_name: "",
      founder: "",
      year: new Date().getFullYear(),
      industry: "",
      description: "",
      achievements: [""],
      featured: false,
      image_url: ""
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAchievementChange = (index: number, value: string) => {
    const newAchievements = [...formData.achievements];
    newAchievements[index] = value;
    setFormData(prev => ({
      ...prev,
      achievements: newAchievements
    }));
  };

  const addAchievementField = () => {
    setFormData(prev => ({
      ...prev,
      achievements: [...prev.achievements, ""]
    }));
  };

  const removeAchievementField = (index: number) => {
    if (formData.achievements.length === 1) return;
    
    const newAchievements = [...formData.achievements];
    newAchievements.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      achievements: newAchievements
    }));
  };

  const toggleFeatured = () => {
    setFormData(prev => ({
      ...prev,
      featured: !prev.featured
    }));
  };

  const handleCreateStory = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a success story.",
        variant: "destructive",
      });
      return;
    }

    // Filter out empty achievements
    const filteredAchievements = formData.achievements.filter(item => item.trim() !== "");
    
    try {
      const storyData = {
        company_name: formData.company_name,
        founder: formData.founder,
        year: formData.year,
        industry: formData.industry,
        description: formData.description,
        achievements: filteredAchievements,
        featured: formData.featured,
        image_url: formData.image_url,
        user_id: user.id
      };
      
      const result = await createSuccessStory(storyData);
      
      if (!result.success) {
        throw new Error(result.error?.message || "Failed to create success story");
      }
      
      fetchSuccessStories();
      setIsAddDialogOpen(false);
      resetForm();
      
      toast({
        title: "Success story created",
        description: "The success story has been successfully created.",
      });
    } catch (error: any) {
      console.error('Error creating success story:', error);
      toast({
        title: "Failed to create success story",
        description: error.message || "An error occurred while creating the success story.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStory = async () => {
    if (!selectedStory) return;

    // Filter out empty achievements
    const filteredAchievements = formData.achievements.filter(item => item.trim() !== "");
    
    try {
      // Include created_at from the selectedStory to fix the type error
      const updates: SuccessStory = {
        id: selectedStory.id,
        company_name: formData.company_name,
        founder: formData.founder,
        year: formData.year,
        industry: formData.industry,
        description: formData.description,
        achievements: filteredAchievements,
        featured: formData.featured,
        image_url: formData.image_url,
        user_id: selectedStory.user_id,
        created_at: selectedStory.created_at, // Include the required created_at property
        updated_at: new Date().toISOString()
      };
      
      const result = await updateSuccessStory(updates);
      
      if (!result.success) {
        throw new Error(result.error?.message || "Failed to update success story");
      }
      
      fetchSuccessStories();
      setIsEditDialogOpen(false);
      setSelectedStory(null);
      
      toast({
        title: "Success story updated",
        description: "The success story has been successfully updated.",
      });
    } catch (error: any) {
      console.error('Error updating success story:', error);
      toast({
        title: "Failed to update success story",
        description: error.message || "An error occurred while updating the success story.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStory = async (id: string) => {
    try {
      const result = await deleteSuccessStory(id);
      
      if (!result.success) {
        throw new Error(result.error?.message || "Failed to delete success story");
      }
      
      fetchSuccessStories();
      
      toast({
        title: "Success story deleted",
        description: "The success story has been successfully deleted.",
      });
    } catch (error: any) {
      console.error('Error deleting success story:', error);
      toast({
        title: "Failed to delete success story",
        description: error.message || "An error occurred while deleting the success story.",
        variant: "destructive",
      });
    }
  };

  const filteredStories = stories.filter(story => {
    const searchLower = searchTerm.toLowerCase();
    return (
      story.company_name.toLowerCase().includes(searchLower) ||
      story.founder.toLowerCase().includes(searchLower) ||
      story.industry?.toLowerCase().includes(searchLower) ||
      story.description.toLowerCase().includes(searchLower)
    );
  });

  const editStory = (story: SuccessStory) => {
    setSelectedStory(story);
    setIsEditDialogOpen(true);
  };

  return (
    <AdminPageTemplate
      title="Success Stories"
      description="Manage success stories and testimonials from your community members"
      icon={Trophy}
    >
      <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="w-full sm:w-auto flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search success stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              className="absolute right-0 top-1/2 transform -translate-y-1/2 h-full aspect-square rounded-l-none"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto" onClick={resetForm}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Success Story
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Success Story</DialogTitle>
              <DialogDescription>
                Share inspiring stories of startups that began in your community.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name*</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    placeholder="e.g., TechFlow"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="founder">Founder Name*</Label>
                  <Input
                    id="founder"
                    name="founder"
                    value={formData.founder}
                    onChange={handleInputChange}
                    placeholder="e.g., Jane Doe"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Founding Year</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleInputChange}
                    min={1900}
                    max={new Date().getFullYear()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    placeholder="e.g., SaaS, FinTech"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description*</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Share the story of how this startup began and grew..."
                  rows={4}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Key Achievements</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addAchievementField}
                  >
                    <PlusCircle className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                
                {formData.achievements.map((achievement, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={achievement}
                      onChange={(e) => handleAchievementChange(index, e.target.value)}
                      placeholder={`Achievement ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAchievementField(index)}
                      disabled={formData.achievements.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={toggleFeatured}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="featured" className="text-sm font-medium">
                  Featured Story (will be highlighted on the main success stories page)
                </label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateStory}
                disabled={!formData.company_name || !formData.founder || !formData.description}
              >
                Create Story
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Success Story</DialogTitle>
              <DialogDescription>
                Update the details of this success story.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_company_name">Company Name*</Label>
                  <Input
                    id="edit_company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_founder">Founder Name*</Label>
                  <Input
                    id="edit_founder"
                    name="founder"
                    value={formData.founder}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_year">Founding Year</Label>
                  <Input
                    id="edit_year"
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleInputChange}
                    min={1900}
                    max={new Date().getFullYear()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_industry">Industry</Label>
                  <Input
                    id="edit_industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_image_url">Image URL</Label>
                <Input
                  id="edit_image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_description">Description*</Label>
                <Textarea
                  id="edit_description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Key Achievements</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addAchievementField}
                  >
                    <PlusCircle className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                
                {formData.achievements.map((achievement, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={achievement}
                      onChange={(e) => handleAchievementChange(index, e.target.value)}
                      placeholder={`Achievement ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAchievementField(index)}
                      disabled={formData.achievements.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_featured"
                  checked={formData.featured}
                  onChange={toggleFeatured}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="edit_featured" className="text-sm font-medium">
                  Featured Story (will be highlighted on the main success stories page)
                </label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedStory(null);
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateStory}
                disabled={!formData.company_name || !formData.founder || !formData.description}
              >
                Update Story
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : filteredStories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No success stories found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? "No success stories match your search criteria." : "Start by adding your first success story."}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Success Story
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="border-b px-6 py-4">
            <CardTitle>Success Stories ({filteredStories.length})</CardTitle>
            <CardDescription>
              List of success stories from community members
            </CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-44">Company</TableHead>
                  <TableHead>Founder</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead className="text-center">Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStories.map((story) => (
                  <TableRow key={story.id}>
                    <TableCell className="font-medium">{story.company_name}</TableCell>
                    <TableCell>{story.founder}</TableCell>
                    <TableCell>{story.year}</TableCell>
                    <TableCell>{story.industry || "-"}</TableCell>
                    <TableCell className="text-center">
                      {story.featured ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          Featured
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => editStory(story)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the success story for {story.company_name}. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteStory(story.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <CardFooter className="border-t py-4 px-6">
            <div className="text-sm text-muted-foreground">
              Showing {filteredStories.length} of {stories.length} success stories
            </div>
          </CardFooter>
        </Card>
      )}
    </AdminPageTemplate>
  );
};

export default AdminSuccessStories;
