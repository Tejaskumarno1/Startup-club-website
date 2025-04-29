
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";

const Startups = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  return (
    <MainLayout>
      <PageHeader
        title="Startups"
        description="Connect with student-led startups, explore funding opportunities, and showcase your own venture."
        icon={Building2}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <Card className={`hover:shadow-md transition-shadow ${isDarkMode ? "bg-gray-800/50 border-gray-700" : ""}`}>
          <CardHeader className="pb-2">
            <CardTitle className={isDarkMode ? "text-white" : ""}>Browse Startups</CardTitle>
            <CardDescription className={isDarkMode ? "text-gray-300" : ""}>Explore innovative ventures from our community</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className={`text-sm ${isDarkMode ? "text-gray-300" : ""}`}>Discover the latest startups founded by students and alumni. Filter by industry, stage, or funding status.</p>
            <Button className={`w-full ${isDarkMode ? "border-gray-600 hover:bg-gray-700" : ""}`} variant="outline" asChild>
              <Link to="/startups/browse">Browse Directory</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className={`hover:shadow-md transition-shadow ${isDarkMode ? "bg-gray-800/50 border-gray-700" : ""}`}>
          <CardHeader className="pb-2">
            <CardTitle className={isDarkMode ? "text-white" : ""}>My Connections</CardTitle>
            <CardDescription className={isDarkMode ? "text-gray-300" : ""}>Manage your startup network</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className={`text-sm ${isDarkMode ? "text-gray-300" : ""}`}>View and manage your connections with founders, mentors, and potential collaborators.</p>
            <Button className={`w-full ${isDarkMode ? "border-gray-600 hover:bg-gray-700" : ""}`} variant="outline" asChild>
              <Link to="/startups/connections">View Connections</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className={`hover:shadow-md transition-shadow ${isDarkMode ? "bg-gray-800/50 border-gray-700" : ""}`}>
          <CardHeader className="pb-2">
            <CardTitle className={isDarkMode ? "text-white" : ""}>Request Introductions</CardTitle>
            <CardDescription className={isDarkMode ? "text-gray-300" : ""}>Connect with specific startups or founders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className={`text-sm ${isDarkMode ? "text-gray-300" : ""}`}>Request warm introductions to startups, founders, or mentors in our network.</p>
            <Button className={`w-full ${isDarkMode ? "border-gray-600 hover:bg-gray-700" : ""}`} variant="outline" asChild>
              <Link to="/startups/introductions">Request Intro</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? "text-white" : ""}`}>Featured Startups</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className={`overflow-hidden hover:shadow-md transition-shadow ${isDarkMode ? "bg-gray-800/50 border-gray-700" : ""}`}>
            <div className="h-48 bg-gray-100 flex items-center justify-center">
              <img 
                src={`https://picsum.photos/seed/${i + 10}/800/600`} 
                alt={`Startup ${i}`} 
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className={isDarkMode ? "text-white" : ""}>Startup Name {i}</CardTitle>
              <CardDescription className={isDarkMode ? "text-gray-300" : ""}>
                {["FinTech", "EdTech", "HealthTech", "CleanTech", "AgriTech", "AI"][i % 6]}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className={`text-sm ${isDarkMode ? "text-gray-300" : ""}`}>
                A brief description of what this startup does and the problem they're solving in the market.
              </p>
              <div className="flex justify-between items-center">
                <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Founded in 2023</span>
                <Button 
                  size="sm" 
                  variant="outline"
                  className={isDarkMode ? "border-gray-600 hover:bg-gray-700" : ""}
                  onClick={() => window.location.href = `/startups/profile/${i}`}
                >
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </MainLayout>
  );
};

export default Startups;
