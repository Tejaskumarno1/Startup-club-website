import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { LucideLoader2, Mail, Lock, User, Phone, Fingerprint } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Spline from '@splinetool/react-spline';

// Form validation schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional()
});

const signupSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phoneNumber: z
    .string()
    .regex(/^\+91[0-9]{10}$/, { message: "Phone number must be in format +91XXXXXXXXXX" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  })
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

// Password strength indicator
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const getStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length > 8) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    return strength;
  };

  const strength = getStrength(password);
  
  return (
    <div className="mt-1">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div 
          className={`h-full ${
            strength === 0 ? 'w-0' : 
            strength === 1 ? 'w-1/4 bg-red-500' : 
            strength === 2 ? 'w-2/4 bg-orange-500' : 
            strength === 3 ? 'w-3/4 bg-yellow-500' : 
            'w-full bg-green-500'
          }`}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {strength === 0 ? 'Too weak' : 
         strength === 1 ? 'Weak' : 
         strength === 2 ? 'Fair' : 
         strength === 3 ? 'Good' : 
         'Strong'}
      </p>
    </div>
  );
};

const AuthPage = () => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { signIn, signUp, clearSession } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize forms with zod resolver
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "+91",
      password: "",
      acceptTerms: false
    }
  });

  // Watch password field for strength indicator
  useEffect(() => {
    const subscription = signupForm.watch((value, { name }) => {
      if (name === 'password') {
        setPasswordValue(value.password || "");
      }
    });
    return () => subscription.unsubscribe();
  }, [signupForm.watch]);

  // Reset session on component mount
  useEffect(() => {
    if (clearSession) {
      clearSession();
    }
  }, [clearSession]);

  // Toggle dark mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const toggleMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const flipCard = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setShowLogin(!showLogin);
      setIsFlipping(false);
    }, 300); // Animation duration
  };

  const handleLoginSubmit = async (values: LoginFormValues) => {
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

  const handleSignupSubmit = async (values: SignupFormValues) => {
    setLoading(true);
    try {
      // Add metadata for additional information
      const metadata = {
        first_name: values.firstName,
        last_name: values.lastName,
        phone: values.phoneNumber
      };

      const { success, error } = await signUp(values.email, values.password, metadata);
      
      if (success) {
        toast({
          title: "Signup successful",
          description: "Please check your email for verification.",
        });
        setShowLogin(true);
      } else {
        toast({
          title: "Signup failed",
          description: error?.message || "Could not create your account. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Animation particles
  const ParticleBackground = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${
              isDarkMode ? "bg-white/10" : "bg-primary/5"
            }`}
            style={{
              width: `${Math.random() * 40 + 10}px`,
              height: `${Math.random() * 40 + 10}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              transform: `scale(${Math.random() * 1 + 0.5})`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Background elements */}
      <ParticleBackground />
      <div className={`absolute top-0 right-0 m-4 z-10 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleMode} 
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          )}
        </Button>
      </div>

      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* 3D Model section */}
          <div className="hidden md:flex flex-col">
            <div className="w-full h-[600px] relative overflow-hidden rounded-2xl shadow-xl">
              <Spline scene="https://prod.spline.design/MzcRY-1mvC8UsfFp/scene.splinecode" />
            </div>
          </div>

          {/* Auth card */}
          <div className="w-full max-w-md mx-auto perspective-1000">
            <AnimatePresence mode="wait">
              <motion.div
                key={showLogin ? "login" : "signup"}
                initial={{ rotateY: showLogin ? -90 : 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: showLogin ? 90 : -90, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  duration: 0.5
                }}
                className="relative w-full"
              >
                <div 
                  className={`w-full rounded-2xl p-8 ${
                    isDarkMode 
                      ? 'bg-gray-800 shadow-xl shadow-black/20' 
                      : 'bg-white shadow-xl shadow-gray-200/60'
                  }`}
                >
                  {showLogin ? (
                    <>
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold">Sign In</h2>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Enter your credentials to access your account
                        </p>
                      </div>

                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Mail className={`absolute left-3 top-3 h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                    <Input 
                                      placeholder="yourname@example.com" 
                                      className="pl-10" 
                                      {...field} 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex justify-between">
                                  <FormLabel>Password</FormLabel>
                                  <Link to="/auth/reset-password" className="text-xs text-primary hover:underline">
                                    Forgot password?
                                  </Link>
                                </div>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className={`absolute left-3 top-3 h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                    <Input 
                                      type="password" 
                                      placeholder="••••••••" 
                                      className="pl-10" 
                                      {...field} 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={loginForm.control}
                            name="rememberMe"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0 mt-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-normal">
                                    Remember me
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                              <>
                                <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                              </>
                            ) : (
                              "Sign In"
                            )}
                          </Button>
                        </form>
                      </Form>
                      
                      <div className="mt-6 flex items-center justify-center gap-1 text-sm">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Don't have an account?</span>
                        <button 
                          type="button" 
                          onClick={flipCard}
                          className="text-primary font-medium hover:underline"
                        >
                          Sign up
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold">Create Account</h2>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Enter your details to sign up
                        </p>
                      </div>

                      <Form {...signupForm}>
                        <form onSubmit={signupForm.handleSubmit(handleSignupSubmit)} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={signupForm.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <User className={`absolute left-3 top-3 h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                      <Input 
                                        placeholder="John" 
                                        className="pl-10" 
                                        {...field} 
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={signupForm.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <User className={`absolute left-3 top-3 h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                      <Input 
                                        placeholder="Doe" 
                                        className="pl-10" 
                                        {...field} 
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={signupForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Mail className={`absolute left-3 top-3 h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                    <Input 
                                      placeholder="yourname@example.com" 
                                      className="pl-10" 
                                      {...field} 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={signupForm.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Phone className={`absolute left-3 top-3 h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                    <Input 
                                      placeholder="+91XXXXXXXXXX" 
                                      className="pl-10" 
                                      {...field} 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={signupForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className={`absolute left-3 top-3 h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                    <Input 
                                      type="password" 
                                      placeholder="••••••••" 
                                      className="pl-10" 
                                      {...field} 
                                    />
                                  </div>
                                </FormControl>
                                <PasswordStrengthIndicator password={passwordValue} />
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={signupForm.control}
                            name="acceptTerms"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-normal">
                                    I accept the <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                              <>
                                <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                              </>
                            ) : (
                              "Sign Up"
                            )}
                          </Button>
                        </form>
                      </Form>
                      
                      <div className="mt-6 flex items-center justify-center gap-1 text-sm">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Already have an account?</span>
                        <button 
                          type="button" 
                          onClick={flipCard}
                          className="text-primary font-medium hover:underline"
                        >
                          Sign in
                        </button>
                      </div>
                    </>
                  )}

                  {/* Optional Biometric Auth */}
                  <div className="absolute bottom-4 right-4">
                    <Button variant="ghost" size="icon">
                      <Fingerprint className="h-5 w-5 text-primary" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Add animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.05);
          }
        }
        
        .perspective-1000 {
          perspective: 1000px;
          transform-style: preserve-3d;
        }
      `}} />
    </div>
  );
};

export default AuthPage;
