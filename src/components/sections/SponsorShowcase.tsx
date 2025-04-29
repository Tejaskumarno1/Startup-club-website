
import React from 'react';
import { useSponsors } from '@/hooks/useSponsors';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Handshake, ExternalLink } from "lucide-react";

export const SponsorShowcase: React.FC = () => {
  const { sponsors, loading, error } = useSponsors();

  if (loading) {
    return (
      <section className="container mx-auto py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Our Sponsors</h2>
          <div className="h-1 w-20 bg-primary/50 mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  if (error || sponsors.length === 0) return null;

  // Filter only active sponsors
  const activeSponsors = sponsors.filter(sponsor => sponsor.is_active);
  
  if (activeSponsors.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-secondary/20 to-background">
      <div className="container mx-auto text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Handshake className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold">Our Sponsors</h2>
        </div>
        <div className="h-1 w-24 bg-primary mx-auto rounded-full mb-4"></div>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg">
          We're grateful to these amazing organizations who support innovation and help our community thrive
        </p>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
          {activeSponsors.map(sponsor => (
            <HoverCard key={sponsor.id}>
              <HoverCardTrigger asChild>
                <Link 
                  to={sponsor.website_url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div className="bg-card dark:bg-gray-800/60 h-36 p-5 rounded-xl shadow-sm border border-border/40 
                    transition-all duration-300 flex flex-col items-center justify-center
                    hover:shadow-md hover:scale-105 hover:border-primary/30 group-hover:bg-white dark:group-hover:bg-gray-800">
                    <img 
                      src={sponsor.logo_url || '/placeholder.svg'} 
                      alt={sponsor.company_name} 
                      className="max-h-20 max-w-full object-contain opacity-85 
                      transition-all duration-300 group-hover:opacity-100"
                    />
                    <div className="flex items-center justify-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground">
                      <span>Visit website</span>
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </div>
                  </div>
                </Link>
              </HoverCardTrigger>
              <HoverCardContent className="w-auto p-3 shadow-lg border border-border/60">
                <div className="text-center">
                  <p className="font-semibold text-foreground">{sponsor.company_name}</p>
                  {sponsor.description && (
                    <p className="text-xs text-muted-foreground mt-1">{sponsor.description}</p>
                  )}
                  {sponsor.website_url && (
                    <p className="text-xs text-primary mt-1 truncate hover:underline">
                      <a href={sponsor.website_url} target="_blank" rel="noopener noreferrer">
                        {sponsor.website_url.replace(/(^\w+:|^)\/\//, '')}
                      </a>
                    </p>
                  )}
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </div>
    </section>
  );
};
