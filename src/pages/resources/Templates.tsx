
import React from "react";
import { PageTemplate } from "@/components/common/PageTemplate";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Templates = () => {
  const templateCategories = [
    {
      title: "Business Documents",
      items: [
        { name: "Business Plan Template", format: "DOCX", size: "125 KB" },
        { name: "SWOT Analysis Template", format: "XLSX", size: "78 KB" },
        { name: "Competitor Analysis", format: "DOCX", size: "92 KB" }
      ]
    },
    {
      title: "Pitch Materials",
      items: [
        { name: "Pitch Deck Template", format: "PPTX", size: "4.2 MB" },
        { name: "Executive Summary", format: "DOCX", size: "85 KB" },
        { name: "One-Pager Template", format: "DOCX", size: "72 KB" }
      ]
    }
  ];
  
  return (
    <PageTemplate
      title="Templates"
      description="Download ready-to-use templates for business plans, pitch decks, and more."
      icon={FileText}
    >
      <div className="space-y-8">
        {templateCategories.map((category, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{category.title}</h2>
            <div className="space-y-4">
              {category.items.map((template, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="flex justify-between items-center p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-100 p-2 rounded">
                        <span className="font-mono text-sm font-medium">
                          {template.format}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-xs text-gray-500">{template.size}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
        
        <div className="mt-6 p-6 border border-dashed rounded-lg text-center">
          <div className="text-3xl mb-2">🚧</div>
          <p className="font-medium">More templates coming soon</p>
          <p className="text-sm text-gray-500 mt-2">
            We're working on expanding our library of templates.
          </p>
        </div>
      </div>
    </PageTemplate>
  );
};

export default Templates;
