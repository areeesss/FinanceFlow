import React from "react";
import { useNavigate } from "react-router-dom";
import image from "@/assets/imgs/halfbg.webp";
import logo from "@/assets/imgs/Financelogo.webp";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

const Gmail = () => {
  return (
    <div className="flex h-screen w-full">
      {/* Left Section (Form) */}
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
              <h1 className="text-2xl sm:text-3xl font-bold text-[#020202]">
                Sign up with Email
              </h1>
            </div>

            <div className="space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-black text-base">Email</label>
                <Input
                  className="h-[52px] bg-[#f4f2f2] rounded-lg w-full"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-black text-base">Password</label>
                <div className="relative">
                  <Input
                    type="password"
                    className="h-[52px] bg-[#f4f2f2] rounded-lg w-full pr-10"
                    placeholder="Enter password"
                  />
                  {/* Eye icon for visibility toggle */}
                  <button className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                    <EyeOff size={20} />
                  </button>
                </div>
              </div>

              {/* Sign-Up Button */}
              <Button className="w-full h-[50px] bg-[#8891c2] text-white text-lg rounded-lg hover:bg-[#7179b8]">
                Sign Up
              </Button>

              {/* Sign-in Link */}
              <p className="text-center text-sm">
                Already have an account?{" "}
                <Button variant="link" className="text-[#2d346b] p-0">
                  Sign In
                </Button>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right Section (Background Image) */}
      <div className="hidden md:block w-2/3 h-full">
        <img
          src={image}
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Gmail;
