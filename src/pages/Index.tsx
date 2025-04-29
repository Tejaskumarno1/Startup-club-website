
import React from "react";
import { Link } from "react-router-dom";
import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { About } from "@/components/sections/About";
import { Testimonials } from "@/components/sections/Testimonials";
import { Contact } from "@/components/sections/Contact";
import { EventCarousel } from "@/components/events/EventCarousel";
import { YearInReview } from "@/components/sections/YearInReview";
import { ImportantMembers } from "@/components/sections/ImportantMembers";
import { SponsorShowcase } from "@/components/sections/SponsorShowcase";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";

const Index = () => {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="relative">
        {/* Dot pattern background overlay */}
        <div className="absolute inset-0 bg-dot-pattern bg-dot-md text-gray-200 opacity-30 pointer-events-none" />
        
        <Hero />
        <EventCarousel />
        <YearInReview />
        <ImportantMembers />
        
        {/* Sponsor Showcase Section - Make sure it's visible and prominent */}
        <SponsorShowcase />
        
        {/* Join the Innovation Community CTA */}
        <section className="relative bg-primary text-primary-foreground py-12 md:py-16">
          <div className="absolute inset-0 bg-dot-pattern bg-dot-md text-white/10 opacity-40 pointer-events-none" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Join the Innovation Community</h2>
            <p className="text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto">
              Connect with like-minded entrepreneurs, access exclusive resources, and accelerate your startup journey.
            </p>
            {user ? (
              <div className="space-y-4">
                <p className="text-lg font-medium">You're already a member!</p>
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/dashboard">
                    Go to Dashboard
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/auth/signup">
                    Sign Up
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10" asChild>
                  <Link to="/login">
                    Login
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>
        
        <Features />
        <About />
        <Testimonials />
        <Contact />
      </div>
    </MainLayout>
  );
};

export default Index;
