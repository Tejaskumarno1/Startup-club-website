
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { Bell, Mail, PanelRightOpen, Megaphone } from "lucide-react";

const notificationSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  siteNotifications: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  emailFrequency: z.number().min(0).max(3).default(2),
});

export type NotificationValues = z.infer<typeof notificationSchema>;

interface NotificationsFormProps {
  defaultValues: NotificationValues;
  isSubmitting: boolean;
  onSubmit: (data: NotificationValues) => Promise<void>;
}

export function NotificationsForm({ 
  defaultValues, 
  isSubmitting, 
  onSubmit 
}: NotificationsFormProps) {
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      ...defaultValues,
      emailFrequency: defaultValues.emailFrequency || 2
    },
  });

  const frequencyLabels = ["None", "Daily", "Weekly", "Real-time"];
  const frequencyValue = form.watch("emailFrequency");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <NotificationCard
              icon={<Mail className="h-5 w-5" />}
              title="Email Notifications"
              description="Receive important updates via email"
              name="emailNotifications"
              control={form.control}
            />
            
            <NotificationCard
              icon={<Bell className="h-5 w-5" />}
              title="Push Notifications"
              description="Receive real-time alerts on your devices"
              name="pushNotifications"
              control={form.control}
            />
            
            <NotificationCard
              icon={<PanelRightOpen className="h-5 w-5" />}
              title="Site Notifications"
              description="Receive in-app notifications while browsing"
              name="siteNotifications"
              control={form.control}
            />
            
            <NotificationCard
              icon={<Megaphone className="h-5 w-5" />}
              title="Marketing Emails"
              description="Receive promotional content and event announcements"
              name="marketingEmails"
              control={form.control}
            />
          </div>
          
          <div className="py-4">
            <div className="border-t border-gray-200"></div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-5 space-y-4">
            <div>
              <h3 className="text-base font-medium text-gray-800">Email Frequency</h3>
              <p className="text-sm text-gray-500 mt-1">Set how often you would like to receive email notifications</p>
            </div>
            
            <FormField
              control={form.control}
              name="emailFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-4">
                      <Slider
                        min={0}
                        max={3}
                        step={1}
                        value={[field.value]}
                        onValueChange={([value]) => field.onChange(value)}
                        className="my-5"
                      />
                      <div className="flex justify-between">
                        {frequencyLabels.map((label, index) => (
                          <div 
                            key={label} 
                            className={`text-xs font-medium cursor-pointer px-2 py-1 rounded ${
                              frequencyValue === index ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
                            }`}
                            onClick={() => field.onChange(index)}
                          >
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-6">
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
            className="bg-blue-600 hover:bg-blue-700 text-white"
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

interface NotificationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  name: "emailNotifications" | "pushNotifications" | "siteNotifications" | "marketingEmails";
  control: any;
}

function NotificationCard({ icon, title, description, name, control }: NotificationCardProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 shadow-sm hover:border-gray-300 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-blue-50 text-blue-600">
              {icon}
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-800">{title}</h4>
              <FormDescription className="text-xs mt-0.5">
                {description}
              </FormDescription>
            </div>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              className="data-[state=checked]:bg-blue-600"
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
