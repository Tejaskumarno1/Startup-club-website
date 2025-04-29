import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { 
  MessageSquare, 
  Users, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  Pin, 
  Lock
} from "lucide-react";
import { ForumCategory, ForumTopic } from "@/lib/types";
import { getForumCategories, getForumTopics } from "@/lib/adminHelpers";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const DiscussionForums = () => {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("replies");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...topics];
    
    if (selectedCategory) {
      filtered = filtered.filter((topic) => topic.category_id === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (topic) =>
          topic.title.toLowerCase().includes(query) ||
          topic.content.toLowerCase().includes(query)
      );
    }
    
    if (activeTab === "pinned") {
      filtered = filtered.filter((topic) => topic.is_pinned);
    } else if (activeTab === "recent") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (activeTab === "popular") {
      filtered.sort((a, b) => (b.replies_count || 0) - (a.replies_count || 0));
    }
    
    setFilteredTopics(filtered);
  }, [topics, selectedCategory, searchQuery, activeTab, sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const categoriesResult = await getForumCategories();
      if (!categoriesResult.success) {
        throw new Error(categoriesResult.error?.message || "Failed to fetch categories");
      }
      setCategories(categoriesResult.data || []);
      
      const topicsResult = await getForumTopics();
      if (!topicsResult.success) {
        throw new Error(topicsResult.error?.message || "Failed to fetch topics");
      }
      
      const topicsWithStats = (topicsResult.data || []).map(topic => ({
        ...topic,
        view_count: topic.view_count || Math.floor(Math.random() * 200),
        replies_count: Math.floor(Math.random() * 20)
      }));
      
      setTopics(topicsWithStats);
      setFilteredTopics(topicsWithStats);
    } catch (error: any) {
      console.error("Error fetching forum data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch forum data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  const handleCreateTopic = () => {
    navigate("/community/forums/create");
  };

  const handleTopicClick = (topicId: string) => {
    navigate(`/community/forums/topic/${topicId}`);
  };

  const sampleMockTopics = () => {
    if (topics.length === 0 && !loading) {
      const mockTopics = [
        {
          id: "1",
          category_id: "1",
          user_id: "user1",
          title: "How to secure seed funding for my startup?",
          content: "I'm looking for advice on how to approach investors for my tech startup...",
          is_pinned: true,
          is_locked: false,
          view_count: 156,
          replies_count: 12,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "2",
          category_id: "2",
          user_id: "user2",
          title: "Best methods for customer acquisition in B2B SaaS",
          content: "What are the most effective strategies you've used for acquiring B2B customers?",
          is_pinned: false,
          is_locked: false,
          view_count: 89,
          replies_count: 7,
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: "3",
          category_id: "3",
          user_id: "user3",
          title: "Legal considerations when starting a marketplace platform",
          content: "I'm building a two-sided marketplace and need advice on the legal aspects...",
          is_pinned: false,
          is_locked: true,
          view_count: 64,
          replies_count: 5,
          created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
          updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        }
      ];
      
      return mockTopics;
    }
    return [];
  };

  const displayTopics = filteredTopics.length ? filteredTopics : sampleMockTopics();

  const sortedTopics = topics.sort((a, b) => {
    if (sortBy === "replies") {
      return (b.replies_count || 0) - (a.replies_count || 0);
    }
    return 0;
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <PageHeader
          title="Discussion Forums"
          description="Join the conversation, ask questions, and share knowledge with other entrepreneurs and startup founders."
          icon={MessageSquare}
        />
        
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <Button onClick={handleCreateTopic} className="w-full md:w-auto shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Create Topic
          </Button>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="all">All Topics</TabsTrigger>
            <TabsTrigger value="pinned">Pinned</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : displayTopics.length === 0 ? (
              <Card className="border shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No topics found</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    {searchQuery || selectedCategory
                      ? "No topics match your current filters. Try adjusting your search."
                      : "There are no discussion topics yet. Be the first to start a conversation!"}
                  </p>
                  <Button onClick={handleCreateTopic}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Topic
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sortedTopics.map((topic) => (
                  <Card
                    key={topic.id}
                    className={`hover:shadow transition-shadow cursor-pointer ${
                      topic.is_pinned ? "border-primary/20 bg-primary/5" : "border"
                    }`}
                    onClick={() => handleTopicClick(topic.id)}
                  >
                    <CardContent className="p-0">
                      <div className="p-4 flex flex-col md:flex-row gap-4 items-start">
                        <div className="hidden md:block">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://avatar.vercel.sh/${topic.user_id}?size=40`} alt="User" />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold line-clamp-1">{topic.title}</h3>
                            <div className="flex gap-1">
                              {topic.is_pinned && (
                                <Badge variant="outline" className="flex items-center gap-1 bg-primary/10 text-primary">
                                  <Pin className="h-3 w-3" />
                                  <span>Pinned</span>
                                </Badge>
                              )}
                              {topic.is_locked && (
                                <Badge variant="outline" className="flex items-center gap-1 bg-muted">
                                  <Lock className="h-3 w-3" />
                                  <span>Locked</span>
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <Badge className="mt-1 mb-2" variant="secondary">
                            {getCategoryName(topic.category_id)}
                          </Badge>
                          
                          <p className="text-muted-foreground line-clamp-2 text-sm">{topic.content}</p>
                          
                          <div className="mt-3 flex items-center text-sm text-muted-foreground gap-4">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{format(parseISO(topic.created_at), "MMM d, yyyy")}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              <span>{topic.view_count} views</span>
                            </div>
                            <div className="flex items-center">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              <span>{topic.replies_count} replies</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pinned" className="mt-0">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : displayTopics.filter(topic => topic.is_pinned).length === 0 ? (
              <Card className="border shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Pin className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No pinned topics found</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    There are no pinned discussion topics in this forum. Pinned topics are highlighted for important announcements or discussions.
                  </p>
                  <Button onClick={handleCreateTopic}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Topic
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {displayTopics.filter(topic => topic.is_pinned).map((topic) => (
                  <Card
                    key={topic.id}
                    className={`hover:shadow transition-shadow cursor-pointer border-primary/20 bg-primary/5`}
                    onClick={() => handleTopicClick(topic.id)}
                  >
                    <CardContent className="p-0">
                      <div className="p-4 flex flex-col md:flex-row gap-4 items-start">
                        <div className="hidden md:block">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://avatar.vercel.sh/${topic.user_id}?size=40`} alt="User" />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold line-clamp-1">{topic.title}</h3>
                            <div className="flex gap-1">
                              <Badge variant="outline" className="flex items-center gap-1 bg-primary/10 text-primary">
                                <Pin className="h-3 w-3" />
                                <span>Pinned</span>
                              </Badge>
                              {topic.is_locked && (
                                <Badge variant="outline" className="flex items-center gap-1 bg-muted">
                                  <Lock className="h-3 w-3" />
                                  <span>Locked</span>
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <Badge className="mt-1 mb-2" variant="secondary">
                            {getCategoryName(topic.category_id)}
                          </Badge>
                          
                          <p className="text-muted-foreground line-clamp-2 text-sm">{topic.content}</p>
                          
                          <div className="mt-3 flex items-center text-sm text-muted-foreground gap-4">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{format(parseISO(topic.created_at), "MMM d, yyyy")}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              <span>{topic.view_count} views</span>
                            </div>
                            <div className="flex items-center">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              <span>{topic.replies_count} replies</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recent" className="mt-0">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : displayTopics.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).length === 0 ? (
              <Card className="border shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No recent topics found</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    There are no recently created discussion topics. Start a new topic to begin the conversation!
                  </p>
                  <Button onClick={handleCreateTopic}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Topic
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {displayTopics.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((topic) => (
                  <Card
                    key={topic.id}
                    className={`hover:shadow transition-shadow cursor-pointer ${
                      topic.is_pinned ? "border-primary/20 bg-primary/5" : "border"
                    }`}
                    onClick={() => handleTopicClick(topic.id)}
                  >
                    <CardContent className="p-0">
                      <div className="p-4 flex flex-col md:flex-row gap-4 items-start">
                        <div className="hidden md:block">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://avatar.vercel.sh/${topic.user_id}?size=40`} alt="User" />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold line-clamp-1">{topic.title}</h3>
                            <div className="flex gap-1">
                              {topic.is_pinned && (
                                <Badge variant="outline" className="flex items-center gap-1 bg-primary/10 text-primary">
                                  <Pin className="h-3 w-3" />
                                  <span>Pinned</span>
                                </Badge>
                              )}
                              {topic.is_locked && (
                                <Badge variant="outline" className="flex items-center gap-1 bg-muted">
                                  <Lock className="h-3 w-3" />
                                  <span>Locked</span>
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <Badge className="mt-1 mb-2" variant="secondary">
                            {getCategoryName(topic.category_id)}
                          </Badge>
                          
                          <p className="text-muted-foreground line-clamp-2 text-sm">{topic.content}</p>
                          
                          <div className="mt-3 flex items-center text-sm text-muted-foreground gap-4">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{format(parseISO(topic.created_at), "MMM d, yyyy")}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              <span>{topic.view_count} views</span>
                            </div>
                            <div className="flex items-center">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              <span>{topic.replies_count} replies</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="popular" className="mt-0">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : displayTopics.slice().sort((a, b) => (b.replies_count || 0) - (a.replies_count || 0)).length === 0 ? (
              <Card className="border shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No popular topics found</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    There are no popular discussion topics based on views and replies. Engage in discussions to make topics more popular!
                  </p>
                  <Button onClick={handleCreateTopic}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Topic
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {displayTopics.slice().sort((a, b) => (b.replies_count || 0) - (a.replies_count || 0)).map((topic) => (
                  <Card
                    key={topic.id}
                    className={`hover:shadow transition-shadow cursor-pointer ${
                      topic.is_pinned ? "border-primary/20 bg-primary/5" : "border"
                    }`}
                    onClick={() => handleTopicClick(topic.id)}
                  >
                    <CardContent className="p-0">
                      <div className="p-4 flex flex-col md:flex-row gap-4 items-start">
                        <div className="hidden md:block">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://avatar.vercel.sh/${topic.user_id}?size=40`} alt="User" />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold line-clamp-1">{topic.title}</h3>
                            <div className="flex gap-1">
                              {topic.is_pinned && (
                                <Badge variant="outline" className="flex items-center gap-1 bg-primary/10 text-primary">
                                  <Pin className="h-3 w-3" />
                                  <span>Pinned</span>
                                </Badge>
                              )}
                              {topic.is_locked && (
                                <Badge variant="outline" className="flex items-center gap-1 bg-muted">
                                  <Lock className="h-3 w-3" />
                                  <span>Locked</span>
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <Badge className="mt-1 mb-2" variant="secondary">
                            {getCategoryName(topic.category_id)}
                          </Badge>
                          
                          <p className="text-muted-foreground line-clamp-2 text-sm">{topic.content}</p>
                          
                          <div className="mt-3 flex items-center text-sm text-muted-foreground gap-4">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{format(parseISO(topic.created_at), "MMM d, yyyy")}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              <span>{topic.view_count} views</span>
                            </div>
                            <div className="flex items-center">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              <span>{topic.replies_count} replies</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default DiscussionForums;
