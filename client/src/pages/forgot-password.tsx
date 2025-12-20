import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Phone, Mail, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import logoPath from "@assets/E_Commerce_Bouquet_Bar_Logo_1757484444893.png";

type FormErrors = {
  email?: string;
  phone?: string;
  general?: string;
};

export default function ForgotPassword() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    phone: false
  });
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: { 
      contact: string; 
      contactType: "phone";
      phone: string;
      email: string;
    }) => {
      return await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "OTP Sent Successfully!",
        description: "Verification code has been sent to your registered phone number via SMS",
      });
      
      // Navigate to OTP verification with phone info
      const fullPhoneNumber = countryCode + phoneNumber.replace(/\D/g, '');
      setLocation(`/verify-otp?contact=${encodeURIComponent(fullPhoneNumber)}&type=phone`);
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to send verification code";
      
      // Check for specific error messages from backend
      if (errorMessage.includes("Email and phone number do not belong to the same account")) {
        setFormErrors({
          general: "Your phone number is not registered with this email. Please check your details."
        });
      } else if (errorMessage.includes("User not found with this phone number")) {
        setFormErrors({
          phone: "No account found with this phone number. Please check your phone number."
        });
      } else if (errorMessage.includes("Phone number and email are required")) {
        setFormErrors({
          general: "Please enter both your phone number and email address"
        });
      } else {
        setFormErrors({
          general: errorMessage
        });
      }
    },
  });

  const validatePhoneNumber = (phone: string): string | undefined => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) {
      return "Phone number is required";
    }
    if (cleanPhone.length < 10) {
      return "Phone number must be at least 10 digits";
    }
    if (cleanPhone.length > 10) {
      return "Phone number cannot exceed 10 digits";
    }
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email) {
      return "Email address is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;
    
    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) errors.phone = phoneError;
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldBlur = (field: 'email' | 'phone') => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    
    // Validate the specific field
    if (field === 'email') {
      const error = validateEmail(email);
      setFormErrors(prev => ({ ...prev, email: error }));
    } else if (field === 'phone') {
      const error = validatePhoneNumber(phoneNumber);
      setFormErrors(prev => ({ ...prev, phone: error }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouchedFields({ email: true, phone: true });
    
    // Clear previous general errors
    setFormErrors(prev => ({ ...prev, general: undefined }));
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    // Prepare phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const fullPhoneNumber = countryCode + cleanPhone;
    
    // Send request with both phone and email
    forgotPasswordMutation.mutate({
      contact: fullPhoneNumber,
      contactType: "phone",
      phone: fullPhoneNumber,
      email: email,
    });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Only allow numbers, spaces, and dashes for formatting
    value = value.replace(/[^\d\s-]/g, '');
    
    // Format as XXX XXX XXXX for better readability
    if (value.length <= 10) {
      if (value.length > 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{0,4})/, '$1 $2 $3');
      } else if (value.length > 3) {
        value = value.replace(/(\d{3})(\d{0,3})/, '$1 $2');
      }
    }
    
    setPhoneNumber(value);
    
    // Clear phone error when user starts typing
    if (formErrors.phone && touchedFields.phone) {
      const error = validatePhoneNumber(value);
      setFormErrors(prev => ({ ...prev, phone: error }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    
    // Clear email error when user starts typing
    if (formErrors.email && touchedFields.email) {
      const error = validateEmail(e.target.value);
      setFormErrors(prev => ({ ...prev, email: error }));
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
                Forgot Your
                <span className="block text-pink-600">Password?</span>
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-pink-800">
                Enter your registered phone number and email to receive a secure verification code via SMS.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-pink-900">Dual Verification</h3>
                    <p className="text-pink-700">We verify both phone and email match your account</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-pink-900">Account Security</h3>
                    <p className="text-pink-700">Both email and phone must match your registered account</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-pink-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-pink-900">SMS OTP</h3>
                    <p className="text-pink-700">Verification code sent to your registered phone number</p>
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
              <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
            </div>

            {/* Back Button */}
            <Link href="/signin">
              <Button variant="ghost" className="mb-6 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </Link>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">Forgot Password</CardTitle>
                <CardDescription className="text-gray-600">
                  Enter your registered phone number and email to receive verification code via SMS
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* General Error Display */}
                {formErrors.general && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="font-medium text-destructive">Verification Error</p>
                        <p className="text-sm text-destructive/90">{formErrors.general}</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field - Required */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email" className="text-gray-700 font-medium">
                        Registered Email Address <span className="text-red-500">*</span>
                      </Label>
                      {touchedFields.email && formErrors.email && (
                        <span className="text-xs text-destructive font-medium">
                          {formErrors.email}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                        touchedFields.email && formErrors.email ? "text-destructive" : "text-gray-400"
                      }`} />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className={`pl-10 ${
                          touchedFields.email && formErrors.email
                            ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                            : "border-gray-200 focus:border-primary focus:ring-primary/20"
                        } text-base transition-colors`}
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={handleEmailChange}
                        onBlur={() => handleFieldBlur('email')}
                        data-testid="input-email"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Must match the email registered with your account
                    </p>
                  </div>

                  {/* Phone Number Field - Required */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="phone" className="text-gray-700 font-medium">
                        Registered Phone Number <span className="text-red-500">*</span>
                      </Label>
                      {touchedFields.phone && formErrors.phone && (
                        <span className="text-xs text-destructive font-medium">
                          {formErrors.phone}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Select value={countryCode} onValueChange={setCountryCode}>
                        <SelectTrigger className={`w-[100px] ${
                          touchedFields.phone && formErrors.phone
                            ? "border-destructive focus:border-destructive"
                            : "border-gray-200 focus:border-primary"
                        }`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+91">🇮🇳 +91</SelectItem>
                          <SelectItem value="+1">🇺🇸 +1</SelectItem>
                          <SelectItem value="+44">🇬🇧 +44</SelectItem>
                          <SelectItem value="+65">🇸🇬 +65</SelectItem>
                          <SelectItem value="+971">🇦🇪 +971</SelectItem>
                          <SelectItem value="+86">🇨🇳 +86</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="relative flex-1">
                        <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                          touchedFields.phone && formErrors.phone ? "text-destructive" : "text-gray-400"
                        }`} />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          required
                          className={`pl-10 ${
                            touchedFields.phone && formErrors.phone
                              ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                              : "border-gray-200 focus:border-primary focus:ring-primary/20"
                          } text-base transition-colors`}
                          placeholder="000 000 0000"
                          value={phoneNumber}
                          onChange={handlePhoneChange}
                          onBlur={() => handleFieldBlur('phone')}
                          maxLength={13}
                          data-testid="input-phone"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs text-gray-500">
                        We'll verify this matches your registered email, then send OTP via SMS
                      </p>
                      <p className="text-xs text-primary font-medium">
                        💡 Tip: Both email and phone must belong to the same account
                      </p>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full font-semibold py-3 text-lg bg-primary hover:bg-primary/90 transition-all duration-200"
                    disabled={forgotPasswordMutation.isPending}
                    data-testid="button-send-otp"
                  >
                    {forgotPasswordMutation.isPending ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      "Send Verification Code"
                    )}
                  </Button>
                </form>

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