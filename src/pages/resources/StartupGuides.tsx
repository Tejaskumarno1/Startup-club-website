
import React from "react";
import { PageTemplate } from "@/components/common/PageTemplate";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StartupGuides = () => {
  const guides = [
    {
      title: "Idea Validation",
      description: "Learn how to validate your business idea before investing time and resources.",
      category: "Getting Started",
      readTime: "15 min read"
    },
    {
      title: "Business Plan Writing",
      description: "A step-by-step guide to creating a comprehensive business plan.",
      category: "Planning",
      readTime: "25 min read"
    },
    {
      title: "Funding Options",
      description: "Explore different funding options for your startup at various stages.",
      category: "Finance",
      readTime: "20 min read"
    },
    {
      title: "Marketing for Startups",
      description: "Learn cost-effective marketing strategies for early-stage startups.",
      category: "Marketing",
      readTime: "18 min read"
    }
  ];
  
  return (
    <PageTemplate
      title="Startup Guides"
      description="Comprehensive guides on various aspects of starting and running a business."
      icon={FileText}
    >
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Featured Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides.map((guide, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{guide.title}</CardTitle>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {guide.category}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 text-sm">{guide.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{guide.readTime}</span>
                    <button className="text-sm text-primary hover:underline">
                      Read Guide
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="mt-6 p-6 border border-dashed rounded-lg text-center">
          <div className="text-3xl mb-2">🚧</div>
          <p className="font-medium">More guides coming soon</p>
          <p className="text-sm text-gray-500 mt-2">
            We're working on expanding our library of startup resources.
          </p>
        </div>
      </div>
    </PageTemplate>
  );
};

export default StartupGuides;
