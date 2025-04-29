
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Mail, Send, Calendar, Users } from "lucide-react";
import { Card } from "../ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Import the logo
import universityLogo from "/lovable-uploads/c85d2794-e9f3-4d6a-bf35-8563a6ca4813.png";

// Define the type for contactInfo
interface ContactInfo {
  email: string;
  linkedin: string;
  instagram: string;
  twitter: string;
  whatsapp: string;
  phone: string;
  [key: string]: string; // Allow for additional properties
}

export const Contact = () => {
  const { toast } = useToast();
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: '',
    linkedin: '',
    instagram: '',
    twitter: '',
    whatsapp: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('site_config')
          .select('config_key, config_value')
          .in('config_key', ['email', 'linkedin', 'instagram', 'twitter', 'whatsapp', 'phone']);

        if (error) throw error;

        const configMap: Record<string, string> = {};
        data.forEach(item => {
          configMap[item.config_key] = item.config_value || '';
        });

        setContactInfo({
          email: configMap.email || '',
          linkedin: configMap.linkedin || '',
          instagram: configMap.instagram || '',
          twitter: configMap.twitter || '',
          whatsapp: configMap.whatsapp || '',
          phone: configMap.phone || ''
        });
      } catch (error) {
        console.error('Error fetching contact info:', error);
        toast({
          title: 'Error',
          description: 'Failed to load contact information',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, [toast]);

  return (
    <section id="contact" className="section-padding">
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Content Column */}
          <div className="lg:col-span-5 opacity-0 animate-slide-in">
            <div className="flex items-center mb-6">
              <img 
                src={universityLogo} 
                alt="SR University Startup Club" 
                className="h-12 mr-3" 
              />
              <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                Get Involved
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join the Innovation Community
            </h2>
            <p className="text-lg text-foreground/80 mb-8">
              Whether you have a startup idea, want to join a team, or just want to learn more about entrepreneurship, 
              we'd love to hear from you. Fill out the form or reach out directly.
            </p>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="rounded-full bg-primary/10 p-2 mr-4">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Weekly Meetings</h3>
                  <p className="text-foreground/70">Every Wednesday, 6:00 PM - Innovation Hub, Room 204</p>
                </div>
              </div>
              
              {contactInfo.email && (
                <div className="flex items-start">
                  <div className="rounded-full bg-primary/10 p-2 mr-4">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Email Us</h3>
                    <p className="text-foreground/70">{contactInfo.email}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start">
                <div className="rounded-full bg-primary/10 p-2 mr-4">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Social Media</h3>
                  <div className="flex space-x-4 mt-2">
                    {contactInfo.linkedin && (
                      <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-primary transition-colors">LinkedIn</a>
                    )}
                    {contactInfo.instagram && (
                      <a href={contactInfo.instagram} target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-primary transition-colors">Instagram</a>
                    )}
                    {contactInfo.twitter && (
                      <a href={contactInfo.twitter} target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-primary transition-colors">Twitter</a>
                    )}
                    {contactInfo.whatsapp && (
                      <a href={contactInfo.whatsapp} target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-primary transition-colors">WhatsApp</a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7 opacity-0 animate-fade-in-blur" style={{ animationDelay: "300ms" }}>
            <Card variant="glass" className="relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 bg-primary/10 rounded-full blur-2xl"></div>
              <div className="relative p-8">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-3 rounded-lg border border-border bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-3 rounded-lg border border-border bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        placeholder="Your email address"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="interest" className="block text-sm font-medium mb-2">
                      I'm interested in
                    </label>
                    <select
                      id="interest"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    >
                      <option>Joining the club</option>
                      <option>Pitching my startup idea</option>
                      <option>Attending an event</option>
                      <option>Mentorship opportunities</option>
                      <option>Other (please specify)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                      placeholder="Tell us about your interest or idea..."
                    ></textarea>
                  </div>
                  <div>
                    <Button className="w-full md:w-auto group">
                      Send Message
                      <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
