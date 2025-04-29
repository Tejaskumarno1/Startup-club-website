
import React, { useState, useEffect } from "react";
import { PageTemplate } from "@/components/common/PageTemplate";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SuccessStory } from "@/lib/types";
import { getFeaturedSuccessStories, getAllSuccessStories } from "@/lib/successStoriesHelpers";
import { useTheme } from "@/context/ThemeContext";

const SuccessStories = () => {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  
  useEffect(() => {
    fetchSuccessStories();
  }, []);
  
  const fetchSuccessStories = async () => {
    setIsLoading(true);
    try {
      // Try to use the helper function first
      const result = await getAllSuccessStories();
      
      if (result.success) {
        setStories(result.data);
      } else {
        // Error case, try direct query
        const { data, error } = await supabase
          .from('success_stories')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          setStories(data as SuccessStory[]);
        } else {
          // If we still don't have any data, use fallback data
          setStories(getFallbackStories());
        }
      }
    } catch (error) {
      console.error('Error fetching success stories:', error);
      toast({
        title: "Error",
        description: "Failed to load success stories. Using fallback data.",
        variant: "destructive",
      });
      
      setStories(getFallbackStories());
    } finally {
      setIsLoading(false);
    }
  };
  
  const getFallbackStories = (): SuccessStory[] => {
    return [
      {
        id: '1',
        company_name: 'TechFlow',
        founder: 'Sophia Lee',
        year: 2021,
        industry: 'SaaS',
        description: 'TechFlow started as a small project in our community and grew into a successful SaaS platform serving over 500 businesses worldwide.',
        achievements: ['Raised $2M in seed funding', 'Expanded to 15 employees', 'Featured in TechCrunch'],
        user_id: 'user1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        company_name: 'GreenGrow',
        founder: 'Marcus Johnson',
        year: 2020,
        industry: 'Agriculture',
        description: 'GreenGrow revolutionized urban farming with IoT-controlled vertical garden systems for homes and small businesses.',
        achievements: ['100,000+ units sold', 'Partnership with Home Depot', 'Reduced food waste by 30% for customers'],
        user_id: 'user2',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        company_name: 'FinEase',
        founder: 'Priya Sharma',
        year: 2019,
        industry: 'FinTech',
        description: 'FinEase created an accessible financial management platform for small businesses that has helped thousands of entrepreneurs.',
        achievements: ['Processed over $50M in transactions', 'Expanded to 3 countries', '95% customer retention rate'],
        user_id: 'user3',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  };
  
  return (
    <PageTemplate
      title="Success Stories"
      description="Read about successful startups that began in our community."
      icon={Trophy}
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <p className={`text-sm ${isDarkMode ? "text-gray-300" : ""}`}>Loading success stories...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <p className={`text-sm ${isDarkMode ? "text-gray-300" : ""}`}>No success stories found. Be the first to share your journey!</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {stories.map((story) => (
              <Card key={story.id} className={`overflow-hidden ${isDarkMode ? "bg-gray-800/50 border-gray-700" : ""}`}>
                <CardHeader className={`${isDarkMode ? "bg-gradient-to-r from-primary/20 to-transparent" : "bg-gradient-to-r from-primary/10 to-transparent"} p-4 sm:p-6`}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <CardTitle className={`text-lg sm:text-xl ${isDarkMode ? "text-white" : ""}`}>{story.company_name}</CardTitle>
                      <p className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                        Founded by {story.founder} in {story.year}
                      </p>
                    </div>
                    <div className={`${isDarkMode ? "bg-gray-700" : "bg-white"} px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium self-start`}>
                      {story.industry}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <p className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"} mb-4`}>{story.description}</p>
                  {story.achievements && story.achievements.length > 0 && (
                    <>
                      <h3 className={`font-medium mb-2 text-sm sm:text-base ${isDarkMode ? "text-white" : ""}`}>Key Achievements:</h3>
                      <ul className="space-y-1">
                        {story.achievements.map((achievement, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                            <span className="text-primary">•</span>
                            <span className={isDarkMode ? "text-gray-300" : ""}>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  <div className="mt-4 text-right">
                    <a href="#" className="text-primary hover:underline text-xs sm:text-sm">
                      Read full story
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className={`${isDarkMode ? "bg-gray-800/50 border border-gray-700" : "bg-white"} p-4 sm:p-6 rounded-lg shadow`}>
          <h2 className={`text-lg font-semibold mb-3 ${isDarkMode ? "text-white" : ""}`}>Share Your Success</h2>
          <p className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"} mb-4`}>
            Are you a member of our community with a success story to share? 
            We'd love to feature your journey and inspire others.
          </p>
          <div className="text-right">
            <a href="#" className="text-primary hover:underline text-xs sm:text-sm">
              Submit your story →
            </a>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};

export default SuccessStories;
