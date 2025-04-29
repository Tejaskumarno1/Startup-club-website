
import React, { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { fetchSlides } from "@/lib/api/slideApi";
import { useToast } from "@/hooks/use-toast";
import { SlideImage } from "@/lib/types";
import { BadgeAlert } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export const YearInReview = () => {
  const [slides, setSlides] = useState<SlideImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { theme } = useTheme();

  const loadSlides = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSlides();
      console.log("Fetched slides:", data);
      setSlides(data);
    } catch (error: any) {
      console.error("Error fetching slides:", error.message);
      setError("Failed to load slides");
      toast({
        title: "Couldn't load slides",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, [toast]);

  // Filter out inactive slides
  const activeSlides = slides.filter(slide => slide.is_active !== false);
  
  console.log("Active slides:", activeSlides);

  const isDarkMode = theme === "dark";

  return (
    <section className={`w-full py-12 ${isDarkMode ? 'bg-[#111827]' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4">
        <div className={`text-center mb-8 ${isDarkMode ? 'bg-gray-800/30 p-4 rounded-lg' : ''}`}>
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : ''}`}>Year in Review</h2>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Highlights from our previous year of innovation and growth
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : activeSlides.length === 0 ? (
          <div className={`text-center py-12 flex flex-col items-center gap-4 ${isDarkMode ? 'text-gray-300' : ''}`}>
            <BadgeAlert className={`h-12 w-12 ${isDarkMode ? 'text-gray-300' : 'text-gray-400'}`} />
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>No slides available at the moment.</p>
          </div>
        ) : (
          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent>
              {activeSlides.map((slide) => (
                <CarouselItem key={slide.id} className="md:basis-1/2 lg:basis-1/1">
                  <Card className={`overflow-hidden ${isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'border-none'} shadow-lg`}>
                    <CardContent className="p-0 relative aspect-video">
                      <img 
                        src={slide.image_url} 
                        alt={slide.title} 
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          // Fallback if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                          target.alt = "Image failed to load";
                          console.log("Image failed to load, using placeholder");
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                        <h3 className="text-xl font-semibold">{slide.title}</h3>
                        {slide.description && (
                          <p className="mt-2">{slide.description}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className={`left-4 ${isDarkMode ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700' : ''}`} />
            <CarouselNext className={`right-4 ${isDarkMode ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700' : ''}`} />
          </Carousel>
        )}
      </div>
    </section>
  );
};
