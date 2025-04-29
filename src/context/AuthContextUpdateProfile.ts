
import { User } from "@/lib/types";
import { updateUserProfile } from "@/lib/profileHelpers";
import { useAuth } from "./AuthContext";

// Update your existing updateProfile function to use the helper:
export const useUpdateProfile = () => {
  const { user } = useAuth();
  
  const updateProfile = async (userData: Partial<User>) => {
    if (!user) {
      return { success: false, error: new Error("User not authenticated") };
    }
    
    return updateUserProfile(user.id, userData);
  };

  return { updateProfile };
};
