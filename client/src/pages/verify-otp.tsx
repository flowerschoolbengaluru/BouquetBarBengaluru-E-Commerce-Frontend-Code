import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import logoPath from "@assets/E_Commerce_Bouquet_Bar_Logo_1757484444893.png";

export default function VerifyOtp() {
  const [formData, setFormData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [contact, setContact] = useState("");
  const [contactType, setContactType] = useState("email");
  const [step, setStep] = useState(1); // 1: OTP verification, 2: New password
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Get contact info from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const contactParam = urlParams.get('contact');
    const typeParam = urlParams.get('type');
    
    if (contactParam) setContact(decodeURIComponent(contactParam));
    if (typeParam) setContactType(typeParam);
  }, []);

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: { contact: string; otp: string; contactType: string }) => {
      return await apiRequest("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "OTP Verified!",
        description: "Please set your new password",
      });
      setStep(2);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { contact: string; otp: string; newPassword: string; contactType: string }) => {
      return await apiRequest("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Password Reset Successfully!",
        description: "You can now sign in with your new password",
      });
      setLocation("/signin");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, contactType, resend: true }),
      });
    },
    onSuccess: () => {
      toast({
        title: "OTP Sent!",
        description: `New verification code sent to your ${contactType}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification code",
        variant: "destructive",
      });
    },
  });

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.otp || formData.otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    verifyOtpMutation.mutate({
      contact,
      otp: formData.otp,
      contactType,
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.newPassword || formData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    resetPasswordMutation.mutate({
      contact,
      otp: formData.otp,
      newPassword: formData.newPassword,
      contactType,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const maskContact = (contact: string, type: string) => {
    if (type === "email") {
      const [local, domain] = contact.split("@");
      return `${local.substring(0, 2)}***@${domain}`;
    } else {
      return `${contact.substring(0, 3)}***${contact.substring(contact.length - 2)}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
      <div className="flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-pink-200/80 via-rose-200/60 to-pink-300/80 relative overflow-hidden">
          <div className="flex flex-col justify-center px-12 relative z-10">
            <div className="text-white">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                {step === 1 ? "Verify" : "Reset"}
                <span className="block text-pink-600">
                  {step === 1 ? "Your Code" : "Password"}
                </span>
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-pink-800">
                {step === 1 
                  ? `We've sent a verification code to ${maskContact(contact, contactType)}`
                  : "Create a strong new password for your account"
                }
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-pink-900">Secure Process</h3>
                    <p className="text-pink-700">Your data is protected</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Lock className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-pink-900">Encrypted</h3>
                    <p className="text-pink-700">End-to-end security</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-pink-500/20 rounded-full blur-lg"></div>
          <div className="absolute top-1/2 right-10 w-16 h-16 bg-rose-400/30 rounded-full blur-md"></div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="text-center mb-8">
              <img src={logoPath} alt="Bouquet Bar Logo" className="h-24 w-auto mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">
                {step === 1 ? "Verify Code" : "New Password"}
              </h2>
            </div>

            {/* Back Button */}
            <Link href={step === 1 ? "/forgot-password" : "#"}>
              <Button 
                variant="ghost" 
                className="mb-6 text-gray-600 hover:text-gray-900"
                onClick={step === 2 ? () => setStep(1) : undefined}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {step === 1 ? "Back to Reset" : "Back to OTP"}
              </Button>
            </Link>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {step === 1 ? "Enter Verification Code" : "Set New Password"}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {step === 1 
                    ? `Enter the 6-digit code sent to ${maskContact(contact, contactType)}`
                    : "Create a strong password for your account"
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {step === 1 ? (
                  <form onSubmit={handleOtpSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="otp" className="text-gray-700 font-medium">
                        Verification Code
                      </Label>
                      <Input
                        id="otp"
                        name="otp"
                        type="text"
                        required
                        maxLength={6}
                        className="text-center text-2xl tracking-wider border-gray-200 focus:border-primary focus:ring-primary/20"
                        placeholder="000000"
                        value={formData.otp}
                        onChange={handleInputChange}
                        data-testid="input-otp"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full font-semibold py-3 text-lg"
                      disabled={verifyOtpMutation.isPending}
                      data-testid="button-verify-otp"
                    >
                      {verifyOtpMutation.isPending ? "Verifying..." : "Verify Code"}
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-primary hover:text-primary/80 font-semibold"
                        onClick={() => resendOtpMutation.mutate()}
                        disabled={resendOtpMutation.isPending}
                        data-testid="button-resend-otp"
                      >
                        {resendOtpMutation.isPending ? "Sending..." : "Resend Code"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-gray-700 font-medium">
                        New Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          required
                          className="pl-10 pr-10 border-gray-200 focus:border-primary focus:ring-primary/20"
                          placeholder="Enter new password"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          data-testid="input-new-password"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                          tabIndex={-1}
                          onClick={() => setShowNewPassword((v) => !v)}
                          aria-label={showNewPassword ? "Hide password" : "Show password"}
                        >
                          {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          className="pl-10 pr-10 border-gray-200 focus:border-primary focus:ring-primary/20"
                          placeholder="Confirm new password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          data-testid="input-confirm-password"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                          tabIndex={-1}
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full font-semibold py-3 text-lg"
                      disabled={resetPasswordMutation.isPending}
                      data-testid="button-reset-password"
                    >
                      {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                    </Button>
                  </form>
                )}

                <div className="text-center pt-4 border-t border-gray-100">
                  <p className="text-gray-600">
                    Remember your password?{" "}
                    <Link href="/signin" className="text-primary hover:text-primary/80 font-semibold">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}