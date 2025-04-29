import React, { useState } from "react";
import { PageTemplate } from "@/components/common/PageTemplate";
import { UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { createMentorApplication } from "@/lib/mentorshipHelpers";
import { useAuth } from "@/context/AuthContext";

const BecomeMentor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    expertise: [] as string[],
    availability: "",
    hourly_rate: 0,
    first_name: user?.first_name || user?.user_metadata?.first_name || "",
    last_name: user?.last_name || user?.user_metadata?.last_name || "",
    email: user?.email || "",
    company: user?.company || user?.user_metadata?.company || "",
    profession: user?.profession || user?.user_metadata?.profession || "",
    linkedin: "",
    experience_years: "",
    motivation: ""
  });
  
  const benefits = [
    "Give back to the startup community",
    "Build your professional network",
    "Develop your leadership and coaching skills",
    "Stay connected with emerging trends and innovations",
    "Recognition as an industry expert"
  ];
  
  const expectations = [
    "Commit to at least 2 hours per month for mentoring",
    "Provide constructive feedback and guidance",
    "Respect confidentiality of mentees' ideas and information",
    "Attend occasional mentor community events",
    "Complete a brief onboarding process"
  ];
  
  const expertiseAreas = [
    "Business Strategy",
    "Product Development",
    "Marketing & Sales",
    "Fundraising",
    "Technology & Engineering",
    "Operations",
    "Finance & Accounting",
    "Legal & Regulatory",
    "Leadership & Team Building"
  ];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleExpertiseChange = (area: string, checked: boolean) => {
    if (checked) {
      if (formData.expertise.length < 3) {
        setFormData(prev => ({
          ...prev,
          expertise: [...prev.expertise, area]
        }));
      } else {
        toast({
          title: "Maximum reached",
          description: "You can select up to 3 areas of expertise",
        });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        expertise: prev.expertise.filter(item => item !== area)
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit your mentor application",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.expertise.length === 0) {
      toast({
        title: "Missing expertise",
        description: "Please select at least one area of expertise",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const mentorData = {
        bio: formData.bio,
        expertise: formData.expertise,
        availability: formData.availability,
        hourly_rate: Number(formData.hourly_rate) || 0
      };
      
      const result = await createMentorApplication(user.id, mentorData);
      
      if (result.success) {
        toast({
          title: "Application submitted",
          description: "Your mentor application has been submitted for review",
        });
        
        // Reset form
        setFormData({
          bio: "",
          expertise: [],
          availability: "",
          hourly_rate: 0,
          first_name: user?.first_name || user?.user_metadata?.first_name || "",
          last_name: user?.last_name || user?.user_metadata?.last_name || "",
          email: user?.email || "",
          company: user?.company || user?.user_metadata?.company || "",
          profession: user?.profession || user?.user_metadata?.profession || "",
          linkedin: "",
          experience_years: "",
          motivation: ""
        });
      } else {
        toast({
          title: "Submission failed",
          description: result.error?.message || "An error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting mentor application:", error);
      toast({
        title: "Submission error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <PageTemplate
      title="Become a Mentor"
      description="Share your knowledge and experience by mentoring new entrepreneurs."
      icon={UserPlus}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mentor Application</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input 
                      id="first_name" 
                      placeholder="Your first name" 
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input 
                      id="last_name" 
                      placeholder="Your last name" 
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your.email@example.com" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company/Organization</Label>
                  <Input 
                    id="company" 
                    placeholder="Where do you work?" 
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="profession">Title/Position</Label>
                  <Input 
                    id="profession" 
                    placeholder="Your professional title" 
                    value={formData.profession}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <Input 
                    id="linkedin" 
                    placeholder="https://linkedin.com/in/yourprofile" 
                    value={formData.linkedin}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="experience_years">Years of Professional Experience</Label>
                  <Input 
                    id="experience_years" 
                    type="number" 
                    min="1" 
                    placeholder="10" 
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Areas of Expertise (select up to 3)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {expertiseAreas.map((area, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`expertise-${index}`} 
                          checked={formData.expertise.includes(area)}
                          onCheckedChange={(checked) => handleExpertiseChange(area, checked === true)}
                        />
                        <Label htmlFor={`expertise-${index}`}>{area}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Tell us about your professional background and experience"
                    className="min-h-[100px]"
                    value={formData.bio}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="motivation">Why do you want to be a mentor?</Label>
                  <Textarea 
                    id="motivation" 
                    placeholder="Explain your motivation for joining our mentorship program"
                    className="min-h-[100px]"
                    value={formData.motivation}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="availability">Mentoring Availability</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="weekly" 
                        checked={formData.availability === "Weekly"}
                        onCheckedChange={(checked) => checked && setFormData(prev => ({ ...prev, availability: "Weekly" }))}
                      />
                      <Label htmlFor="weekly">Weekly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="biweekly" 
                        checked={formData.availability === "Bi-weekly"}
                        onCheckedChange={(checked) => checked && setFormData(prev => ({ ...prev, availability: "Bi-weekly" }))}
                      />
                      <Label htmlFor="biweekly">Bi-weekly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="monthly" 
                        checked={formData.availability === "Monthly"}
                        onCheckedChange={(checked) => checked && setFormData(prev => ({ ...prev, availability: "Monthly" }))}
                      />
                      <Label htmlFor="monthly">Monthly</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">Hourly Rate (if applicable, in USD)</Label>
                  <Input 
                    id="hourly_rate" 
                    type="number" 
                    min="0" 
                    placeholder="0" 
                    value={formData.hourly_rate || ""}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-gray-500">Leave at 0 if you're willing to volunteer your time.</p>
                </div>
                
                <div className="pt-4">
                  <Button className="w-full" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Benefits of Mentoring</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Mentor Expectations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {expectations.map((expectation, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary">•</span>
                    <span>{expectation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Testimonials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm italic">"Being a mentor has been incredibly rewarding. I've learned as much from my mentees as they have from me."</p>
                <p className="text-xs text-gray-500 mt-2">— Sarah Johnson, Product Director</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm italic">"The structured program made it easy to fit mentoring into my busy schedule while making a real impact."</p>
                <p className="text-xs text-gray-500 mt-2">— Michael Chen, Tech Entrepreneur</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  );
};

export default BecomeMentor;
