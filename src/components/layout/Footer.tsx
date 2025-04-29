
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Facebook, Github, Instagram, Twitter, Linkedin, Mail, Phone, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const footerLinks = [
  {
    title: "Resources",
    links: [
      { label: "Startup Guides", href: "#startup-guides" },
      { label: "Templates", href: "#templates" },
      { label: "Funding", href: "#funding" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Programs",
    links: [
      { label: "Incubation", href: "#incubation" },
      { label: "Mentorship", href: "#mentorship" },
      { label: "Workshops", href: "#workshops" },
      { label: "Competitions", href: "#competitions" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Forums", href: "#forums" },
      { label: "Members", href: "#members" },
      { label: "Success Stories", href: "#success-stories" },
      { label: "Partners", href: "#partners" },
    ],
  },
];

// Define the type for socialLinks
interface SocialLinks {
  twitter: string;
  instagram: string;
  linkedin: string;
  facebook: string;
  github: string;
  whatsapp: string;
  email: string;
  phone: string;
  [key: string]: string; // Allow for additional properties
}

export const Footer = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    twitter: '',
    instagram: '',
    linkedin: '',
    facebook: '',
    github: '',
    whatsapp: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const { data, error } = await supabase
          .from('site_config')
          .select('config_key, config_value')
          .in('config_key', ['twitter', 'instagram', 'linkedin', 'facebook', 'github', 'whatsapp', 'email', 'phone']);

        if (error) throw error;

        const configMap: Record<string, string> = {};
        data.forEach(item => {
          configMap[item.config_key] = item.config_value || '';
        });

        setSocialLinks({
          twitter: configMap.twitter || '',
          instagram: configMap.instagram || '',
          linkedin: configMap.linkedin || '',
          facebook: configMap.facebook || '',
          github: configMap.github || '',
          whatsapp: configMap.whatsapp || '',
          email: configMap.email || '',
          phone: configMap.phone || ''
        });
      } catch (error) {
        console.error('Error fetching social links:', error);
      }
    };

    fetchSocialLinks();
  }, []);

  // Create dynamic social links based on what's available in the database
  const dynamicSocialLinks = [
    { icon: Twitter, href: socialLinks.twitter, label: "Twitter", available: !!socialLinks.twitter },
    { icon: Facebook, href: socialLinks.facebook, label: "Facebook", available: !!socialLinks.facebook },
    { icon: Instagram, href: socialLinks.instagram, label: "Instagram", available: !!socialLinks.instagram },
    { icon: Linkedin, href: socialLinks.linkedin, label: "LinkedIn", available: !!socialLinks.linkedin },
    { icon: Github, href: socialLinks.github, label: "GitHub", available: !!socialLinks.github },
    { icon: MessageSquare, href: socialLinks.whatsapp, label: "WhatsApp", available: !!socialLinks.whatsapp }
  ].filter(link => link.available);

  return (
    <footer className="bg-secondary/30 pt-16 pb-8 w-full">
      <div className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-4">
            <a href="#" className="text-2xl font-bold inline-block mb-4">
              <span className="text-primary">Startup</span>
              <span>.Club</span>
            </a>
            <p className="text-foreground/70 mb-6 max-w-md">
              Empowering student entrepreneurs through resources, mentorship, and networking opportunities to build successful startups.
            </p>
            <div className="flex space-x-4">
              {dynamicSocialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-background flex items-center justify-center text-foreground/70 hover:text-primary hover:bg-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-8">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h3 className="font-medium mb-4">{group.title}</h3>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-foreground/70 hover:text-primary transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Column */}
          <div className="md:col-span-2">
            <h3 className="font-medium mb-4">Contact Us</h3>
            <div className="space-y-4">
              {socialLinks.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 opacity-70" />
                  <a href={`mailto:${socialLinks.email}`} className="text-sm text-foreground/70 hover:text-primary transition-colors">
                    {socialLinks.email}
                  </a>
                </div>
              )}
              
              {socialLinks.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 opacity-70" />
                  <a href={`tel:${socialLinks.phone}`} className="text-sm text-foreground/70 hover:text-primary transition-colors">
                    {socialLinks.phone}
                  </a>
                </div>
              )}
              
              {/* Newsletter subscription form */}
              <div className="pt-4">
                <p className="text-foreground/70 mb-2 text-sm">Subscribe to our newsletter</p>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="px-3 py-1.5 rounded-l-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white/50 w-full text-sm"
                  />
                  <Button className="rounded-l-none bg-primary hover:bg-primary/80 py-1.5 px-3 text-sm h-auto">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-foreground/60">
            © {new Date().getFullYear()} SR University Startup Club. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-sm text-foreground/60 hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-foreground/60 hover:text-primary transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
