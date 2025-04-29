
import React from "react";
import { Button } from "../ui/button";
import { ArrowRight, Check } from "lucide-react";

const benefits = [
  "Access to mentorship from successful entrepreneurs and industry experts",
  "Opportunities to pitch your ideas to real investors and VCs",
  "Free co-working space and resources to build your startup",
  "Network with like-minded students and potential co-founders",
  "Exclusive workshops on entrepreneurship and innovation",
];

export const About = () => {
  return (
    <section id="about" className="py-12 md:py-16 lg:py-24 px-4 sm:px-8">
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Content Column - Now taking full width */}
          <div className="lg:col-span-12 opacity-0 animate-slide-in">
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4 md:mb-6">
              About Our Club
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
              Supporting Innovation & Entrepreneurship
            </h2>
            <p className="text-base md:text-lg text-foreground/80 mb-6 md:mb-8">
              The Startup Club is a student-driven initiative that nurtures entrepreneurial spirit, 
              fosters innovation, and connects students with mentors, investors, and resources to build 
              successful startups. We believe every student has the potential to create something extraordinary.
            </p>

            <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start">
                  <div className="rounded-full bg-primary/10 p-1 mr-3 mt-0.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm md:text-base">{benefit}</span>
                </li>
              ))}
            </ul>

            <Button className="group">
              Learn More About Us
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};