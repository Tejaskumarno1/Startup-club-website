
import React from "react";
import { PageTemplate } from "@/components/common/PageTemplate";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Community = () => {
  const navigate = useNavigate();
  
  const communityFeatures = [
    {
      title: "Member Directory",
      description: "Browse and search for members of the Startup Club community.",
      path: "/community/directory",
      icon: "👥"
    },
    {
      title: "Success Stories",
      description: "Read about successful startups that began in our community.",
      path: "/community/success-stories",
      icon: "🏆"
    }
  ];
  
  return (
    <PageTemplate
      title="Community"
      description="Connect with fellow entrepreneurs and participate in discussions."
      icon={Users}
    >
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Get Connected</h2>
          <p className="text-gray-600 mb-6">
            Our vibrant community of entrepreneurs, mentors, and investors is here to support your journey.
            Network with peers and learn from others' experiences.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6">
            {communityFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl sm:text-3xl">{feature.icon}</div>
                    <CardTitle className="text-base sm:text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 text-xs sm:text-sm">{feature.description}</p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(feature.path)}
                    className="w-full"
                  >
                    Explore {feature.title}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};

export default Community;
