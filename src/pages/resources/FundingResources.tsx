
import React from "react";
import { PageTemplate } from "@/components/common/PageTemplate";
import { DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const FundingResources = () => {
  const fundingSources = [
    {
      title: "Angel Investors",
      description: "Connect with individual investors who can provide early-stage funding.",
      types: ["Seed", "Early-stage"],
      link: "#"
    },
    {
      title: "Venture Capital",
      description: "Find VC firms interested in startups in your industry.",
      types: ["Series A", "Series B", "Growth"],
      link: "#"
    },
    {
      title: "Government Grants",
      description: "Explore non-dilutive funding options through government programs.",
      types: ["R&D", "Innovation", "Small Business"],
      link: "#"
    },
    {
      title: "Accelerators & Incubators",
      description: "Programs that provide funding, mentorship, and resources.",
      types: ["Pre-seed", "Seed"],
      link: "#"
    }
  ];
  
  return (
    <PageTemplate
      title="Funding Resources"
      description="Information on grants, investors, and funding opportunities for startups."
      icon={DollarSign}
    >
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Funding Sources</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {fundingSources.map((source, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{source.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{source.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {source.types.map((type, i) => (
                      <Badge key={i} variant="outline">{type}</Badge>
                    ))}
                  </div>
                  <Separator className="my-4" />
                  <a 
                    href={source.link} 
                    className="text-primary hover:underline text-sm inline-block"
                  >
                    Learn more about {source.title}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="mt-6 p-6 border border-dashed rounded-lg text-center">
          <div className="text-3xl mb-2">🚧</div>
          <p className="font-medium">Funding database coming soon</p>
          <p className="text-sm text-gray-500 mt-2">
            We're building a comprehensive database of funding opportunities for startups.
          </p>
        </div>
      </div>
    </PageTemplate>
  );
};

export default FundingResources;
