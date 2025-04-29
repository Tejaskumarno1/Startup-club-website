import React, { useState, useEffect } from "react";
import { AdminPageTemplate } from "@/components/admin/AdminPageTemplate";
import { Trophy, PlusCircle, Pencil, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SuccessStory } from "@/lib/types";
import {
  getAllSuccessStories,
  createSuccessStory,
  updateSuccessStory,
  deleteSuccessStory
} from "@/lib/successStoriesHelpers";
import { useAuth } from "@/context/AuthContext";

const successStorySchema = z.object({
  id: z.string().optional(),
  company_name: z.string().min(1, "Company name is required"),
  founder: z.string().min(1, "Founder name is required"),
  year: z.coerce.number().int().positive("Year must be a positive number").optional(),
  industry: z.string().min(1, "Industry is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  featured: z.boolean().default(false),
  image_url: z.string().optional().nullable(),
  achievements: z.array(z.string()).optional(),
});

type SuccessStoryFormData = z.infer<typeof successStorySchema>;

const ManageSuccessStories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    console.log("Current auth state:", user ? "Authenticated" : "Not authenticated");
    if (user) {
      console.log("User ID:", user.id);
    }
  }, [user]);

  const { data: successStoriesResponse, isLoading, error: fetchError, refetch } = useQuery({
    queryKey: ["success-stories"],
    queryFn: () => getAllSuccessStories(),
    meta: {
      onSuccess: (data) => {
        console.log("Success stories query successful:", data);
        if (!data.success) {
          console.error("API returned success: false", data.error);
        }
      },
      onError: (error) => {
        console.error("Error fetching success stories:", error);
      }
    }
  });

  useEffect(() => {
    if (successStoriesResponse) {
      setDebugInfo(`Query returned: success=${successStoriesResponse.success}, 
                   data=${successStoriesResponse.data ? 
                   `${successStoriesResponse.data.length} stories` : 'null or undefined'}`);
    } else {
      setDebugInfo("Query response is undefined");
    }
  }, [successStoriesResponse]);

  const form = useForm<SuccessStoryFormData>({
    resolver: zodResolver(successStorySchema),
    defaultValues: {
      company_name: "",
      founder: "",
      year: new Date().getFullYear(),
      industry: "",
      description: "",
      featured: false,
      image_url: "",
      achievements: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: SuccessStoryFormData) => {
      const storyData = {
        ...data,
        ...(user && { user_id: user.id }),
      };
      
      console.log("Creating success story with data:", storyData);
      return createSuccessStory(storyData);
    },
    onSuccess: (response) => {
      if (!response.success) {
        setApiError(response.error?.message || "Failed to create success story");
        return;
      }
      
      queryClient.invalidateQueries({ queryKey: ["success-stories"] });
      refetch();
      
      toast({
        title: "Success Story Created",
        description: "The success story was created successfully.",
      });
      setApiError(null);
      handleCloseDialog();
    },
    onError: (error: any) => {
      console.error("Error in create mutation:", error);
      setApiError(error.message || "Failed to create success story");
      toast({
        title: "Error",
        description: error.message || "Failed to create success story.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: SuccessStoryFormData) => {
      if (!selectedStory) {
        throw new Error("No story selected for update");
      }
      
      const storyToUpdate = {
        ...selectedStory,
        ...data,
      };
      
      console.log("Updating success story with data:", storyToUpdate);
      return updateSuccessStory(storyToUpdate as SuccessStory);
    },
    onSuccess: (response) => {
      if (!response.success) {
        setApiError(response.error?.message || "Failed to update success story");
        return;
      }
      
      queryClient.invalidateQueries({ queryKey: ["success-stories"] });
      refetch();
      
      toast({
        title: "Success Story Updated",
        description: "The success story was updated successfully.",
      });
      setApiError(null);
      handleCloseDialog();
    },
    onError: (error: any) => {
      console.error("Error in update mutation:", error);
      setApiError(error.message || "Failed to update success story");
      toast({
        title: "Error",
        description: error.message || "Failed to update success story.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      console.log("Deleting success story with ID:", id);
      return deleteSuccessStory(id);
    },
    onSuccess: (response) => {
      if (!response.success) {
        setApiError(response.error?.message || "Failed to delete success story");
        return;
      }
      
      queryClient.invalidateQueries({ queryKey: ["success-stories"] });
      refetch();
      
      toast({
        title: "Success Story Deleted",
        description: "The success story was deleted successfully.",
      });
      setApiError(null);
      setIsConfirmDeleteOpen(false);
    },
    onError: (error: any) => {
      console.error("Error in delete mutation:", error);
      setApiError(error.message || "Failed to delete success story");
      toast({
        title: "Error",
        description: error.message || "Failed to delete success story.",
        variant: "destructive",
      });
    },
  });

  const addTestStory = async () => {
    const testStory = {
      company_name: "Test Company",
      founder: "Test Founder",
      year: 2023,
      industry: "Test Industry",
      description: "This is a test success story for debugging purposes.",
      featured: false,
      image_url: null,
      achievements: ["Test Achievement 1", "Test Achievement 2"]
    };

    try {
      console.log("Creating test story:", testStory);
      const result = await createSuccessStory(testStory);
      
      if (result.success) {
        console.log("Test story created successfully:", result.data);
        toast({
          title: "Test Story Created",
          description: "A test success story was created successfully.",
        });
        refetch();
      } else {
        console.error("Failed to create test story:", result.error);
        toast({
          title: "Error",
          description: result.error?.message || "Failed to create test story.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error creating test story:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleOpenDialog = (story?: SuccessStory) => {
    setApiError(null);
    
    if (story) {
      console.log("Opening dialog to edit story:", story);
      setSelectedStory(story);
      form.reset({
        id: story.id,
        company_name: story.company_name,
        founder: story.founder,
        year: story.year || new Date().getFullYear(),
        industry: story.industry || "",
        description: story.description,
        featured: story.featured || false,
        image_url: story.image_url || "",
        achievements: story.achievements || [],
      });
    } else {
      console.log("Opening dialog to create new story");
      setSelectedStory(null);
      form.reset({
        company_name: "",
        founder: "",
        year: new Date().getFullYear(),
        industry: "",
        description: "",
        featured: false,
        image_url: "",
        achievements: [],
      });
    }
    
    setIsOpen(true);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setSelectedStory(null);
    setApiError(null);
    form.reset();
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsConfirmDeleteOpen(true);
    setApiError(null);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const onSubmit = (data: SuccessStoryFormData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to perform this action.",
        variant: "destructive",
      });
      return;
    }

    setApiError(null);
    
    if (selectedStory) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (fetchError) {
    return (
      <AdminPageTemplate
        title="Manage Success Stories"
        description="Create, edit, and manage success stories featured on the homepage"
        icon={Trophy}
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load success stories. Please try again later.
          </AlertDescription>
        </Alert>
      </AdminPageTemplate>
    );
  }

  return (
    <AdminPageTemplate
      title="Manage Success Stories"
      description="Create, edit, and manage success stories featured on the homepage"
      icon={Trophy}
    >
      <div className="space-y-6">
        {debugInfo && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Debug Info</AlertTitle>
            <AlertDescription className="whitespace-pre-line">{debugInfo}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Success Stories</h2>
          <div className="flex space-x-2">
            <Button 
              onClick={() => handleOpenDialog()}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Success Story
            </Button>
            {process.env.NODE_ENV !== 'production' && (
              <Button 
                variant="outline"
                onClick={addTestStory}
              >
                Add Test Story
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={() => refetch()}
            >
              Refresh Data
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <p>Loading success stories...</p>
          </div>
        ) : (
          <>
            {successStoriesResponse?.success === false && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {successStoriesResponse.error?.message || "Failed to fetch success stories"}
                </AlertDescription>
              </Alert>
            )}
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Founder</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead className="w-24 text-center">Featured</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {successStoriesResponse?.success && successStoriesResponse.data && successStoriesResponse.data.length > 0 ? (
                  successStoriesResponse.data.map((story) => (
                    <TableRow key={story.id}>
                      <TableCell className="font-medium">{story.company_name}</TableCell>
                      <TableCell>{story.founder}</TableCell>
                      <TableCell>{story.year}</TableCell>
                      <TableCell>{story.industry}</TableCell>
                      <TableCell className="text-center">
                        {story.featured && <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleOpenDialog(story)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(story.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No success stories found. Add a new success story to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedStory ? "Edit Success Story" : "Add New Success Story"}
            </DialogTitle>
          </DialogHeader>
          
          {apiError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="founder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Founder*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="2000"
                          max={new Date().getFullYear()}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="https://example.com/image.jpg" 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description*</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        {...field}
                        placeholder="Describe the success story..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Feature on Homepage</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Display this success story in the featured section of the homepage.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || 
                    updateMutation.isPending || 
                    !user ||
                    !form.formState.isValid
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : selectedStory
                    ? "Update"
                    : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete this success story? This action cannot be undone.
          </p>
          {apiError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageTemplate>
  );
};

export default ManageSuccessStories;
