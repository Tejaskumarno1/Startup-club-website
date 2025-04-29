
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "@/lib/types";
import { Save, X, Loader2 } from "lucide-react";

const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters").optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional().or(z.literal("")),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional().or(z.literal("")),
  profession: z.string().optional().or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  birthday: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  language: z.string().optional().or(z.literal("")),
});

type PersonalInfoValues = z.infer<typeof personalInfoSchema>;

interface PersonalInfoFormProps {
  user: User | null;
  isSubmitting: boolean;
  onSubmit: (data: PersonalInfoValues) => Promise<void>;
  onCancel: () => void;
  avatarChanged: boolean;
  isUploading: boolean;
}

export function PersonalInfoForm({ 
  user, 
  isSubmitting, 
  onSubmit, 
  onCancel,
  avatarChanged,
  isUploading
}: PersonalInfoFormProps) {
  const [bioLength, setBioLength] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Define form with validation schema
  const form = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: user?.first_name || "",
      lastName: user?.last_name || "",
      username: user?.username || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
      profession: user?.profession || "",
      company: user?.company || "",
      location: user?.location || "",
      birthday: user?.birthday || "",
      gender: user?.gender || "",
      language: user?.language || "English",
    },
    mode: "onChange",
  });

  // Listen for form value changes to detect modifications
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (type === "change") {
        setHasChanges(true);
      }
      
      // Update bio character count
      if (name === "bio") {
        setBioLength(value.bio?.length || 0);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        profession: user.profession || "",
        company: user.company || "",
        location: user.location || "",
        birthday: user.birthday || "",
        gender: user.gender || "",
        language: user.language || "English",
      });
      setBioLength(user.bio?.length || 0);
      setHasChanges(false);
    }
  }, [user, form]);

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges || avatarChanged) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasChanges, avatarChanged]);

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-6 animate-fade-in"
        aria-label="Personal information form"
      >
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Complete your profile information to help others connect with you. Fields marked with * are required.
          </p>
        </div>
        
        <div className="bg-muted/30 rounded-lg p-5 border border-border/60">
          <h3 className="font-medium text-base mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    First Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your first name" 
                      {...field} 
                      className="transition-all focus:border-primary" 
                      aria-required="true"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Last Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your last name" 
                      {...field} 
                      className="transition-all focus:border-primary"
                      aria-required="true"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="bg-muted/30 rounded-lg p-5 border border-border/60">
          <h3 className="font-medium text-base mb-4">Account Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Username</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Choose a username" 
                      {...field} 
                      className="transition-all focus:border-primary"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Your unique username for your profile URL
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your email" 
                      {...field} 
                      disabled 
                      className="bg-muted/50 cursor-not-allowed"
                      aria-readonly="true"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Email cannot be changed. Contact support for assistance.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your phone number" 
                      {...field} 
                      type="tel"
                      className="transition-all focus:border-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Location</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="City, Country" 
                      {...field}
                      className="transition-all focus:border-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="bg-muted/30 rounded-lg p-5 border border-border/60">
          <h3 className="font-medium text-base mb-4">Professional Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <FormField
              control={form.control}
              name="profession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Profession</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your profession" 
                      {...field}
                      className="transition-all focus:border-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Company</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your company" 
                      {...field}
                      className="transition-all focus:border-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel className="text-sm font-medium">About Me</FormLabel>
                  <span className={`text-xs ${bioLength > 450 ? (bioLength > 500 ? 'text-destructive' : 'text-amber-500') : 'text-muted-foreground'}`}>
                    {bioLength}/500
                  </span>
                </div>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us about yourself" 
                    className="min-h-[120px] resize-y transition-all focus:border-primary" 
                    {...field} 
                    onChange={e => {
                      field.onChange(e);
                      setBioLength(e.target.value.length);
                    }}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Brief description for your profile. Maximum 500 characters.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-border/50">
          <div className="flex items-center space-x-2">
            {(hasChanges || avatarChanged) && (
              <p className="text-xs text-amber-500">You have unsaved changes</p>
            )}
          </div>
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="gap-1"
              disabled={isSubmitting || isUploading}
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || isUploading || (!hasChanges && !avatarChanged)}
              className="min-w-[120px] gap-1 relative overflow-hidden group"
              aria-busy={isSubmitting || isUploading}
            >
              {isSubmitting || isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isUploading ? "Uploading..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
              <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 bg-primary-foreground/10 transition-transform duration-300"></span>
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
