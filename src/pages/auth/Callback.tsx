
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          throw error;
        }
        
        const session = data?.session;
        
        if (session) {
          toast({
            title: "Successfully authenticated",
            description: "You are now logged in.",
          });
          
          navigate("/dashboard");
        } else {
          // No session found
          console.error("No session found in callback");
          toast({
            title: "Authentication failed",
            description: "Could not complete the authentication process.",
            variant: "destructive",
          });
          
          navigate("/auth/login");
        }
      } catch (error) {
        console.error("Error handling auth callback:", error);
        toast({
          title: "Authentication error",
          description: "An error occurred during authentication.",
          variant: "destructive",
        });
        
        navigate("/auth/login");
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-r-transparent mb-4"></div>
        <h2 className="text-xl font-medium">Completing authentication...</h2>
        <p className="text-muted-foreground">Please wait while we finish logging you in.</p>
      </div>
    </div>
  );
}
