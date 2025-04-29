import React, { useState, useEffect } from "react";
import { MessageSquare, Search, RefreshCw, Trash2, PinIcon, Check, X, Edit, PlusCircle } from "lucide-react";
import { AdminPageTemplate } from "@/components/admin/AdminPageTemplate";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ForumTopic } from "@/lib/types";

interface ExtendedForumTopic extends ForumTopic {
  author_name?: string;
}

const ManageForums = () => {
  const [topics, setTopics] = useState<ExtendedForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<ExtendedForumTopic | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category_id: "",
    is_pinned: false
  });
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  
  const { toast } = useToast();

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const { data: topicsData, error: topicsError } = await supabase
        .from('forum_topics')
        .select(`
          id, 
          title, 
          content,
          category_id,
          is_pinned,
          is_locked,
          created_at,
          updated_at,
          user_id,
          view_count
        `)
        .order('created_at', { ascending: false });

      if (topicsError) {
        throw topicsError;
      }

      const { data: categoryData, error: categoryError } = await supabase
        .from('forum_categories')
        .select('id, name');
        
      if (categoryError) {
        console.error("Error fetching categories:", categoryError);
      } else {
        setCategories(categoryData || []);
      }

      const processedTopics: ExtendedForumTopic[] = [];
      
      for (const topic of topicsData || []) {
        let authorName = "Unknown User";
        
        if (topic.user_id) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', topic.user_id)
            .single();
            
          if (!userError && userData) {
            authorName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Unknown User';
          }
        }
        
        processedTopics.push({
          ...topic,
          author_name: authorName
        });
      }

      setTopics(processedTopics);
    } catch (error: any) {
      console.error("Error fetching forum topics:", error);
      toast({
        title: "Error",
        description: "Failed to load forum topics: " + error.message,
        variant: "destructive",
      });
      
      setTopics([
        {
          id: '1',
          title: 'Getting Started with Startup Funding',
          content: 'Discussion about early-stage funding options.',
          user_id: 'user1',
          author_name: 'John Smith',
          category_id: 'funding',
          created_at: '2023-06-15T10:30:00Z',
          updated_at: '2023-06-15T10:30:00Z',
          is_pinned: true,
          view_count: 100,
          replies_count: 24
        },
        {
          id: '2',
          title: 'Best Practices for Pitch Decks',
          content: 'Tips and templates for creating effective pitch decks.',
          user_id: 'user2',
          author_name: 'Emma Johnson',
          category_id: 'pitching',
          created_at: '2023-06-12T14:45:00Z',
          updated_at: '2023-06-12T14:45:00Z',
          is_pinned: false,
          view_count: 85,
          replies_count: 18
        },
        {
          id: '3',
          title: 'Legal Considerations for New Startups',
          content: 'Important legal aspects to consider when launching.',
          user_id: 'user3',
          author_name: 'David Williams',
          category_id: 'legal',
          created_at: '2023-06-10T09:15:00Z',
          updated_at: '2023-06-10T09:15:00Z',
          is_pinned: false,
          view_count: 120,
          replies_count: 32
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleDelete = async (topicId: string) => {
    if (window.confirm("Are you sure you want to delete this topic? This will also delete all replies.")) {
      try {
        const { error: repliesError } = await supabase
          .from('forum_replies')
          .delete()
          .eq('topic_id', topicId);

        if (repliesError) throw repliesError;
        
        const { error: topicError } = await supabase
          .from('forum_topics')
          .delete()
          .eq('id', topicId);

        if (topicError) throw topicError;
        
        setTopics(prev => prev.filter(topic => topic.id !== topicId));
        
        toast({
          title: "Success",
          description: "Forum topic deleted successfully.",
        });
      } catch (error: any) {
        console.error("Error deleting forum topic:", error);
        toast({
          title: "Error",
          description: "Failed to delete forum topic: " + error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleTogglePin = async (topicId: string, currentPinStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('forum_topics')
        .update({ is_pinned: !currentPinStatus })
        .eq('id', topicId);
      
      if (error) throw error;
      
      setTopics(prev => 
        prev.map(topic => 
          topic.id === topicId 
            ? { ...topic, is_pinned: !currentPinStatus } 
            : topic
        )
      );
      
      toast({
        title: "Success",
        description: `Topic ${!currentPinStatus ? 'pinned' : 'unpinned'} successfully.`,
      });
    } catch (error: any) {
      console.error("Error toggling pin status:", error);
      toast({
        title: "Error",
        description: "Failed to update topic pin status: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditTopic = (topic: ExtendedForumTopic) => {
    setCurrentTopic(topic);
    setFormData({
      title: topic.title,
      content: topic.content,
      category_id: topic.category_id,
      is_pinned: topic.is_pinned || false
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleAddNewTopic = () => {
    setCurrentTopic(null);
    setFormData({
      title: "",
      content: "",
      category_id: categories.length > 0 ? categories[0].id : "",
      is_pinned: false
    });
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSaveTopic = async () => {
    try {
      if (isEditMode && currentTopic) {
        const { error } = await supabase
          .from('forum_topics')
          .update({
            title: formData.title,
            content: formData.content,
            category_id: formData.category_id,
            is_pinned: formData.is_pinned,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentTopic.id);

        if (error) throw error;

        setTopics(prev => prev.map(topic => 
          topic.id === currentTopic.id
            ? { 
                ...topic, 
                title: formData.title,
                content: formData.content,
                category_id: formData.category_id,
                is_pinned: formData.is_pinned 
              }
            : topic
        ));

        toast({
          title: "Success",
          description: "Topic updated successfully.",
        });
      } else {
        const userId = "admin";
        const { data, error } = await supabase
          .from('forum_topics')
          .insert([
            {
              title: formData.title,
              content: formData.content,
              category_id: formData.category_id,
              is_pinned: formData.is_pinned,
              user_id: userId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              view_count: 0
            }
          ])
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          const newTopic: ExtendedForumTopic = {
            ...data[0],
            author_name: "Admin",
            replies_count: 0
          };
          
          setTopics(prev => [newTopic, ...prev]);
        }

        toast({
          title: "Success",
          description: "New topic created successfully.",
        });
      }

      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving topic:", error);
      toast({
        title: "Error",
        description: "Failed to save topic: " + error.message,
        variant: "destructive",
      });
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  const filteredTopics = topics.filter(topic => 
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getCategoryName(topic.category_id).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (topic.author_name && topic.author_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    fetchTopics();
  }, []);

  return (
    <AdminPageTemplate
      title="Manage Forums"
      description="Administer discussion forums and topics for the Startup Club."
      icon={MessageSquare}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search topics..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleAddNewTopic}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Topic
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchTopics}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Forum Topics</CardTitle>
          <CardDescription>
            Manage discussion topics and moderate content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery
                ? "No topics match your search"
                : "No topics available"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTopics.map((topic) => (
                  <TableRow key={topic.id}>
                    <TableCell className="font-medium">{topic.title}</TableCell>
                    <TableCell>{getCategoryName(topic.category_id)}</TableCell>
                    <TableCell>{topic.author_name || topic.user_id}</TableCell>
                    <TableCell>{topic.view_count || 0}</TableCell>
                    <TableCell>
                      {topic.is_pinned ? (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          <PinIcon className="h-3 w-3 mr-1" />
                          Pinned
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Normal
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTopic(topic)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={topic.is_pinned ? "outline" : "outline"}
                          size="sm"
                          onClick={() => handleTogglePin(topic.id, topic.is_pinned || false)}
                        >
                          {topic.is_pinned ? (
                            <X className="h-4 w-4" />
                          ) : (
                            <PinIcon className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(topic.id)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Topic" : "Create New Topic"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update the details of this forum topic" 
                : "Create a new discussion topic for the forum"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter topic title"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category_id">Category</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => setFormData({...formData, category_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                  {categories.length === 0 && (
                    <SelectItem value="default">Default Category</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Enter topic content or description"
                rows={5}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_pinned"
                name="is_pinned"
                checked={formData.is_pinned}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="is_pinned" className="text-sm font-normal">
                Pin this topic to the top of the forum
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTopic}>
              {isEditMode ? "Save Changes" : "Create Topic"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageTemplate>
  );
};

export default ManageForums;
