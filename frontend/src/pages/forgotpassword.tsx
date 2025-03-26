import { useState } from "react";
import { useNavigate } from "react-router-dom";
import image from "@/assets/imgs/halfbg.webp";
import logo from "@/assets/imgs/Financelogo.webp";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"; // Import Alert Dialog

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); // State for email input
  const [error, setError] = useState(""); // State for error message
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State for alert dialog

  // Email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email pattern
    return emailRegex.test(email);
  };

  // Handle form submission
  const handleSendCode = () => {
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Invalid email address. Please enter a valid email.");
      return;
    }

    setError(""); // Clear error if valid
    setIsDialogOpen(true); // Show alert dialog
  };

  return (
    <div className="bg-[#f8f9fa] flex flex-col md:flex-row w-full h-screen overflow-hidden">
      {/* Left Section (Form) */}
      <Card className="w-full md:w-1/3 bg-[#dce4f2] flex flex-col relative h-full md:shadow-lg">
        <div className="absolute inset-0 md:hidden">
          <img
            src={image}
            className="w-full h-full object-cover opacity-20"
            alt="Background"
          />
        </div>

        <CardContent className="flex flex-col items-center justify-center flex-grow px-6 sm:px-10 relative z-10">
          {/* Logo */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
            <img
              src={logo}
              className="w-[80px] sm:w-[120px] h-auto"
              alt="Logo"
            />
          </div>

          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-[#020202] tracking-wide">
                Forgot Password
              </h1>
            </div>

            <div className="space-y-5">
              <p className="text-justify text-sm text-gray-700 mb-4">
                We will send a verification code to the email provided so you
                can reset your password.
              </p>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-black text-base">
                  Enter Email Address
                </label>
                <Input
                  className="h-[50px] bg-[#f4f2f2] rounded-lg w-full"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}{" "}
                {/* Error Message */}
              </div>

              {/* Send Code Button */}
              <Button
                className="w-full h-[50px] bg-[#a9b5df] hover:bg-[#98a6d7] text-[#2d346b] text-lg shadow-lg rounded-lg"
                onClick={handleSendCode}
              >
                Send Code
              </Button>

              {/* Sign-in Link */}
              <p className="text-center text-lg">
                <span className="text-[#2d346b]">
                  Already have an account?{" "}
                </span>
                <Button
                  variant="link"
                  className="text-[#2d346b] p-0"
                  onClick={() => navigate("/login")}
                >
                  Log In
                </Button>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right Section (Background Image) */}
      <div className="hidden md:flex w-2/3 h-full">
        <img
          src={image}
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Alert Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle>Email Sent</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-left">
            A verification code has been sent to <b>{email}</b>
          </p>
          <DialogFooter>
            <Button
              className="bg-[#2d346b] text-white rounded-lg px-4 py-2"
              onClick={() => {
                setIsDialogOpen(false);
                navigate("/verify-code"); // Redirect to verify code page
              }}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ForgotPassword;
