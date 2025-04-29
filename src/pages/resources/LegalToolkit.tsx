
import React from "react";
import { PageTemplate } from "@/components/common/PageTemplate";
import { Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const LegalToolkit = () => {
  const legalDocuments = [
    {
      title: "Founder Agreements",
      description: "Templates for co-founder agreements to define roles, equity, and responsibilities.",
      documents: [
        { name: "Founder Agreement", format: "DOCX" },
        { name: "Equity Vesting Schedule", format: "XLSX" }
      ]
    },
    {
      title: "Employee Documents",
      description: "Templates for hiring and managing employees and contractors.",
      documents: [
        { name: "Employment Agreement", format: "DOCX" },
        { name: "Contractor Agreement", format: "DOCX" },
        { name: "NDA Template", format: "DOCX" }
      ]
    },
    {
      title: "Intellectual Property",
      description: "Protect your company's intellectual property with these templates.",
      documents: [
        { name: "IP Assignment", format: "DOCX" },
        { name: "Trademark Guide", format: "PDF" }
      ]
    }
  ];
  
  return (
    <PageTemplate
      title="Legal Toolkit"
      description="Access legal templates and resources for your startup."
      icon={Scale}
    >
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">Important Notice</h2>
          <p className="text-sm text-gray-600">
            These documents are provided as templates only and should be reviewed by a qualified legal professional before use. 
            They are not a substitute for legal advice tailored to your specific situation.
          </p>
        </div>
        
        {legalDocuments.map((category, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader>
              <CardTitle>{category.title}</CardTitle>
              <p className="text-sm text-gray-600">{category.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.documents.map((doc, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2 py-1 bg-gray-200 rounded">
                        {doc.format}
                      </span>
                      <span>{doc.name}</span>
                    </div>
                    <Button variant="outline" size="sm">Download</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        
        <div className="mt-6 p-6 border border-dashed rounded-lg text-center">
          <div className="text-3xl mb-2">🚧</div>
          <p className="font-medium">Legal consultation service coming soon</p>
          <p className="text-sm text-gray-500 mt-2">
            We're working on providing access to startup-friendly legal advice.
          </p>
        </div>
      </div>
    </PageTemplate>
  );
};

export default LegalToolkit;
