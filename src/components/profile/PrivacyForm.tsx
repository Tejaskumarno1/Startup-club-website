
import React from "react";
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
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const privacySchema = z.object({
  profileVisibility: z.enum(["public", "members", "private"]).default("members"),
  showEmail: z.boolean().default(false),
  showPhone: z.boolean().default(false),
  showLocation: z.boolean().default(true),
});

export type PrivacyValues = z.infer<typeof privacySchema>;

interface PrivacyFormProps {
  defaultValues: PrivacyValues;
  isSubmitting: boolean;
  onSubmit: (data: PrivacyValues) => Promise<void>;
}

export function PrivacyForm({ 
  defaultValues, 
  isSubmitting, 
  onSubmit 
}: PrivacyFormProps) {
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(privacySchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base">Profile Visibility</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className={`border rounded-lg p-4 cursor-pointer transition ${
                  form.getValues("profileVisibility") === "public"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => form.setValue("profileVisibility", "public", { shouldDirty: true })}
              >
                <h3 className="font-medium mb-1">Public</h3>
                <p className="text-sm text-muted-foreground">
                  Anyone can view your profile.
                </p>
              </div>
              
              <div
                className={`border rounded-lg p-4 cursor-pointer transition ${
                  form.getValues("profileVisibility") === "members"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => form.setValue("profileVisibility", "members", { shouldDirty: true })}
              >
                <h3 className="font-medium mb-1">Members Only</h3>
                <p className="text-sm text-muted-foreground">
                  Only registered members can view your profile.
                </p>
              </div>
              
              <div
                className={`border rounded-lg p-4 cursor-pointer transition ${
                  form.getValues("profileVisibility") === "private"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => form.setValue("profileVisibility", "private", { shouldDirty: true })}
              >
                <h3 className="font-medium mb-1">Private</h3>
                <p className="text-sm text-muted-foreground">
                  Only you and admins can view your profile.
                </p>
              </div>
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="showEmail"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Show Email Address</FormLabel>
                  <FormDescription>
                    Allow others to see your email address on your profile.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="showPhone"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Show Phone Number</FormLabel>
                  <FormDescription>
                    Allow others to see your phone number on your profile.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="showLocation"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Show Location</FormLabel>
                  <FormDescription>
                    Allow others to see your location on your profile.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/profile")}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !form.formState.isDirty}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
