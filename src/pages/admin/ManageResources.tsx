
import React, { useState, useEffect } from "react";
import { BookText, Search, Edit, Trash2, PlusCircle, FolderPlus } from "lucide-react";
import { AdminPageTemplate } from "@/components/admin/AdminPageTemplate";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface ResourceItem {
  id: string;
  title: string;
  type: string; // This will be a display value, not stored directly in DB
  category_id: string;
  category_name?: string; // For display purposes
  description?: string;
  attachment_url?: string;
  content?: string;
  view_count: number;
  created_at: string;
}

// Define our schema based on the actual database structure
const resourceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  type: z.string(), // We'll convert this to appropriate fields in the database
  category_id: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  attachment_url: z.string().optional(),
  content: z.string().optional(),
});

type ResourceFormValues = z.infer<typeof resourceSchema>;

const ManageResources = () => {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentResource, setCurrentResource] = useState<ResourceItem | null>(null);
  const [categories, setCategories] = useState<{id: string, name: string, type: string}[]>([]);
  const { toast } = useToast();

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: "",
      type: "guide",
      category_id: "",
      description: "",
      attachment_url: "",
      content: "",
    },
  });

  const fetchResources = async () => {
    setLoading(true);
    try {
      // First, fetch categories
      const { data: categoryData, error: categoryError } = await supabase
        .from("resource_categories")
        .select("*");

      if (categoryError) {
        console.error("Error fetching resource categories:", categoryError);
      } else {
        setCategories(categoryData as {id: string, name: string, type: string}[] || []);
      }

      // Now fetch resources
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Map DB data to our ResourceItem interface
      const processedResources = data.map(item => {
        // Find the category to get its type and name
        const category = categoryData?.find(cat => cat.id === item.category_id);
        
        return {
          id: item.id,
          title: item.title,
          type: category?.type || "guide", // Default to guide if category not found
          category_id: item.category_id,
          category_name: category?.name || "Unknown", 
          description: item.description,
          attachment_url: item.attachment_url,
          content: item.content,
          view_count: item.view_count || 0,
          created_at: item.created_at
        } as ResourceItem;
      });

      setResources(processedResources);
    } catch (error: any) {
      console.error("Error fetching resources:", error);
      toast({
        title: "Error",
        description: "Failed to load resources. " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleDelete = async (resourceId: string) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      try {
        const { error } = await supabase
          .from("resources")
          .delete()
          .eq("id", resourceId);

        if (error) {
          throw error;
        }
        
        setResources(prev => prev.filter(resource => resource.id !== resourceId));
        
        toast({
          title: "Success",
          description: "Resource deleted successfully.",
        });
      } catch (error: any) {
        console.error("Error deleting resource:", error);
        toast({
          title: "Error",
          description: "Failed to delete resource. " + error.message,
          variant: "destructive",
        });
      }
    }
  };

  const openAddDialog = () => {
    form.reset({
      title: "",
      type: "guide",
      category_id: categories.length > 0 ? categories[0].id : "",
      description: "",
      attachment_url: "",
      content: "",
    });
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (resource: ResourceItem) => {
    setCurrentResource(resource);
    form.reset({
      title: resource.title,
      type: resource.type,
      category_id: resource.category_id,
      description: resource.description || "",
      attachment_url: resource.attachment_url || "",
      content: resource.content || "",
    });
    setIsEditDialogOpen(true);
  };

  const onSubmit = async (values: ResourceFormValues) => {
    try {
      if (isEditDialogOpen && currentResource) {
        // Update existing resource
        const { error } = await supabase
          .from("resources")
          .update({
            title: values.title,
            category_id: values.category_id,
            description: values.description,
            attachment_url: values.attachment_url,
            content: values.content,
            updated_at: new Date().toISOString()
          })
          .eq("id", currentResource.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Resource updated successfully.",
        });
        
        setIsEditDialogOpen(false);
      } else {
        // Add new resource
        const { data, error } = await supabase
          .from("resources")
          .insert([
            {
              title: values.title,
              category_id: values.category_id,
              description: values.description,
              attachment_url: values.attachment_url,
              content: values.content,
              view_count: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
          .select();

        if (error) throw error;

        toast({
          title: "Success",
          description: "Resource added successfully.",
        });
        
        setIsAddDialogOpen(false);
      }
      
      // Refresh the resource list
      fetchResources();
    } catch (error: any) {
      console.error("Error saving resource:", error);
      toast({
        title: "Error",
        description: "Failed to save resource. " + error.message,
        variant: "destructive",
      });
    }
  };

  const openAddCategoryDialog = () => {
    // This would typically open a dialog to add a new category
    // For simplicity, just prompt for a new category name and type
    const categoryName = prompt("Enter new category name:");
    if (categoryName && categoryName.trim() !== "") {
      const categoryType = prompt("Enter category type (guide, template, funding, legal):", "guide");
      const validType = ["guide", "template", "funding", "legal"].includes(categoryType || "") 
        ? categoryType 
        : "guide";
      
      // Add the category to the database
      supabase
        .from("resource_categories")
        .insert([{ 
          name: categoryName.trim(), 
          type: validType,
          created_at: new Date().toISOString()
        }])
        .then(({ error }) => {
          if (error) {
            console.error("Error creating category:", error);
            toast({
              title: "Error",
              description: "Failed to create category: " + error.message,
              variant: "destructive",
            });
          } else {
            // Refresh categories
            fetchResources();
            toast({
              title: "Success",
              description: "Category added successfully.",
            });
          }
        });
    }
  };

  const getCategoriesForType = (type: string) => {
    if (type === "all") return categories;
    return categories.filter(cat => cat.type === type);
  };

  const filteredResources = resources
    .filter(resource => 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.category_name && resource.category_name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(resource => 
      activeTab === "all" || resource.type === activeTab
    );

  return (
    <AdminPageTemplate
      title="Manage Resources"
      description="Administer resources, guides, templates and more for the Startup Club."
      icon={BookText}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="default" onClick={openAddDialog}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
          <Button variant="outline" onClick={openAddCategoryDialog}>
            <FolderPlus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>
            Manage guides, templates, funding sources and legal resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="guide">Guides</TabsTrigger>
              <TabsTrigger value="template">Templates</TabsTrigger>
              <TabsTrigger value="funding">Funding</TabsTrigger>
              <TabsTrigger value="legal">Legal</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {loading ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || activeTab !== "all"
                ? "No resources match your criteria"
                : "No resources available"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell className="font-medium">{resource.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {resource.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{resource.category_name}</TableCell>
                    <TableCell>{resource.view_count}</TableCell>
                    <TableCell>{new Date(resource.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(resource)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(resource.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Resource Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Resource</DialogTitle>
            <DialogDescription>
              Create a new resource for startup club members
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Reset category when type changes
                          const categoriesForType = getCategoriesForType(value);
                          if (categoriesForType.length > 0) {
                            form.setValue("category_id", categoriesForType[0].id);
                          }
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="guide">Guide</SelectItem>
                          <SelectItem value="template">Template</SelectItem>
                          <SelectItem value="funding">Funding</SelectItem>
                          <SelectItem value="legal">Legal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getCategoriesForType(form.getValues("type")).map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                          {categories.length === 0 && (
                            <SelectItem value="default">Default Category</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe this resource..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="attachment_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resource URL</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="https://example.com/resource.pdf"
                      />
                    </FormControl>
                    <FormDescription>
                      URL to the resource file or external link
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Enter content or notes for the resource..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Resource</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Resource Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
            <DialogDescription>
              Update the details of this resource
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Reset category when type changes
                          const categoriesForType = getCategoriesForType(value);
                          if (categoriesForType.length > 0) {
                            form.setValue("category_id", categoriesForType[0].id);
                          }
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="guide">Guide</SelectItem>
                          <SelectItem value="template">Template</SelectItem>
                          <SelectItem value="funding">Funding</SelectItem>
                          <SelectItem value="legal">Legal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getCategoriesForType(form.getValues("type")).map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                          {categories.length === 0 && (
                            <SelectItem value="default">Default Category</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe this resource..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="attachment_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resource URL</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="https://example.com/resource.pdf"
                      />
                    </FormControl>
                    <FormDescription>
                      URL to the resource file or external link
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Enter content or notes for the resource..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminPageTemplate>
  );
};

export default ManageResources;
