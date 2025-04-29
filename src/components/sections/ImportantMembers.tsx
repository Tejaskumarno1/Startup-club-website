
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Instagram, Linkedin, Twitter, Globe, ArrowRight } from "lucide-react";
import { useImportantMembers } from "@/hooks/useImportantMembers";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useTheme } from "@/context/ThemeContext";

export const ImportantMembers = () => {
  const { data: members, isLoading, error } = useImportantMembers();
  const { theme } = useTheme();
  
  const isDarkMode = theme === "dark";

  if (isLoading) {
    return (
      <section className={`py-12 md:py-16 ${isDarkMode ? "bg-[#111827]" : "bg-muted/30"}`}>
        <div className="container mx-auto px-4 text-center">
          <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${isDarkMode ? "text-white" : ""}`}>Our Key Community Members</h2>
          <div className="animate-pulse flex space-x-4 justify-center">
            <div className={`rounded-full ${isDarkMode ? "bg-gray-700" : "bg-slate-200"} h-10 w-10`}></div>
            <div className="flex-1 space-y-6 py-1 max-w-md">
              <div className={`h-2 ${isDarkMode ? "bg-gray-700" : "bg-slate-200"} rounded`}></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className={`h-2 ${isDarkMode ? "bg-gray-700" : "bg-slate-200"} rounded col-span-2`}></div>
                  <div className={`h-2 ${isDarkMode ? "bg-gray-700" : "bg-slate-200"} rounded col-span-1`}></div>
                </div>
                <div className={`h-2 ${isDarkMode ? "bg-gray-700" : "bg-slate-200"} rounded`}></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !members) {
    return (
      <section className={`py-12 md:py-16 ${isDarkMode ? "bg-[#111827]" : "bg-muted/30"}`}>
        <div className="container mx-auto px-4 text-center">
          <h2 className={`text-2xl md:text-3xl font-bold mb-3 ${isDarkMode ? "text-white" : ""}`}>Our Key Community Members</h2>
          <p className={`${isDarkMode ? "text-gray-400" : "text-muted-foreground"}`}>
            We're having trouble loading our community members. Please try again later.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-12 md:py-16 ${isDarkMode ? "bg-[#111827]" : "bg-muted/30"} overflow-hidden`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className={`text-2xl md:text-3xl font-bold mb-3 ${isDarkMode ? "text-white" : ""}`}>Our Key Community Members</h2>
          <p className={`${isDarkMode ? "text-gray-400" : "text-muted-foreground"} max-w-2xl mx-auto`}>
            Connect with industry experts, successful founders, and mentors who can help accelerate your startup journey.
          </p>
        </div>
        
        <div className="w-full max-w-full overflow-x-auto">
          <Carousel className="w-full">
            <CarouselContent className="px-1">
              {members.map((member) => (
                <CarouselItem key={member.id} className="md:basis-1/2 lg:basis-1/3 p-1">
                  <Card className={`h-full ${isDarkMode ? "bg-gray-800/70 border-gray-700" : ""}`}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center mb-4">
                        <Avatar className="h-20 w-20 mb-3 border-2 border-primary">
                          <AvatarImage src={member.avatar_url} alt={member.name} />
                          <AvatarFallback className={`text-lg ${isDarkMode ? "bg-gray-700 text-gray-200" : ""}`}>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className={`font-semibold text-lg ${isDarkMode ? "text-white" : ""}`}>{member.name}</h3>
                          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-muted-foreground"}`}>
                            {member.role} {member.company ? `at ${member.company}` : ''}
                          </p>
                        </div>
                      </div>
                      
                      {member.bio && <p className={`text-sm text-center mb-4 line-clamp-3 ${isDarkMode ? "text-gray-300" : ""}`}>{member.bio}</p>}
                      
                      {member.expertise && member.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center mb-4">
                          {member.expertise.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant={isDarkMode ? "outline" : "secondary"} className={`text-xs ${isDarkMode ? "border-gray-600 bg-gray-800" : ""}`}>
                              {skill}
                            </Badge>
                          ))}
                          {member.expertise.length > 3 && (
                            <Badge variant={isDarkMode ? "outline" : "secondary"} className={`text-xs ${isDarkMode ? "border-gray-600 bg-gray-800" : ""}`}>
                              +{member.expertise.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex justify-center space-x-3 mt-3">
                        {member.instagram_url && (
                          <a 
                            href={member.instagram_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`${isDarkMode ? "text-gray-400 hover:text-primary" : "text-muted-foreground hover:text-primary"} transition-colors`}
                          >
                            <Instagram size={18} />
                          </a>
                        )}
                        {member.linkedin_url && (
                          <a 
                            href={member.linkedin_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`${isDarkMode ? "text-gray-400 hover:text-primary" : "text-muted-foreground hover:text-primary"} transition-colors`}
                          >
                            <Linkedin size={18} />
                          </a>
                        )}
                        {member.twitter_url && (
                          <a 
                            href={member.twitter_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`${isDarkMode ? "text-gray-400 hover:text-primary" : "text-muted-foreground hover:text-primary"} transition-colors`}
                          >
                            <Twitter size={18} />
                          </a>
                        )}
                        {member.website_url && (
                          <a 
                            href={member.website_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`${isDarkMode ? "text-gray-400 hover:text-primary" : "text-muted-foreground hover:text-primary"} transition-colors`}
                          >
                            <Globe size={18} />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex items-center justify-center mt-6">
              <CarouselPrevious className={`relative mr-2 static translate-y-0 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600" : ""}`} />
              <CarouselNext className={`relative ml-2 static translate-y-0 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600" : ""}`} />
            </div>
          </Carousel>
        </div>
        
        <div className="text-center mt-8">
          <Button asChild variant="outline" className={`group ${isDarkMode ? "border-gray-700 bg-gray-800/50 hover:bg-gray-700 text-white" : ""}`}>
            <Link to="/community/MemberDirectory">
              View All Members
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
