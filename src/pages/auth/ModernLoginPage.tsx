
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { LucideLoader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Spline from '@splinetool/react-spline';
import { motion } from "framer-motion";

// Form validation schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

type LoginFormValues = z.infer<typeof loginSchema>;

const ModernLoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, clearSession } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize form with zod resolver
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  // Reset session on component mount
  useEffect(() => {
    if (clearSession) {
      clearSession();
    }
  }, [clearSession]);

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const { success, error } = await signIn(values.email, values.password);
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome back! You are now logged in.",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Login failed",
          description: error?.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
      {/* Spline 3D background */}
      <div className="absolute inset-0 w-full h-full -z-10">
        {!splineLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <LucideLoader2 className="w-12 h-12 text-white animate-spin" />
          </div>
        )}
        <Spline 
          scene="https://prod.spline.design/MzcRY-1mvC8UsfFp/scene.splinecode" 
          onLoad={() => setSplineLoaded(true)}
          className="w-full h-full"
        />
      </div>

      {/* Animated floating elements */}
      <motion.div 
        className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-20"
        animate={{
          x: [0, 30, 0, -30, 0],
          y: [0, -30, -60, -30, 0],
          scale: [1, 1.1, 1, 0.9, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: '20%', right: '15%', filter: 'blur(40px)' }}
      />
      
      <motion.div 
        className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-20"
        animate={{
          x: [0, -20, 0, 20, 0],
          y: [0, 20, 40, 20, 0],
          scale: [1, 0.9, 1, 1.1, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        style={{ bottom: '15%', left: '10%', filter: 'blur(30px)' }}
      />
      
      <motion.div 
        className="absolute w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 opacity-30"
        animate={{
          x: [0, 40, 0, -40, 0],
          y: [0, -40, -80, -40, 0],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: '30%', left: '25%', filter: 'blur(20px)' }}
      />
      
      {/* Small animated circles */}
      <motion.div 
        className="absolute w-6 h-6 rounded-full bg-blue-400 opacity-60"
        animate={{
          x: [0, 15, 0, -15, 0],
          y: [0, 10, 20, 10, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ left: '30%', top: '60%', filter: 'blur(2px)' }}
      />
      
      <motion.div 
        className="absolute w-4 h-4 rounded-full bg-purple-400 opacity-80"
        animate={{
          x: [0, -10, 0, 10, 0],
          y: [0, -10, -20, -10, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ right: '35%', bottom: '30%', filter: 'blur(1px)' }}
      />
      
      {/* Login form */}
      <div className="w-full max-w-md px-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl">
            <CardHeader className="space-y-1">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <CardTitle className="text-2xl font-bold text-center text-white">Welcome Back</CardTitle>
                <CardDescription className="text-center text-gray-200">
                  Enter your credentials to access your account
                </CardDescription>
              </motion.div>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input 
                                placeholder="yourname@example.com" 
                                className="pl-10 bg-white/5 border border-white/10 text-white placeholder:text-gray-400" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-300" />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between">
                            <FormLabel className="text-gray-200">Password</FormLabel>
                            <Link to="/auth/reset-password" className="text-xs text-blue-300 hover:text-blue-200 transition-colors">
                              Forgot password?
                            </Link>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input 
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••" 
                                className="pl-10 pr-10 bg-white/5 border border-white/10 text-white placeholder:text-gray-400" 
                                {...field} 
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                                onClick={togglePasswordVisibility}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-300" />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-300 hover:shadow-lg" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </CardContent>
            
            <CardFooter className="flex justify-center">
              <motion.p 
                className="text-sm text-gray-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                Don't have an account?{" "}
                <Link to="/auth/signup" className="text-blue-300 hover:text-blue-200 transition-colors font-medium">
                  Sign up
                </Link>
              </motion.p>
            </CardFooter>
          </Card>

          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Link to="/" className="text-sm text-gray-300 hover:text-white transition-colors">
              Return to Home
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-4 left-4 text-xs text-white/50">
        3D Model via Spline
      </div>
    </div>
  );
};

export default ModernLoginPage;
