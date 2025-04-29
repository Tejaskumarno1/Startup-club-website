
import React from "react";
import { PageTemplate } from "@/components/common/PageTemplate";
import { BookText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Resources = () => {
  const navigate = useNavigate();
  
  const resourceCategories = [
    {
      title: "Startup Guides",
      description: "Comprehensive guides on various aspects of starting and running a business.",
      path: "/resources/guides",
      icon: "📚"
    },
    {
      title: "Templates",
      description: "Download ready-to-use templates for business plans, pitch decks, and more.",
      path: "/resources/templates",
      icon: "📝"
    },
    {
      title: "Funding Resources",
      description: "Information on grants, investors, and funding opportunities for startups.",
      path: "/resources/funding",
      icon: "💰"
    },
    {
      title: "Legal Toolkit",
      description: "Access legal templates and resources for your startup.",
      path: "/resources/legal",
      icon: "⚖️"
    }
  ];
  
  return (
    <PageTemplate
      title="Resources"
      description="Access guides, templates, and tools to help build your startup."
      icon={BookText}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resourceCategories.map((category, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="text-3xl">{category.icon}</div>
                <CardTitle>{category.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{category.description}</p>
              <Button 
                variant="outline" 
                onClick={() => navigate(category.path)}
                className="w-full"
              >
                Explore {category.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageTemplate>
  );
};

export default Resources;
