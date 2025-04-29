
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LogoUploader } from "@/components/startups/LogoUploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  name: z.string().min(1, "Startup name is required"),
  description: z.string().optional(),
  industry: z.string().optional(),
  website_url: z.string().url("Please enter a valid URL").or(z.string().length(0)).optional(),
  logo_url: z.string().optional(),
  founder_id: z.string().optional(),
  team_size: z.number().int().min(1).optional().or(z.string().transform(val => val === "" ? undefined : parseInt(val, 10))),
  funding_stage: z.string().optional(),
  founding_date: z.string().optional(),
  is_featured: z.boolean().default(false).optional(),
  linkedin_url: z.string().url("Please enter a valid LinkedIn URL").or(z.string().length(0)).optional(),
  instagram_url: z.string().url("Please enter a valid Instagram URL").or(z.string().length(0)).optional(),
  twitter_url: z.string().url("Please enter a valid Twitter URL").or(z.string().length(0)).optional(),
  github_url: z.string().url("Please enter a valid GitHub URL").or(z.string().length(0)).optional(),
});

export type StartupFormValues = z.infer<typeof formSchema>;

interface StartupFormProps {
  onSubmit: (data: StartupFormValues) => void;
  initialData?: StartupFormValues;
  isLoading?: boolean;
  error?: string | null;
}

const industryOptions = [
  "Technology",
  "FinTech",
  "HealthTech",
  "EdTech",
  "E-commerce",
  "SaaS",
  "AI/ML",
  "CleanTech",
  "Biotech",
  "Other"
];

const fundingOptions = [
  "Pre-seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C+",
  "Bootstrapped",
  "Grant-funded",
  "Acquired"
];

export function StartupForm({ onSubmit, initialData, isLoading = false, error = null }: StartupFormProps) {
  // Initialize the form with defaultValues properly handling the initialData
  const form = useForm<StartupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      industry: initialData?.industry || "",
      website_url: initialData?.website_url || "",
      logo_url: initialData?.logo_url || "",
      team_size: initialData?.team_size,
      funding_stage: initialData?.funding_stage || "",
      founding_date: initialData?.founding_date || "",
      is_featured: initialData?.is_featured || false,
      linkedin_url: initialData?.linkedin_url || "",
      instagram_url: initialData?.instagram_url || "",
      twitter_url: initialData?.twitter_url || "",
      github_url: initialData?.github_url || "",
      founder_id: initialData?.founder_id || "",
    },
  });

  // Console log the initial data and form values for debugging
  console.log("StartupForm initialData:", initialData);
  console.log("StartupForm defaultValues:", form.getValues());

  const handleLogoUploaded = (url: string) => {
    form.setValue("logo_url", url);
  };

  const handleSubmit = (data: StartupFormValues) => {
    console.log("Form submitting data:", data);
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left column - Logo upload */}
              <div className="flex flex-col items-center">
                <FormField
                  control={form.control}
                  name="logo_url"
                  render={({ field }) => (
                    <FormItem className="w-full flex flex-col items-center">
                      <FormLabel className="mb-2">Logo</FormLabel>
                      <LogoUploader 
                        onImageUploaded={handleLogoUploaded} 
                        existingImageUrl={field.value}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Middle and right columns - Startup details */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Startup Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter startup name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {industryOptions.map(industry => (
                              <SelectItem key={industry} value={industry}>
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="funding_stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Funding Stage</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select funding stage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fundingOptions.map(option => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="team_size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Size</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Number of team members"
                            min={1}
                            {...field}
                            onChange={e => field.onChange(e.target.value === "" ? "" : parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <FormField
                    control={form.control}
                    name="founding_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Founded Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of the startup"
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="social" className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="linkedin_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/company/your-startup" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="twitter_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://twitter.com/your-startup" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="instagram_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://instagram.com/your-startup" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="github_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/your-startup" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Spinner className="mr-2" size="sm" /> : null}
            {initialData ? "Update Startup" : "Add Startup"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
