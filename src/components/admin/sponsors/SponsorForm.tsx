
import React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sponsor } from '@/lib/types';
import { useSponsorLogoUpload } from '@/hooks/useSponsorLogoUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Upload } from 'lucide-react';

// Simplified schema removing tier_id
const sponsorFormSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  website_url: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  logo_url: z.string().optional(),
  is_active: z.boolean().default(true)
});

type SponsorFormValues = z.infer<typeof sponsorFormSchema>;

interface SponsorFormProps {
  sponsor?: Sponsor;
  onSubmit: (data: SponsorFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function SponsorForm({ sponsor, onSubmit, isSubmitting }: SponsorFormProps) {
  const [logoPreview, setLogoPreview] = React.useState<string | null>(sponsor?.logo_url || null);
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  
  const { uploadLogo, isUploading } = useSponsorLogoUpload();
  
  const defaultValues: Partial<SponsorFormValues> = {
    company_name: sponsor?.company_name || '',
    website_url: sponsor?.website_url || '',
    logo_url: sponsor?.logo_url || '',
    is_active: sponsor?.is_active !== undefined ? sponsor.is_active : true,
  };

  const form = useForm<SponsorFormValues>({
    resolver: zodResolver(sponsorFormSchema),
    defaultValues,
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLogoFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (data: SponsorFormValues) => {
    let finalData = { ...data };
    
    if (logoFile) {
      const logoUrl = await uploadLogo(logoFile);
      if (logoUrl) {
        finalData.logo_url = logoUrl;
      }
    }
    
    await onSubmit(finalData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name*</FormLabel>
              <FormControl>
                <Input placeholder="Enter company name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="website_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <FormLabel>Logo*</FormLabel>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center space-y-4">
                {logoPreview ? (
                  <div className="w-48 h-32 flex items-center justify-center p-2 border rounded-md bg-card">
                    <img 
                      src={logoPreview} 
                      alt="Logo Preview" 
                      className="max-w-full max-h-full object-contain" 
                    />
                  </div>
                ) : (
                  <div className="w-48 h-32 flex items-center justify-center p-2 border rounded-md bg-muted/20">
                    <p className="text-muted-foreground text-sm">Upload a company logo</p>
                  </div>
                )}
                
                <div className="flex items-center w-full">
                  <input
                    type="file"
                    id="logo-upload"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                  <label htmlFor="logo-upload" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={isUploading}
                      type="button"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      {logoPreview ? "Change Logo" : "Upload Logo"}
                    </Button>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Button type="submit" className="w-full" disabled={isSubmitting || isUploading}>
          {isSubmitting || isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {sponsor ? "Updating..." : "Add Sponsor"}
            </>
          ) : (
            <>{sponsor ? "Update Sponsor" : "Add Sponsor"}</>
          )}
        </Button>
      </form>
    </Form>
  );
}
