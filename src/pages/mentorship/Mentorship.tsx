
import React from "react";
import { PageTemplate } from "@/components/common/PageTemplate";
import { UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Mentorship = () => {
  const navigate = useNavigate();
  
  const mentorshipOptions = [
    {
      title: "Find a Mentor",
      description: "Browse profiles of available mentors and request mentorship.",
      path: "/mentorship/find",
      icon: "🔍"
    },
    {
      title: "Mentor Sessions",
      description: "View your upcoming and past mentorship sessions.",
      path: "/mentorship/sessions",
      icon: "📅"
    },
    {
      title: "Become a Mentor",
      description: "Share your knowledge and experience by mentoring new entrepreneurs.",
      path: "/mentorship/become",
      icon: "🤝"
    }
  ];
  
  const featuredMentors = [
    {
      name: "Jennifer Lee",
      role: "Startup Advisor & Former CTO",
      expertise: ["Tech Leadership", "Product Strategy", "Scaling"],
      availability: "2 slots available"
    },
    {
      name: "Robert Chen",
      role: "Serial Entrepreneur & Investor",
      expertise: ["Fundraising", "Business Strategy", "Marketing"],
      availability: "1 slot available"
    }
  ];
  
  return (
    <PageTemplate
      title="Mentorship"
      description="Connect with mentors or become a mentor to other entrepreneurs."
      icon={UserPlus}
    >
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Mentorship Programs</h2>
          <p className="text-gray-600 mb-6">
            Our mentorship program connects aspiring entrepreneurs with experienced business leaders, 
            providing guidance, feedback, and support for your startup journey.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {mentorshipOptions.map((option, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{option.icon}</div>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 text-sm">{option.description}</p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(option.path)}
                    className="w-full"
                  >
                    Explore
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Featured Mentors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredMentors.map((mentor, index) => (
              <Card key={index} className="hover:bg-gray-50 transition-colors">
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg">{mentor.name}</h3>
                  <p className="text-sm text-gray-600">{mentor.role}</p>
                  <div className="flex flex-wrap gap-1 my-2">
                    {mentor.expertise.map((skill, i) => (
                      <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-green-600">{mentor.availability}</span>
                    <Button size="sm" onClick={() => navigate("/mentorship/find")}>
                      Request Mentoring
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => navigate("/mentorship/find")}>
              View All Mentors
            </Button>
          </div>
        </div>
        
        <div className="bg-primary/5 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">Mentorship Benefits</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Personalized guidance from experienced entrepreneurs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Access to industry-specific knowledge and networks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Feedback on your business model, pitch, and strategy</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Ongoing support through challenging startup phases</span>
            </li>
          </ul>
        </div>
      </div>
    </PageTemplate>
  );
};

export default Mentorship;
