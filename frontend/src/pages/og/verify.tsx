import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import image from "@/assets/imgs/halfbg.webp";
import logo from "@/assets/imgs/Financelogo.webp";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const verifycode = () => {
  const [otp, setOtp] = useState("");

  return (
    <div className="flex h-screen w-full flex-col md:flex-row overflow-hidden">
      {/* Left Section (Form) */}
      <Card className="w-full md:w-1/3 bg-[#dce4f2] flex flex-col relative md:shadow-lg h-full">
        <div className="absolute inset-0 md:hidden">
          <img src={image} className="w-full h-full object-cover opacity-20" />
        </div>

        <CardContent className="flex flex-col items-center justify-center flex-grow px-6 sm:px-10 relative z-10">
          {/* Logo */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
            <img src={logo} className="w-[90px] sm:w-[130px] h-auto" />
          </div>

          <div className="w-full max-w-sm">
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#020202]">
                Forgot Password
              </h1>
            </div>

            <div className="space-y-5">
              <p className="text-center text-sm text-gray-700 mb-4">
                We will send a verification code to the email provided so you
                can reset your password.
              </p>

              {/* OTP Input */}
              <div className="w-full flex flex-col space-y-3">
                <label className="text-black text-base text-center">
                  Enter Verification Code
                </label>

                <div className="flex justify-center">
                  <InputOTP
                    value={otp}
                    onChange={(val) => setOtp(val.replace(/\D/g, ""))}
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="flex justify-center gap-x-2 sm:gap-x-2"
                  >
                    {/* First OTP Group */}
                    <InputOTPGroup className="flex space-x-2 sm:space-x-3">
                      {[...Array(3)].map((_, i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          onInput={(e) =>
                            (e.target.value = e.target.value.replace(/\D/, ""))
                          }
                          className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg text-black bg-white border border-black rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      ))}
                    </InputOTPGroup>

                    {/* OTP Separator */}
                    <InputOTPSeparator className="mx-2 text-lg text-gray-500" />

                    {/* Second OTP Group */}
                    <InputOTPGroup className="flex space-x-2 sm:space-x-2">
                      {[...Array(3)].map((_, i) => (
                        <InputOTPSlot
                          key={i + 3}
                          index={i + 3}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          onInput={(e) =>
                            (e.target.value = e.target.value.replace(/\D/, ""))
                          }
                          className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg text-black bg-white border border-black rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              {/* Reset Password Button */}
              <Button className="w-full h-[50px] bg-[#8891c2] text-white text-lg rounded-lg hover:bg-[#7179b8]">
                Reset Password
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

export default verifycode;
