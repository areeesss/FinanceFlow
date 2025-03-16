import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import image from "@/assets/imgs/halfbg.webp";
import logo from "@/assets/imgs/Financelogo.webp";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

const resetpass = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [open, setOpen] = useState(false);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordMatch(e.target.value === confirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setPasswordMatch(password === e.target.value);
  };

  return (
    <div className="bg-[#f8f9fa] flex flex-col md:flex-row w-full h-screen overflow-hidden">
      <Card className="w-full md:w-1/3 bg-[#dce4f2] flex flex-col relative h-full md:shadow-lg">
        <div className="absolute inset-0 md:hidden">
          <img src={image} className="w-full h-full object-cover opacity-20" />
        </div>

        <CardContent className="flex flex-col items-center justify-center flex-grow px-6 sm:px-10 relative z-10">
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
            <img src={logo} className="w-[90px] sm:w-[130px] h-auto" />
          </div>

          <div className="w-full max-w-[400px]">
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#020202] tracking-wide">
                Forgot Password
              </h1>
            </div>

            <div className="space-y-5">
              <p className="text-center text-sm text-gray-700 mb-4">
                Enter your new password below to reset your account access.
              </p>

              <div className="space-y-2">
                <label className="text-black text-base">New Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    className="h-[52px] bg-[#f4f2f2] rounded-lg w-full pr-10 mb-2"
                    placeholder="Enter new password"
                    value={password}
                    onChange={handlePasswordChange}
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

                <label className="text-black text-base">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    className="h-[52px] bg-[#f4f2f2] rounded-lg w-full pr-10"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                  />
                  {showConfirmPassword ? (
                    <EyeOff
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-[25px] h-5 opacity-50 text-[#18345e] cursor-pointer"
                      onClick={() => setShowConfirmPassword(false)}
                    />
                  ) : (
                    <Eye
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-[25px] h-5 opacity-50 text-[#18345e] cursor-pointer"
                      onClick={() => setShowConfirmPassword(true)}
                    />
                  )}
                </div>

                {!passwordMatch && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" /> Passwords do not
                    match
                  </p>
                )}
              </div>

              <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    className="w-full h-[51px] bg-[#a9b5df] hover:bg-[#98a6d7] text-[#2d346b] text-lg shadow-lg rounded-lg"
                    disabled={!passwordMatch || !password || !confirmPassword}
                    onClick={() => setOpen(true)}
                  >
                    Reset Password
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Password Reset Successful
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Your password has been successfully reset. You can now log
                      in with your new password.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <Button
                      className="bg-[#a9b5df] hover:bg-[#98a6d7]"
                      onClick={() => setOpen(false)}
                    >
                      Login
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <p className="text-center text-lg">
                <span className="text-[#2d346b]">Already have an account? </span>
                <Button variant="link" className="text-[#2d346b] p-0">
                  Sign In
                </Button>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="hidden md:block w-2/3 h-full">
        <img src={image} alt="Background" className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

export default resetpass;
