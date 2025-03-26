import { useState } from "react";
import { useNavigate } from "react-router-dom";
import image from "@/assets/imgs/halfbg.webp";
import logo from "@/assets/imgs/Financelogo.webp";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const Gmail = () => {
  const navigate = useNavigate();

  // State for form inputs
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [confirmEmailError, setConfirmEmailError] = useState("");
  const [showDialog, setShowDialog] = useState(false); // State for Alert Dialog

  // Email validation function
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle Sign-Up Click
  const handleSignUp = () => {
    let valid = true;

    // Validate email format
    if (!isValidEmail(email)) {
      setEmailError("Invalid email format");
      valid = false;
    } else {
      setEmailError("");
    }

    // Validate email confirmation
    if (email !== confirmEmail) {
      setConfirmEmailError("Emails do not match");
      valid = false;
    } else {
      setConfirmEmailError("");
    }

    if (valid) {
      setShowDialog(true); // Show success dialog
    }
  };

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
                  className={`h-[52px] bg-[#f4f2f2] rounded-lg w-full ${
                    emailError ? "border border-red-500" : ""
                  }`}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {emailError && (
                  <p className="text-red-500 text-sm">{emailError}</p>
                )}
              </div>

              {/* Confirm Email Input */}
              <div className="space-y-2">
                <label className="text-black text-base">Confirm Email</label>
                <Input
                  className={`h-[52px] bg-[#f4f2f2] rounded-lg w-full ${
                    confirmEmailError ? "border border-red-500" : ""
                  }`}
                  placeholder="Re-enter your email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                />
                {confirmEmailError && (
                  <p className="text-red-500 text-sm">{confirmEmailError}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-black text-base">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    className="h-[52px] bg-[#f4f2f2] rounded-lg w-full pr-10"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {/* Eye icon for visibility toggle */}
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>

              {/* Sign-Up Button */}
              <Button
                className="w-full h-[50px] text-lg shadow-lg rounded-lg bg-[#a9b5df] hover:bg-[#98a6d7] text-[#2d346b]"
                onClick={handleSignUp}
              >
                Sign Up
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
      <div className="hidden md:block w-2/3 h-full">
        <img
          src={image}
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Success Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md bg-white rounded-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Sign-Up Successful
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-700">
            Your account has been created successfully. You can now log in.
          </p>
          <DialogFooter>
            <Button
              className="w-full bg-[#a9b5df] hover:bg-[#98a6d7] text-[#2d346b] rounded-lg mt-4"
              onClick={() => navigate("/login")}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gmail;
