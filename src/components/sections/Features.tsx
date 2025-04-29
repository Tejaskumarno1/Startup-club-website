
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Code, Award, GraduationCap, Lightbulb, Users, Coins } from "lucide-react";

const programs = [
  {
    title: "Startup Incubation",
    description: "Get mentorship and resources to build your startup with dedicated workspace and technical support.",
    icon: Lightbulb,
  },
  {
    title: "Hackathons & Competitions",
    description: "Showcase your skills, win prizes, and attract investors through our regular innovation challenges.",
    icon: Award,
  },
  {
    title: "Workshops & Speaker Sessions",
    description: "Learn from industry leaders and successful entrepreneurs in our weekly knowledge-sharing events.",
    icon: GraduationCap,
  },
  {
    title: "Funding & Grants",
    description: "Access financial support for your startup journey through our network of investors and partners.",
    icon: Coins,
  },
  {
    title: "Networking Events",
    description: "Connect with like-minded innovators, potential co-founders, and industry professionals.",
    icon: Users,
  },
  {
    title: "Technical Support",
    description: "Get help with prototyping, development, and technical implementation of your ideas.",
    icon: Code,
  },
];

export const Features = () => {
  return (
    <section id="programs" className="section-padding bg-secondary/30">
      <div className="container-wide">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
            Programs & Initiatives
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Turn Your Ideas Into Reality
          </h2>
          <p className="text-lg text-foreground/80">
            Our club offers a variety of programs designed to support student entrepreneurs 
            at every stage of their startup journey, from ideation to growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {programs.map((program, index) => (
            <Card 
              key={program.title} 
              variant="glass"
              className="opacity-0 animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <program.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{program.title}</CardTitle>
                <CardDescription>{program.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
