
import React from "react";
import { Button } from "../ui/button";
import { ArrowRight, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";

export const Hero = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section
      id="home"
      className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center pt-20 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="container-wide relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center px-4 md:px-8">
        {/* Hero Content */}
        <div className="lg:col-span-6 flex flex-col items-start space-y-8 animate-fade-in">
          <div>
            <div className="inline-block rounded-full bg-secondary px-3 py-1 text-sm font-medium text-primary mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
              Innovation Hub
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-4 opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
              Empowering <br />
              <span className="text-primary">Innovators</span>, Building <span className="text-primary">Startups</span>
            </h1>
            <p className="text-lg text-foreground/80 max-w-xl opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
              Join our community of aspiring entrepreneurs, innovators, and change-makers. Turn ideas into reality with mentorship, funding, and networking!
            </p>
          </div>

          <div className="flex flex-wrap gap-4 opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
            <Button size="lg" className="group" asChild>
              <Link to="/login">
                Join the Club
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/startups/browse">
                Explore Startups
              </Link>
            </Button>
          </div>
        </div>

        {/* Hero Stats Card */}
        <div className="lg:col-span-6 opacity-0 animate-fade-in-blur mt-8 lg:mt-0" style={{ animationDelay: "600ms" }}>
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur opacity-30"></div>
            <div className="glass-card p-2 md:p-3 relative">
              <div className={`aspect-[4/3] w-full rounded-xl overflow-hidden ${isDark ? 'bg-gray-800/70' : 'bg-secondary/50'}`}>
                <div className={`h-full w-full ${isDark ? 'bg-gray-800/80' : 'bg-white/80'} rounded-xl p-6 md:p-8 flex flex-col items-center justify-center`}>
                  <div className="mb-4 md:mb-6">
                    <Rocket className="h-12 w-12 md:h-16 md:w-16 text-primary" />
                  </div>
                  <h3 className={`text-xl md:text-2xl font-bold text-center mb-4 ${isDark ? 'text-white' : ''}`}>100+ Student Startups Incubated</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full max-w-md">
                    <div className={`flex items-center p-2 md:p-3 ${isDark ? 'bg-gray-700/30' : 'bg-primary/5'} rounded-lg`}>
                      <span className={`text-sm md:text-lg font-medium ${isDark ? 'text-gray-100' : ''}`}>🎤 Monthly Pitch Sessions</span>
                    </div>
                    <div className={`flex items-center p-2 md:p-3 ${isDark ? 'bg-gray-700/30' : 'bg-primary/5'} rounded-lg`}>
                      <span className={`text-sm md:text-lg font-medium ${isDark ? 'text-gray-100' : ''}`}>🤝 Industry Mentors</span>
                    </div>
                    <div className={`flex items-center p-2 md:p-3 ${isDark ? 'bg-gray-700/30' : 'bg-primary/5'} rounded-lg`}>
                      <span className={`text-sm md:text-lg font-medium ${isDark ? 'text-gray-100' : ''}`}>💰 Access to Funding</span>
                    </div>
                    <div className={`flex items-center p-2 md:p-3 ${isDark ? 'bg-gray-700/30' : 'bg-primary/5'} rounded-lg`}>
                      <span className={`text-sm md:text-lg font-medium ${isDark ? 'text-gray-100' : ''}`}>🚀 Startup Resources</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
