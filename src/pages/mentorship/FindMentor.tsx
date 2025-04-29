import React, { useState, useEffect } from "react";
import { PageTemplate } from "@/components/common/PageTemplate";
import { UserSearch } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getMentorProfiles } from "@/lib/mentorshipHelpers";
import { MentorProfile } from "@/lib/types";
import { useNavigate } from "react-router-dom";

const FindMentor = () => {
  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [expertiseFilter, setExpertiseFilter] = useState("all");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const mentorProfiles = await getMentorProfiles();
        setMentors(mentorProfiles);
      } catch (error) {
        console.error("Error fetching mentors:", error);
        toast({
          title: "Error",
          description: "Failed to load mentor profiles. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMentors();
  }, [toast]);
  
  const fallbackMentors = [
    {
      id: "1",
      user_id: "user1",
      profiles: {
        first_name: "Jennifer",
        last_name: "Lee",
        profession: "Startup Advisor & Former CTO",
        company: "TechVentures",
        profile_image_url: "" // Added profile_image_url to match the type
      },
      expertise: ["Tech Leadership", "Product Strategy", "Scaling"],
      industry: "Technology",
      experience: "15+ years",
      availability: "2 sessions/week",
      bio: "Experienced technology leader with a passion for helping startups scale."
    },
    {
      id: "2",
      user_id: "user2",
      profiles: {
        first_name: "Robert",
        last_name: "Chen",
        profession: "Serial Entrepreneur & Investor",
        company: "Growth Capital Partners",
        profile_image_url: "" // Added profile_image_url to match the type
      },
      expertise: ["Fundraising", "Business Strategy", "Marketing"],
      industry: "Venture Capital",
      experience: "12+ years",
      availability: "1 session/week",
      bio: "Serial entrepreneur who has raised over $50M in venture capital."
    },
    {
      id: "3",
      user_id: "user3",
      profiles: {
        first_name: "Ayesha",
        last_name: "Khan",
        profession: "Marketing Director",
        company: "Global Brands Inc.",
        profile_image_url: "" // Added profile_image_url to match the type
      },
      expertise: ["Digital Marketing", "Brand Strategy", "Consumer Insights"],
      industry: "Marketing",
      experience: "10+ years",
      availability: "Bi-weekly sessions",
      bio: "Marketing expert specializing in growth strategies for early-stage startups."
    },
    {
      id: "4",
      user_id: "user4",
      profiles: {
        first_name: "Marcus",
        last_name: "Johnson",
        profession: "Operations Executive",
        company: "LogiTech Solutions",
        profile_image_url: "" // Added profile_image_url to match the type
      },
      expertise: ["Supply Chain", "Process Optimization", "Team Building"],
      industry: "Operations",
      experience: "8+ years",
      availability: "3 sessions/month",
      bio: "Operations specialist focused on helping startups build efficient processes."
    }
  ];
  
  const displayMentors = mentors.length > 0 ? mentors : fallbackMentors;
  
  const filteredMentors = displayMentors.filter(mentor => {
    const name = `${mentor.profiles?.first_name || ''} ${mentor.profiles?.last_name || ''}`.toLowerCase();
    const matchesSearch = searchTerm === "" || 
      name.includes(searchTerm.toLowerCase()) || 
      (mentor.expertise || []).some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (mentor.industry || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesIndustry = industryFilter === "all" || mentor.industry === industryFilter;
    
    const matchesExpertise = expertiseFilter === "all" || 
      (mentor.expertise || []).some(skill => skill.toLowerCase().includes(expertiseFilter.toLowerCase()));
    
    return matchesSearch && matchesIndustry && matchesExpertise;
  });
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleRequestMentorship = (mentorId: string) => {
    toast({
      title: "Request Sent",
      description: "Your mentorship request has been sent.",
    });
  };
  
  return (
    <PageTemplate
      title="Find a Mentor"
      description="Browse profiles of available mentors and request mentorship."
      icon={UserSearch}
    >
      <div className="space-y-6">
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input 
                placeholder="Search by name, expertise, or industry"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex gap-2">
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Venture Capital">Venture Capital</SelectItem>
                </SelectContent>
              </Select>
              <Select value={expertiseFilter} onValueChange={setExpertiseFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Expertise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Expertise</SelectItem>
                  <SelectItem value="Fundraising">Fundraising</SelectItem>
                  <SelectItem value="Tech Leadership">Tech Leadership</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Strategy">Strategy</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                </SelectContent>
              </Select>
              <Button>Search</Button>
            </div>
          </div>
        </Card>
        
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <p>Loading mentor profiles...</p>
            </div>
          ) : filteredMentors.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-600 mb-4">No mentors match your search criteria.</p>
              <Button onClick={() => {
                setSearchTerm("");
                setIndustryFilter("all");
                setExpertiseFilter("all");
              }}>
                Clear Filters
              </Button>
            </Card>
          ) : (
            filteredMentors.map((mentor) => (
              <Card key={mentor.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center md:items-start gap-2">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={mentor.profiles?.profile_image_url} alt={`${mentor.profiles?.first_name} ${mentor.profiles?.last_name}`} />
                        <AvatarFallback className="text-lg">
                          {mentor.profiles ? `${mentor.profiles.first_name?.[0] || ''}${mentor.profiles.last_name?.[0] || ''}` : 'M'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-center md:text-left">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {mentor.industry || "General"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-medium text-lg">
                          {mentor.profiles ? `${mentor.profiles.first_name || ''} ${mentor.profiles.last_name || ''}` : 'Unknown Mentor'}
                        </h3>
                        <p className="text-sm text-gray-600">{mentor.profiles?.profession}</p>
                        <p className="text-xs text-gray-500">{mentor.profiles?.company}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Expertise:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(mentor.expertise || []).map((skill, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Experience:</p>
                          <p>{mentor.experience || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Availability:</p>
                          <p className="text-green-600">{mentor.availability || "Contact for details"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 justify-center">
                      <Button onClick={() => handleRequestMentorship(mentor.id)}>
                        Request Mentorship
                      </Button>
                      <Button variant="outline">View Full Profile</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        <div className="mt-6 p-6 border border-dashed rounded-lg text-center">
          <div className="text-3xl mb-2">🚧</div>
          <p className="font-medium">Mentor matching system coming soon</p>
          <p className="text-sm text-gray-500 mt-2">
            We're developing an AI-powered system to match you with the perfect mentor based on your goals and needs.
          </p>
        </div>
      </div>
    </PageTemplate>
  );
};

export default FindMentor;
