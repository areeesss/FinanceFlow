import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import image from "@/assets/imgs/halfbg.webp";
import logo from "@/assets/imgs/Financelogo.webp";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye, AlertCircle } from "lucide-react";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordMatch(e.target.value === confirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setPasswordMatch(password === e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value));
  };

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
      animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="bg-[#f8f9fa] flex flex-col md:flex-row w-full h-screen overflow-hidden"
    >
      <Card className="w-full md:w-1/3 bg-[#dce4f2] flex flex-col relative h-full md:shadow-lg">
        <div className="absolute inset-0 md:hidden">
          <img src={image} className="w-full h-full object-cover opacity-20" />
        </div>

        <CardContent className="flex flex-col items-center justify-center flex-grow px-6 sm:px-10 relative z-10">
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
            <img src={logo} className="w-[90px] sm:w-[130px] h-auto" />
          </div>

          <div className="w-full max-w-[400px]">
            <div className="text-center mb-5">
              <h1 className="text-3xl sm:text-[45px] font-bold text-[#020202] tracking-wide">
                Create Account
              </h1>
            </div>

            <div className="space-y-1">
              <label className="text-black text-base">Full Name</label>
              <Input
                className="h-[50px] bg-[#f4f2f2] rounded-lg w-full"
                placeholder="Enter full name"
              />

              <label className="text-black text-base">Email</label>
              <Input
                className="h-[50px] bg-[#f4f2f2] rounded-lg w-full"
                placeholder="Enter email"
                value={email}
                onChange={handleEmailChange}
              />
              {!emailValid && (
                <p className="text-red-500 text-sm">Invalid email format</p>
              )}

              <label className="text-black text-base">Username</label>
              <Input
                className="h-[50px] bg-[#f4f2f2] rounded-lg w-full"
                placeholder="Enter username"
              />

              <label className="text-black text-base">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  className="h-[50px] bg-[#f4f2f2] rounded-lg w-full"
                  placeholder="Enter password"
                  value={password}
                  onChange={handlePasswordChange}
                />
                <Eye
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-[22px] h-5 opacity-50 text-[#18345e] cursor-pointer"
                  onClick={togglePasswordVisibility}
                />
              </div>

              <label className="text-black text-base">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  className="h-[50px] bg-[#f4f2f2] rounded-lg w-full"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                />
                <Eye
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-[22px] h-5 opacity-50 text-[#18345e] cursor-pointer"
                  onClick={togglePasswordVisibility}
                />
              </div>
              {!passwordMatch && (
                <p className="text-red-500 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> Passwords do not
                  match
                </p>
              )}

              <Button className="w-full h-[50px] bg-[#a9b5df] hover:bg-[#98a6d7] text-[#2d346b] text-lg shadow-lg rounded-lg">
                Sign Up
              </Button>

              <p className="text-center text-lg">
                <span className="text-[#2d346b]">
                  Already have an account?{" "}
                </span>
                <Button
                  variant="link"
                  className="text-[#2d346b] p-0"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </Button>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
