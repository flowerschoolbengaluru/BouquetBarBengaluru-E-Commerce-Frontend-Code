import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ShieldCheck, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import logoPath from "@assets/E_Commerce_Bouquet_Bar_Logo_1757484444893.png";

type FormErrors = {
  otp?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
};

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
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState({
    otp: false,
    newPassword: false,
    confirmPassword: false
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
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
      setShowSuccess(true);
      setSuccessMessage("OTP verified successfully! Please set your new password");
      setTimeout(() => {
        setShowSuccess(false);
        setStep(2);
      }, 2000);
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Invalid verification code";
      setFormErrors({
        otp: errorMessage,
        general: errorMessage
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
      setShowSuccess(true);
      setSuccessMessage("Password reset successfully! Redirecting to sign in...");
      setTimeout(() => setLocation("/signin"), 1500);
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to reset password";
      setFormErrors({
        general: errorMessage
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
      setShowSuccess(true);
      setSuccessMessage("New verification code sent successfully!");
      setTimeout(() => setShowSuccess(false), 2000);
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to resend verification code";
      setFormErrors({
        general: errorMessage
      });
    },
  });

  const validateOtp = (otp: string): string | undefined => {
    if (!otp) return "Verification code is required";
    if (otp.length !== 6) return "Code must be 6 digits";
    if (!/^\d+$/.test(otp)) return "Code must contain only numbers";
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return undefined;
  };

  const validateConfirmPassword = (password: string): string | undefined => {
    if (!password) return "Please confirm your password";
    if (password !== formData.newPassword) return "Passwords do not match";
    return undefined;
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouchedFields(prev => ({ ...prev, otp: true }));
    setFormErrors(prev => ({ ...prev, general: undefined, otp: undefined }));
    
    const otpError = validateOtp(formData.otp);
    if (otpError) {
      setFormErrors({ otp: otpError });
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
    
    setTouchedFields(prev => ({ ...prev, newPassword: true, confirmPassword: true }));
    setFormErrors(prev => ({ ...prev, general: undefined }));
    
    const passwordError = validatePassword(formData.newPassword);
    const confirmError = validateConfirmPassword(formData.confirmPassword);
    
    const errors: FormErrors = {};
    if (passwordError) errors.newPassword = passwordError;
    if (confirmError) errors.confirmPassword = confirmError;
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
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
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    if (formErrors[name as keyof FormErrors] && touchedFields[name as keyof typeof touchedFields]) {
      if (name === 'otp') {
        const error = validateOtp(value);
        setFormErrors(prev => ({ ...prev, otp: error }));
      } else if (name === 'newPassword') {
        const error = validatePassword(value);
        setFormErrors(prev => ({ ...prev, newPassword: error }));
        // Also validate confirm password if it exists
        if (formData.confirmPassword) {
          const confirmError = validateConfirmPassword(formData.confirmPassword);
          setFormErrors(prev => ({ ...prev, confirmPassword: confirmError }));
        }
      } else if (name === 'confirmPassword') {
        const error = validateConfirmPassword(value);
        setFormErrors(prev => ({ ...prev, confirmPassword: error }));
      }
    }
  };

  const handleFieldBlur = (field: 'otp' | 'newPassword' | 'confirmPassword') => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    
    if (field === 'otp') {
      const error = validateOtp(formData.otp);
      setFormErrors(prev => ({ ...prev, otp: error }));
    } else if (field === 'newPassword') {
      const error = validatePassword(formData.newPassword);
      setFormErrors(prev => ({ ...prev, newPassword: error }));
    } else if (field === 'confirmPassword') {
      const error = validateConfirmPassword(formData.confirmPassword);
      setFormErrors(prev => ({ ...prev, confirmPassword: error }));
    }
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
            <Button
              variant="ghost"
              className="mb-6 text-gray-600 hover:text-gray-900"
              onClick={() => {
                if (step === 1) {
                  setLocation("/forgot-password");
                } else {
                  setStep(1);
                  setFormErrors({});
                }
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {step === 1 ? "Back to Reset" : "Back to OTP"}
            </Button>

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
                {/* Success Message */}
                {showSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fadeIn">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="font-medium text-green-800">Success!</p>
                        <p className="text-sm text-green-700">{successMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* General Error Message */}
                {formErrors.general && !showSuccess && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 animate-fadeIn">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="font-medium text-destructive">Error</p>
                        <p className="text-sm text-destructive/90">{formErrors.general}</p>
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 ? (
                  <form onSubmit={handleOtpSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="otp" className="text-gray-700 font-medium">
                          Verification Code <span className="text-red-500">*</span>
                        </Label>
                        {touchedFields.otp && formErrors.otp && (
                          <span className="text-xs text-destructive font-medium">
                            {formErrors.otp}
                          </span>
                        )}
                      </div>
                      <Input
                        id="otp"
                        name="otp"
                        type="text"
                        required
                        maxLength={6}
                        className={`text-center text-2xl tracking-wider ${
                          touchedFields.otp && formErrors.otp
                            ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                            : "border-gray-200 focus:border-primary focus:ring-primary/20"
                        }`}
                        placeholder="000000"
                        value={formData.otp}
                        onChange={handleInputChange}
                        onBlur={() => handleFieldBlur('otp')}
                        data-testid="input-otp"
                      />
                      <p className="text-xs text-gray-500">
                        Enter the 6-digit code sent to your {contactType}
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full font-semibold py-3 text-lg bg-primary hover:bg-primary/90 transition-all duration-200"
                      disabled={verifyOtpMutation.isPending || showSuccess}
                      data-testid="button-verify-otp"
                    >
                      {verifyOtpMutation.isPending ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Verifying...
                        </span>
                      ) : "Verify Code"}
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-primary hover:text-primary/80 font-semibold"
                        onClick={() => {
                          setFormErrors({});
                          resendOtpMutation.mutate();
                        }}
                        disabled={resendOtpMutation.isPending || showSuccess}
                        data-testid="button-resend-otp"
                      >
                        {resendOtpMutation.isPending ? "Sending..." : "Resend Code"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="newPassword" className="text-gray-700 font-medium">
                          New Password <span className="text-red-500">*</span>
                        </Label>
                        {touchedFields.newPassword && formErrors.newPassword && (
                          <span className="text-xs text-destructive font-medium">
                            {formErrors.newPassword}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                          touchedFields.newPassword && formErrors.newPassword ? "text-destructive" : "text-gray-400"
                        }`} />
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          required
                          className={`pl-10 pr-10 ${
                            touchedFields.newPassword && formErrors.newPassword
                              ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                              : "border-gray-200 focus:border-primary focus:ring-primary/20"
                          } transition-colors`}
                          placeholder="Enter new password"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          onBlur={() => handleFieldBlur('newPassword')}
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
                      <div className="flex items-center justify-between">
                        <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                          Confirm Password <span className="text-red-500">*</span>
                        </Label>
                        {touchedFields.confirmPassword && formErrors.confirmPassword && (
                          <span className="text-xs text-destructive font-medium">
                            {formErrors.confirmPassword}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                          touchedFields.confirmPassword && formErrors.confirmPassword ? "text-destructive" : "text-gray-400"
                        }`} />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          className={`pl-10 pr-10 ${
                            touchedFields.confirmPassword && formErrors.confirmPassword
                              ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                              : "border-gray-200 focus:border-primary focus:ring-primary/20"
                          } transition-colors`}
                          placeholder="Confirm new password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          onBlur={() => handleFieldBlur('confirmPassword')}
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
                      className="w-full font-semibold py-3 text-lg bg-primary hover:bg-primary/90 transition-all duration-200"
                      disabled={resetPasswordMutation.isPending || showSuccess}
                      data-testid="button-reset-password"
                    >
                      {resetPasswordMutation.isPending ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Resetting...
                        </span>
                      ) : "Reset Password"}
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

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}