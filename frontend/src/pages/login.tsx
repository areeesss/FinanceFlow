import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import image from "/assets/imgs/halfbg.webp";
import logo from "/assets/imgs/Financelogo.webp";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if the user came from the signup page with success state
  const signupSuccess = location.state?.signupSuccess || false;
  const [toastShown, setToastShown] = useState(false);
  const { addToast } = useToast();
  
  // Clear localStorage data if not coming from signup page
  useEffect(() => {
    // Only clear data if not coming from signup page with success
    if (!signupSuccess) {
      // Clear all local storage data
      const keys = Object.keys(localStorage);
      const keysToKeep = ['signupToastShown']; // Keep certain flags if needed
      
      keys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      console.log("Cleared localStorage data on login page load");
    }
  }, [signupSuccess]);
  
  // Create a mutation for login
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      return login(credentials.email, credentials.password);
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      addToast({
        title: "Login Failed",
        description: error.message || "Failed to log in. Please check your credentials.",
        variant: "destructive",
      });
    }
  });
  
  // Show signup success message if navigated from signup
  useEffect(() => {
    // Check local storage to see if we've shown this message before
    const hasShownSignupToast = localStorage.getItem('signupToastShown');
    
    if (location.state?.signupSuccess && !toastShown && !hasShownSignupToast) {
      addToast({
        title: "Registration Successful",
        description: `Account created for ${location.state.email}. Please log in to start managing your finances.`,
      });
      
      // Set both local state and localStorage flag to prevent showing the toast again
      setToastShown(true);
      localStorage.setItem('signupToastShown', 'true');
      
      // Clear the flag after a reasonable time (e.g., 1 minute)
      setTimeout(() => {
        localStorage.removeItem('signupToastShown');
      }, 60000);
    }
  }, [location.state, addToast, toastShown]);
  
  // Show auth errors using toast
  useEffect(() => {
    if (errorMessage) {
      addToast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [errorMessage, addToast]);

  // Handle login function
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    
    // Basic validation
    if (!email.trim() || !password.trim()) {
      addToast({
        title: "Error",
        description: "Email and password are required",
        variant: "destructive",
      });
      return;
    }
    
    // Execute the login mutation
    loginMutation.mutate({ email, password });
  };

  // Handle navigation to signup page
  const handleNavigateToSignup = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate("/signup");
  };

  // Handle navigation to forgot password page
  const handleNavigateToForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate("/forgot-password");
  };

  // Handle navigation to Gmail login
  const handleNavigateToGmail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate("/gmail");
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
      animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="bg-[#f8f9fa] flex flex-col md:flex-row w-full h-screen overflow-hidden"
    >
      {/* Left Section (Login Form) */}
      <Card className="w-full md:w-1/3 bg-[#dce4f2] flex flex-col relative h-full md:shadow-lg">
        <div className="absolute inset-0 md:hidden">
          <img src={image} className="w-full h-full object-cover opacity-20" />
        </div>

        <CardContent className="flex flex-col items-center justify-center flex-grow px-6 sm:px-10 relative z-10">
          {/* Logo */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
            <img src={logo} className="w-[90px] sm:w-[130px] h-auto" />
          </div>

          <div className="w-full max-w-[400px]">
            <div className="text-center mb-6">
              <h1 className="text-4xl sm:text-[55px] font-bold text-[#020202] tracking-wide">
                WELCOME
              </h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-black text-base">Enter Email</label>
                <Input
                  className="h-[52px] bg-[#f4f2f2] rounded-lg w-full"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-black text-base">Password</label>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    className="h-[52px] bg-[#f4f2f2] rounded-lg w-full pr-10"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  {showPassword ? (
                    <EyeOff
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-[25px] h-5 opacity-50 text-[#18345e] cursor-pointer"
                      onClick={() => setShowPassword(false)}
                    />
                  ) : (
                    <Eye
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-[25px] h-5 opacity-50 text-[#18345e] cursor-pointer"
                      onClick={() => setShowPassword(true)}
                    />
                  )}
                </div>
              </div>

              {/* Login Button */}
              <Button
                className="w-full h-[51px] bg-[#a9b5df] hover:bg-[#98a6d7] text-[#2d346b] text-lg shadow-lg rounded-lg"
                disabled={loginMutation.isPending}
                type="submit"
              >
                {loginMutation.isPending ? "Logging in..." : "Log In"}
              </Button>
            </form>
            
            {/* Password Reset Link - Outside the form */}
            <div className="mt-2 text-right">
              <span
                className="text-[#2d346b] text-sm hover:underline cursor-pointer"
                onClick={handleNavigateToForgotPassword}
              >
                Forgot your password?
              </span>
            </div>

            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-400"></div>
              <span className="mx-3 text-gray-600">Or continue with</span>
              <div className="flex-grow border-t border-gray-400"></div>
            </div>

            {/* Google Login Button */}
            <Button
              type="button"
              className="w-full flex items-center justify-center h-[50px] bg-white border border-gray-300 text-black rounded-lg shadow-md hover:bg-gray-100"
              onClick={handleNavigateToGmail}
            >
              <FcGoogle className="w-6 h-6 mr-1" />
              Sign in with Google
            </Button>

            {/* Signup Link */}
            <p className="text-center text-lg mt-3">
              <span className="text-[#2d346b]">Don't have an account? </span>
              <Button
                type="button"
                variant="link"
                className="text-[#2d346b] p-0"
                onClick={handleNavigateToSignup}
              >
                Sign Up
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Right Section (Hidden on Mobile) */}
      <div className="hidden md:block w-2/3 h-full">
        <img
          src={image}
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>
    </motion.div>
  );
};

export default Login;
