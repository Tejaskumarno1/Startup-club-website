
import React, { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { ExternalLink } from "lucide-react";
import { getFeaturedSuccessStories } from "@/lib/successStoriesHelpers";
import { SuccessStory } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export const Testimonials = () => {
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadSuccessStories() {
      try {
        const result = await getFeaturedSuccessStories(3);
        if (result.success && result.data.length > 0) {
          setSuccessStories(result.data);
        } else {
          // Only show toast if there are no success stories
          if (!result.success) {
            toast({
              title: "Couldn't load success stories",
              description: "Please check the admin dashboard to add success stories",
              variant: "destructive",
            });
          }
          // Use fallback data only if we couldn't fetch any stories
          setSuccessStories(getFallbackStories());
        }
      } catch (error) {
        console.error("Error loading success stories:", error);
        toast({
          title: "Error loading success stories",
          description: "Please try again later",
          variant: "destructive",
        });
        setSuccessStories(getFallbackStories());
      } finally {
        setIsLoading(false);
      }
    }

    loadSuccessStories();
  }, [toast]);

  // Fallback success stories
  const getFallbackStories = (): SuccessStory[] => {
    return [
      {
        id: '1',
        company_name: "NovaTech",
        founder: "Alex Johnson",
        year: 2022,
        description: "Started as a university project and now an AI-powered education platform with over 50,000 users and $2M in funding.",
        user_id: "fallback1",
        industry: "Education",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        company_name: "GreenGrow",
        founder: "Sarah Miller",
        year: 2021,
        description: "A sustainable agriculture startup that developed from our hackathon and now partners with farmers across the country.",
        user_id: "fallback2",
        industry: "Agriculture",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        company_name: "FinScape",
        founder: "Michael Chen",
        year: 2023,
        description: "A fintech app built by our club members that simplifies investing for students and recently acquired by a major bank.",
        user_id: "fallback3",
        industry: "FinTech",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
    ];
  };

  return (
    <section id="success-stories" className="section-padding bg-secondary/30">
      <div className="container-wide">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
            Success Stories
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Startups Born in Our Club
          </h2>
          <p className="text-lg text-foreground/80">
            Discover how students like you have transformed their innovative ideas into successful businesses with our support.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <Card
                key={story.id}
                variant="glass"
                className="opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="p-8">
                  <div className="bg-primary/10 text-primary font-medium inline-block px-3 py-1 rounded-full text-sm mb-4">
                    Founded {story.year}
                  </div>
                  <h3 className="text-2xl font-bold mb-2 break-words">{story.company_name}</h3>
                  <p className="text-foreground/70 mb-4">Founded by {story.founder}</p>
                  <p className="text-lg mb-6 line-clamp-3 overflow-hidden">
                    {story.description}
                  </p>
                  {story.image_url && (
                    <div className="mb-6 h-40 overflow-hidden rounded-md">
                      <img 
                        src={story.image_url} 
                        alt={`${story.company_name} logo`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <a href={`/community/success-stories/${story.id}`} className="inline-flex items-center text-primary font-medium hover:underline">
                    Read Full Story
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
