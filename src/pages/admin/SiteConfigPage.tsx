
import React, { useState, useEffect } from 'react';
import { AdminPageTemplate } from "@/components/admin/AdminPageTemplate";
import { Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const SiteConfigPage = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<{[key: string]: string}>({
    twitter: '',
    instagram: '',
    linkedin: '',
    whatsapp: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchSiteConfig();
  }, []);

  const fetchSiteConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('site_config')
        .select('*');
      
      if (error) throw error;

      const configMap: {[key: string]: string} = {};
      data.forEach(item => {
        configMap[item.config_key] = item.config_value || '';
      });

      setConfig(configMap);
    } catch (error) {
      console.error('Error fetching site config:', error);
      toast({
        title: 'Error',
        description: 'Failed to load site configuration',
        variant: 'destructive'
      });
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      const updatePromises = Object.entries(config).map(([key, value]) => 
        supabase
          .from('site_config')
          .update({ config_value: value })
          .eq('config_key', key)
      );

      const results = await Promise.all(updatePromises);
      
      const hasErrors = results.some(result => result.error);
      
      if (hasErrors) {
        throw new Error('Some updates failed');
      }

      toast({
        title: 'Success',
        description: 'Site configuration updated successfully'
      });
    } catch (error) {
      console.error('Error updating site config:', error);
      toast({
        title: 'Error',
        description: 'Failed to update site configuration',
        variant: 'destructive'
      });
    }
  };

  return (
    <AdminPageTemplate
      title="Site Configuration"
      description="Manage social media links and contact information"
      icon={Settings}
    >
      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Twitter</Label>
              <Input 
                value={config.twitter} 
                onChange={(e) => handleInputChange('twitter', e.target.value)}
                placeholder="Enter Twitter profile URL"
              />
            </div>
            <div>
              <Label>Instagram</Label>
              <Input 
                value={config.instagram} 
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                placeholder="Enter Instagram profile URL"
              />
            </div>
            <div>
              <Label>LinkedIn</Label>
              <Input 
                value={config.linkedin} 
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                placeholder="Enter LinkedIn profile URL"
              />
            </div>
            <div>
              <Label>WhatsApp</Label>
              <Input 
                value={config.whatsapp} 
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                placeholder="Enter WhatsApp contact number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input 
                value={config.email} 
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter club email address"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input 
                value={config.phone} 
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter contact phone number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave}>
          Save Configuration
        </Button>
      </div>
    </AdminPageTemplate>
  );
};

export default SiteConfigPage;
