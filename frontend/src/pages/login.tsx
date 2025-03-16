import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import image from "@/assets/imgs/halfbg.webp";
import logo from "@/assets/imgs/Financelogo.webp";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from AuthContext

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('http://localhost:8000/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data.message); // Optionally log the success message
      console.log("Login successful, redirecting to dashboard..."); // Log redirect action
      console.log("Navigating to dashboard..."); // Debugging log before navigation
      localStorage.setItem('isAuthenticated', 'true'); // Set authentication state
      navigate("/dashboard"); // Redirect to Dashboard after login
    } else {
      const errorData = await response.json();
      alert(errorData.error || "Invalid credentials!");
    }

  };

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  console.log("Trying to log in with:", email, password);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleLoginClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

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

            <div className="space-y-5">
              {/* Username Input */}
              <div className="space-y-2">
                <label className="text-black text-base">Enter Email</label>
                <Input
                  className="h-[52px] bg-[#f4f2f2] rounded-lg w-full"
                  placeholder="Enter email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-black text-base">Password</label>
                  <button
                    className="text-[#2d346b] text-sm hover:underline"
                    onClick={() => navigate("/forgot-password")}
                  >
                    Forgot your password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    className="h-[52px] bg-[#f4f2f2] rounded-lg w-full pr-10"
                    placeholder="Enter password"
                    onChange={(e) => setPassword(e.target.value)}
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
type="button"
                className="w-full h-[51px] bg-[#a9b5df] hover:bg-[#98a6d7] text-[#2d346b] text-lg shadow-lg rounded-lg"
                disabled={loading}
                onClick={handleLogin}
              >
                {loading ? "Logging in..." : "Log In"}
              </Button>

              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-400"></div>
                <span className="mx-3 text-gray-600">Or continue with</span>
                <div className="flex-grow border-t border-gray-400"></div>
              </div>

              {/* Google Login Button */}
              <Button
                className="w-full flex items-center justify-center h-[50px] bg-white border border-gray-300 text-black rounded-lg shadow-md hover:bg-gray-100"
                onClick={() => navigate("/gmail")}
              >
                <FcGoogle className="w-6 h-6 mr-1" />
                Sign in with Google
              </Button>

              {/* Signup Link */}
              <p className="text-center text-lg">
                <span className="text-[#2d346b]">Don't have an account? </span>
                <Button
                  variant="link"
                  className="text-[#2d346b] p-0"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </Button>
              </p>
            </div>
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
export default LoginPage;
