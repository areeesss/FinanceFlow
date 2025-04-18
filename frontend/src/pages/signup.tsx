import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import image from "/assets/imgs/halfbg.webp";
import logo from "/assets/imgs/Financelogo.webp";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { debugAPI } from "@/services/api";

const SignUpPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    username: "",
    password: "",
    password2: ""
  });
  // Simplified error state to only track password match since other errors use toast notifications
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Add debug state
  const [debugResult, setDebugResult] = useState<string | null>(null);

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: typeof formData) => {
      if (!validateForm()) {
        throw new Error("Form validation failed");
      }
      
      return register(
        userData.full_name, 
        userData.email, 
        userData.username, 
        userData.password,
        userData.password2
      );
    },
    onSuccess: () => {
      navigate("/login", { 
        state: { 
          signupSuccess: true,
          email: formData.email,
          defaultData: true
        } 
      });
    },
    onError: (error: Error) => {
      // Display API error as toast
      addToast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Real-time password validation
  useEffect(() => {
    if (formData.password && formData.password2) {
      setPasswordsMatch(formData.password === formData.password2);
    } else {
      setPasswordsMatch(true); // Don't show error if fields are empty
    }
  }, [formData.password, formData.password2]);

  // Add a debug function
  const testApiConnection = async () => {
    addToast({
      title: "Testing API Connection",
      description: "Checking connection to API...",
    });
    
    try {
      const result = await debugAPI();
      console.log("Debug API result:", result);
      
      setDebugResult(JSON.stringify(result, null, 2));
      
      addToast({
        title: "API Test Complete",
        description: `API ${result.ok ? 'is accessible' : 'returned an error'}. See console for details.`,
        variant: result.ok ? "default" : "destructive"
      });
    } catch (error) {
      console.error("API test error:", error);
      addToast({
        title: "API Test Failed",
        description: "Could not connect to API. See console for details.",
        variant: "destructive"
      });
    }
  };

  const validateForm = () => {
    // Validate full name
    if (formData.full_name.trim() === "") {
      addToast({
        title: "Validation Error",
        description: "Full name is required",
        variant: "destructive"
      });
      return false;
    }
    
    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      addToast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }
    
    // Validate username
    if (formData.username.trim() === "") {
      addToast({
        title: "Validation Error",
        description: "Username is required",
        variant: "destructive"
      });
      return false;
    }
    
    // Validate password match
    if (formData.password !== formData.password2) {
      addToast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
      animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="bg-[#f8f9fa] flex flex-col md:flex-row w-full h-screen overflow-hidden"
    >
      {/* Left Section (Signup Form) */}
      <Card className="w-full md:w-1/3 bg-[#dce4f2] flex flex-col relative h-full md:shadow-lg">
        <div className="absolute inset-0 md:hidden">
          <img src={image} className="w-full h-full object-cover opacity-20" alt="Background Mobile" />
        </div>

        <CardContent className="flex flex-col items-center justify-center flex-grow px-6 sm:px-10 relative z-10">
          {/* Logo */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
            <img src={logo} className="w-[90px] sm:w-[130px] h-auto" alt="Logo" />
          </div>

          <div className="w-full max-w-[400px]">
            <div className="text-center mb-6">
              <h1 className="text-4xl sm:text-[55px] font-bold text-[#020202] tracking-wide">
                CREATE ACCOUNT
              </h1>
            </div>

            {/* Debug button - only in development */}
            {import.meta.env.DEV && (
              <Button 
                onClick={testApiConnection}
                variant="outline" 
                className="mb-4 w-full bg-amber-200 hover:bg-amber-300 text-black"
              >
                Test API Connection
              </Button>
            )}

            {/* Debug result display */}
            {debugResult && (
              <div className="mb-4 p-2 bg-gray-100 border border-gray-300 rounded-md overflow-auto max-h-32 text-xs">
                <pre>{debugResult}</pre>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name Input */}
              <div className="space-y-2">
                <label className="text-black text-base">Full Name</label>
                <Input
                  name="full_name"
                  className="h-[52px] bg-[#f4f2f2] rounded-lg w-full"
                  placeholder="Enter full name"
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-black text-base">Email</label>
                <Input
                  name="email"
                  className="h-[52px] bg-[#f4f2f2] rounded-lg w-full"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Username Input */}
              <div className="space-y-2">
                <label className="text-black text-base">Username</label>
                <Input
                  name="username"
                  className="h-[52px] bg-[#f4f2f2] rounded-lg w-full"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-black text-base">Password</label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="h-[52px] bg-[#f4f2f2] rounded-lg w-full pr-10"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
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

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="text-black text-base">Confirm Password</label>
                <div className="relative">
                  <Input
                    name="password2"
                    type={showPassword ? "text" : "password"}
                    className="h-[52px] bg-[#f4f2f2] rounded-lg w-full pr-10"
                    placeholder="Confirm password"
                    value={formData.password2}
                    onChange={handleChange}
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
                {!passwordsMatch && formData.password && formData.password2 && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* Signup Button */}
              <Button
                className="w-full h-[51px] bg-[#a9b5df] hover:bg-[#98a6d7] text-[#2d346b] text-lg shadow-lg rounded-lg"
                disabled={registerMutation.isPending}
                type="submit"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : "Sign Up"}
              </Button>
            </form>

            {/* Login Link */}
            <p className="text-center text-lg mt-3">
              <span className="text-[#2d346b]">Already have an account? </span>
              <Button
                type="button"  
                variant="link"
                className="text-[#2d346b] p-0"
                onClick={() => navigate("/login")}
              >
                Log In
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

export default SignUpPage;