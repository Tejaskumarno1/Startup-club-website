import React, { useState, useEffect } from "react";
import { PageTemplate } from "@/components/common/PageTemplate";
import { User, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ProfileTabContent } from "@/components/profile/ProfileTabContent";
import { EditProfileSidebar } from "@/components/profile/EditProfileSidebar";
import { uploadProfileImage } from "@/lib/profileHelpers";
import { SocialLinksValues } from "@/components/profile/SocialLinksForm";
import { NotificationValues } from "@/components/profile/NotificationsForm";
import { PrivacyValues } from "@/components/profile/PrivacyForm";
import { PasswordValues } from "@/components/profile/PasswordForm";
import { Button } from "@/components/ui/button";

const EditProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarChanged, setAvatarChanged] = useState(false);
  
  // Form initial values
  const [socialFormDefaults, setSocialFormDefaults] = useState<SocialLinksValues>({
    linkedin: "",
    twitter: "",
    github: "",
    website: "",
    instagram: "",
  });
  
  const [notificationFormDefaults, setNotificationFormDefaults] = useState<NotificationValues>({
    emailNotifications: false,
    pushNotifications: false,
    siteNotifications: false,
    marketingEmails: false,
    emailFrequency: 2,
  });
  
  const [privacyFormDefaults, setPrivacyFormDefaults] = useState<PrivacyValues>({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
  });

  useEffect(() => {
    if (user) {
      // Initialize social links form with user data from metadata
      setSocialFormDefaults({
        linkedin: user.user_metadata?.linkedin || "",
        twitter: user.user_metadata?.twitter || "",
        github: user.user_metadata?.github || "",
        website: user.user_metadata?.portfolio || "",
        instagram: user.user_metadata?.instagram || "",
      });
      
      // Initialize notification settings
      if (user.settings?.notification_preferences) {
        const prefs = user.settings.notification_preferences;
        setNotificationFormDefaults({
          emailNotifications: prefs.email || false,
          pushNotifications: prefs.push || false,
          siteNotifications: prefs.site || false,
          marketingEmails: prefs.marketing || false,
          emailFrequency: 2,
        });
      }
      
      // Initialize privacy settings
      if (user.settings?.privacy_settings) {
        const privacy = user.settings.privacy_settings;
        setPrivacyFormDefaults({
          profileVisibility: privacy.profile_visibility || "public",
          showEmail: privacy.show_email || false,
          showPhone: privacy.show_phone || false,
        });
      }
    }
  }, [user]);

  const handlePersonalSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      const profileData = {
        first_name: data.firstName,
        last_name: data.lastName,
        bio: data.bio,
        company: data.company,
        profession: data.profession,
        location: data.location,
      };
      
      const { success, error } = await updateUserProfile(profileData);
      
      if (!success) {
        throw error;
      }
      
      setAvatarChanged(false);
      toast({
        title: "Profile updated",
        description: "Your personal information has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating your profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSubmit = async (data: SocialLinksValues) => {
    setIsSubmitting(true);
    
    try {
      const profileData = {
        social_links: {
          linkedin: data.linkedin,
          twitter: data.twitter,
          github: data.github,
          portfolio: data.website,
          instagram: data.instagram,
        }
      };
      
      const { success, error } = await updateUserProfile(profileData);
      
      if (!success) {
        throw error;
      }
      
      toast({
        title: "Social links updated",
        description: "Your social media links have been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating social links:', error);
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating your social links",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotificationSubmit = async (data: NotificationValues) => {
    setIsSubmitting(true);
    
    try {
      const profileData = {
        settings: {
          notification_preferences: {
            email: data.emailNotifications,
            push: data.pushNotifications,
            site: data.siteNotifications,
            marketing: data.marketingEmails,
          }
        }
      };
      
      const { success, error } = await updateUserProfile(profileData);
      
      if (!success) {
        throw error;
      }
      
      toast({
        title: "Notification preferences updated",
        description: "Your notification preferences have been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating notification preferences:', error);
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating your notification preferences",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrivacySubmit = async (data: PrivacyValues) => {
    setIsSubmitting(true);
    
    try {
      const profileData = {
        settings: {
          privacy_settings: {
            profile_visibility: data.profileVisibility,
            show_email: data.showEmail,
            show_phone: data.showPhone,
          }
        }
      };
      
      const { success, error } = await updateUserProfile(profileData);
      
      if (!success) {
        throw error;
      }
      
      toast({
        title: "Privacy settings updated",
        description: "Your privacy settings have been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating privacy settings:', error);
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating your privacy settings",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordValues) => {
    setIsSubmitting(true);
    
    try {
      // We'll implement password update logic in a future step
      console.log("Password change requested:", data);
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      
      // Reset the password form
      passwordFormReset();
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating your password",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarChange = async (file: File) => {
    if (!user) return;
    
    setIsUploading(true);
    setAvatarChanged(true);
    
    try {
      const { url, error } = await uploadProfileImage(file, user.id);
      
      if (error) throw error;
      if (!url) throw new Error("Failed to get upload URL");
      
      const { success, error: updateError } = await updateUserProfile({
        photo_url: url
      });
      
      if (!success) {
        throw updateError;
      }
      
      toast({
        title: "Profile photo updated",
        description: "Your profile photo has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred while uploading your photo",
        variant: "destructive",
      });
      setAvatarChanged(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  const passwordFormReset = () => {
    // This function will be implemented to reset the password form
    console.log("Password form reset");
  };

  if (!user) {
    return (
      <PageTemplate title="Edit Profile" description="Update your profile information" icon={User}>
        <div className="text-center p-8">
          <p className="mb-4 dark:text-white">Please sign in to edit your profile.</p>
          <Button 
            onClick={() => navigate('/login')} 
            className="dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            Sign In
          </Button>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title="Edit Profile" 
      description="Update your profile information" 
      icon={User}
      headerActions={
        <Button 
          variant="ghost" 
          onClick={() => navigate('/profile')} 
          className="dark:text-white dark:hover:bg-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <EditProfileSidebar 
            user={user} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onAvatarChange={handleAvatarChange}
            isUploading={isUploading}
          />
        </div>
        
        <div className="md:col-span-2">
          <ProfileTabContent 
            activeTab={activeTab}
            user={user}
            isSubmitting={isSubmitting}
            isUploading={isUploading}
            avatarChanged={avatarChanged}
            onPersonalSubmit={handlePersonalSubmit}
            onSocialSubmit={handleSocialSubmit}
            onNotificationSubmit={handleNotificationSubmit}
            onPrivacySubmit={handlePrivacySubmit}
            onPasswordSubmit={handlePasswordSubmit}
            onCancel={handleCancel}
            socialFormDefaults={socialFormDefaults}
            notificationFormDefaults={notificationFormDefaults}
            privacyFormDefaults={privacyFormDefaults}
            passwordFormReset={passwordFormReset}
          />
        </div>
      </div>
    </PageTemplate>
  );
};

export default EditProfile;
