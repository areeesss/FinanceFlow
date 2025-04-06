import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import image from "@/assets/imgs/halfbg.webp";
import logo from "@/assets/imgs/Financelogo.webp";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

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
  const [errors, setErrors] = useState({
    full_name: false,
    email: false,
    username: false,
    passwordMatch: false,
    apiError: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);

  // Real-time password validation
  useEffect(() => {
    if (formData.password && formData.password2) {
      const passwordsMatch = formData.password === formData.password2;
      setErrors(prev => ({
        ...prev,
        passwordMatch: !passwordsMatch
      }));
      setShowPasswordError(!passwordsMatch);
    } else {
      setShowPasswordError(false);
    }
  }, [formData.password, formData.password2]);

  const validateForm = () => {
    const newErrors = {
      full_name: formData.full_name.trim() === "",
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
      username: formData.username.trim() === "",
      passwordMatch: formData.password !== formData.password2,
      apiError: ""
    };
    
    setErrors(newErrors);
    
    // Show validation errors as toast messages
    if (newErrors.full_name) {
      addToast({
        title: "Validation Error",
        description: "Full name is required",
        variant: "destructive"
      });
      return false;
    }
    
    if (newErrors.email) {
      addToast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }
    
    if (newErrors.username) {
      addToast({
        title: "Validation Error",
        description: "Username is required",
        variant: "destructive"
      });
      return false;
    }
    
    if (newErrors.passwordMatch) {
      addToast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return false;
    }
    
    return !Object.values(newErrors).some(Boolean);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name !== "password" && name !== "password2") {
      setErrors(prev => ({
        ...prev,
        [name]: name === "email" 
          ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) 
          : value.trim() === ""
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors(prev => ({ ...prev, apiError: "" }));

    try {
      // Clear any existing toast flag before we register
      localStorage.removeItem('signupToastShown');
      
      await register(
        formData.full_name, 
        formData.email, 
        formData.username, 
        formData.password,
        formData.password2
      );
      navigate("/login", { 
        state: { 
          signupSuccess: true,
          email: formData.email,
          defaultData: true  // Flag to indicate default data was created
        } 
      });
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      setErrors(prev => ({
        ...prev,
        apiError: errorMessage
      }));
      
      // Display API error as toast
      addToast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
          <img src={image} className="w-full h-full object-cover opacity-20" />
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
                {showPasswordError && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* Signup Button */}
              <Button
                className="w-full h-[51px] bg-[#a9b5df] hover:bg-[#98a6d7] text-[#2d346b] text-lg shadow-lg rounded-lg"
                disabled={loading}
                type="submit"
              >
                {loading ? (
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