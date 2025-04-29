import React from "react";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { SocialLinksForm, type SocialLinksValues } from "./SocialLinksForm";
import { NotificationsForm, type NotificationValues } from "./NotificationsForm";
import { PrivacyForm, type PrivacyValues } from "./PrivacyForm";
import { PasswordForm, type PasswordValues } from "./PasswordForm";
import { User } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserCircle, 
  Link as LinkIcon, 
  Bell, 
  ShieldCheck, 
  Key
} from "lucide-react";

interface ProfileTabContentProps {
  activeTab: string;
  user: User | null;
  isSubmitting: boolean;
  isUploading: boolean;
  avatarChanged: boolean;
  onPersonalSubmit: (data: any) => Promise<void>;
  onSocialSubmit: (data: SocialLinksValues) => Promise<void>;
  onNotificationSubmit: (data: NotificationValues) => Promise<void>;
  onPrivacySubmit: (data: PrivacyValues) => Promise<void>;
  onPasswordSubmit: (data: PasswordValues) => Promise<void>;
  onCancel: () => void;
  socialFormDefaults: SocialLinksValues;
  notificationFormDefaults: NotificationValues;
  privacyFormDefaults: PrivacyValues;
  passwordFormReset: () => void;
}

const fadeAnimation = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.2 }
};

export function ProfileTabContent({
  activeTab,
  user,
  isSubmitting,
  isUploading,
  avatarChanged,
  onPersonalSubmit,
  onSocialSubmit,
  onNotificationSubmit,
  onPrivacySubmit,
  onPasswordSubmit,
  onCancel,
  socialFormDefaults,
  notificationFormDefaults,
  privacyFormDefaults,
  passwordFormReset
}: ProfileTabContentProps) {
  
  const getTabIcon = () => {
    switch(activeTab) {
      case "personal": return <UserCircle className="h-6 w-6 dark:text-white" />;
      case "social": return <LinkIcon className="h-6 w-6 dark:text-white" />;
      case "notifications": return <Bell className="h-6 w-6 dark:text-white" />;
      case "privacy": return <ShieldCheck className="h-6 w-6 dark:text-white" />;
      case "password": return <Key className="h-6 w-6 dark:text-white" />;
      default: return null;
    }
  };
  
  const getTabDetails = () => {
    switch(activeTab) {
      case "personal":
        return {
          title: "Personal Information",
          description: "Update your personal details and profile information."
        };
      case "social":
        return {
          title: "Social Media Links",
          description: "Connect your social media accounts to your profile."
        };
      case "notifications":
        return {
          title: "Notification Preferences",
          description: "Choose how you want to receive notifications."
        };
      case "privacy":
        return {
          title: "Privacy Settings",
          description: "Control your privacy and data sharing preferences."
        };
      case "password":
        return {
          title: "Change Password",
          description: "Update your password to maintain account security."
        };
      default:
        return {
          title: "",
          description: ""
        };
    }
  };

  const { title, description } = getTabDetails();
  
  return (
    <div className="bg-white dark:bg-gray-800/70 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden h-full">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-white">
              {getTabIcon()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeAnimation}
            className="min-h-[400px]"
          >
            {activeTab === "personal" && (
              <PersonalInfoForm 
                user={user}
                isSubmitting={isSubmitting}
                onSubmit={onPersonalSubmit}
                onCancel={onCancel}
                avatarChanged={avatarChanged}
                isUploading={isUploading}
              />
            )}
            
            {activeTab === "social" && (
              <SocialLinksForm
                defaultValues={socialFormDefaults}
                isSubmitting={isSubmitting}
                onSubmit={onSocialSubmit}
              />
            )}
            
            {activeTab === "notifications" && (
              <NotificationsForm
                defaultValues={notificationFormDefaults}
                isSubmitting={isSubmitting}
                onSubmit={onNotificationSubmit}
              />
            )}
            
            {activeTab === "privacy" && (
              <PrivacyForm
                defaultValues={privacyFormDefaults}
                isSubmitting={isSubmitting}
                onSubmit={onPrivacySubmit}
              />
            )}
            
            {activeTab === "password" && (
              <PasswordForm
                isSubmitting={isSubmitting}
                onSubmit={onPasswordSubmit}
                onCancel={passwordFormReset}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
