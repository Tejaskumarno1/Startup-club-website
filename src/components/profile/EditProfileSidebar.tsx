
import React from "react";
import { User } from "@/lib/types";
import { 
  UserCircle, 
  Link as LinkIcon, 
  Bell, 
  ShieldCheck, 
  Key,
  ChevronRight,
  Camera
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EditProfileSidebarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAvatarChange: (file: File) => void;
  isUploading: boolean;
}

export function EditProfileSidebar({ 
  user, 
  activeTab, 
  setActiveTab,
  onAvatarChange,
  isUploading
}: EditProfileSidebarProps) {
  
  const tabs = [
    { id: "personal", label: "Personal Info", icon: <UserCircle className="h-5 w-5" /> },
    { id: "social", label: "Social Links", icon: <LinkIcon className="h-5 w-5" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="h-5 w-5" /> },
    { id: "privacy", label: "Privacy", icon: <ShieldCheck className="h-5 w-5" /> },
    { id: "password", label: "Password", icon: <Key className="h-5 w-5" /> }
  ];
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAvatarChange(e.target.files[0]);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden h-full">
      {/* Profile photo section */}
      <div className="relative">
        {/* Banner background */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        
        {/* Avatar */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 w-32 h-32">
          <div className="relative w-32 h-32 rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow-lg group">
            {user?.photo_url ? (
              <img 
                src={user.photo_url} 
                alt={`${user.first_name} ${user.last_name}`}
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-2xl font-medium">
                {user?.first_name?.[0] || ''}{user?.last_name?.[0] || ''}
              </div>
            )}
            
            {/* Upload overlay */}
            <label 
              className={cn(
                "absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity",
                isUploading && "opacity-100 cursor-wait"
              )}
            >
              {isUploading ? (
                <div className="flex flex-col items-center text-white gap-2">
                  <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-medium">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-white gap-1">
                  <Camera className="h-6 w-6" />
                  <span className="text-xs font-medium">Change Photo</span>
                </div>
              )}
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileChange} 
                accept="image/*"
                disabled={isUploading}
              />
            </label>
          </div>
        </div>
      </div>
      
      {/* User info */}
      <div className="pt-20 pb-4 px-4 text-center">
        <h3 className="font-semibold text-lg text-gray-800 truncate">
          {user?.first_name} {user?.last_name}
        </h3>
        {user?.email && (
          <p className="text-sm text-gray-500 truncate mt-1 max-w-full">
            {user.email}
          </p>
        )}
      </div>
      
      {/* Navigation */}
      <div className="px-3 py-3">
        <p className="text-xs font-medium text-gray-500 px-3 mb-2">PROFILE SETTINGS</p>
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all",
                activeTab === tab.id 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-1.5 rounded-md",
                  activeTab === tab.id ? "bg-blue-100" : "bg-gray-100"
                )}>
                  {React.cloneElement(tab.icon, { 
                    className: cn(
                      "h-4 w-4",
                      activeTab === tab.id ? "text-blue-700" : "text-gray-600"
                    )
                  })}
                </div>
                <span className="font-medium text-sm">{tab.label}</span>
              </div>
              <ChevronRight className={cn(
                "h-4 w-4 transition-transform",
                activeTab === tab.id ? "text-blue-600 rotate-90" : "text-gray-400"
              )} />
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
