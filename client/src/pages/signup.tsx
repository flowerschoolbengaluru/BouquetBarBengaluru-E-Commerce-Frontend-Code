import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/user-auth";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { ArrowLeft, User, Mail, Phone, Lock, ChevronDown, AlertCircle, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import logoPath from "@assets/E_Commerce_Bouquet_Bar_Logo_1757484444893.png";

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { login } = useAuth();

  const signupMutation = useMutation({
    mutationFn: async (userData: { firstName: string; lastName: string; email: string; phone: string; password: string }) => {
      return await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(userData),
      });
    },
    onSuccess: async (response) => {
      setFieldErrors({});
      setShowErrorAlert(false);
      const data = await response.json();
      login(data.user);
      
      // Show success toast
      toast({
        title: "🎉 Welcome to Bouquet Bar!",
        description: `Account created successfully for ${data.user.firstname}!`,
        duration: 3000,
      });
    },
    onError: async (error: any) => {
      let errorMsg = "Failed to create account. Please try again.";
      setFieldErrors({});
      
      if (error?.response) {
        try {
          const data = await error.response.json();
          
          // Handle different error types
          if (data.errors) {
            setFieldErrors(data.errors);
            // Show the first field error in alert
            const firstError = Object.values(data.errors)[0] as string;
            setErrorMessage(firstError || errorMsg);
            setShowErrorAlert(true);
          } else if (data.message) {
            errorMsg = data.message;
            setErrorMessage(errorMsg);
            setShowErrorAlert(true);
          } else if (data.error) {
            errorMsg = data.error;
            setErrorMessage(errorMsg);
            setShowErrorAlert(true);
          }
        } catch {
          errorMsg = error.message || errorMsg;
          setErrorMessage(errorMsg);
          setShowErrorAlert(true);
        }
      } else if (error.message) {
        errorMsg = error.message;
        setErrorMessage(errorMsg);
        setShowErrorAlert(true);
      }

      // Also show toast for immediate feedback
      toast({
        title: "Account Creation Failed",
        description: errorMsg,
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password should include uppercase, lowercase letters and numbers";
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setFieldErrors({});
    setShowErrorAlert(false);

    // Validate form
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      
      // Show the first validation error in alert
      const firstError = Object.values(validationErrors)[0];
      setErrorMessage(firstError);
      setShowErrorAlert(true);
      
      toast({
        title: "Validation Error",
        description: firstError,
        variant: "destructive",
      });
      return;
    }

    signupMutation.mutate({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: countryCode + formData.phone,
      password: formData.password,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    // Clear general error alert when user modifies any field
    if (showErrorAlert) {
      setShowErrorAlert(false);
    }
  };

  const closeErrorAlert = () => {
    setShowErrorAlert(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
      <div className="flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-pink-200/80 via-rose-200/60 to-pink-300/80 relative overflow-hidden">
          <div className="flex flex-col justify-center px-12 relative z-10">
            <div className="mb-8">
              <img src={logoPath} alt="Bouquet Bar Logo" className="h-28 w-auto mb-6" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Join Bouquet Bar
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Start your journey in professional floral design and access premium flower collections.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Shop Premium Flowers</h3>
                  <p className="text-gray-600">Fresh flowers delivered to your door</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                  <Lock className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Premium Access</h3>
                  <p className="text-gray-600">Exclusive courses and flower collections</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-12">
          <div className="w-full max-w-md mx-auto">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <img src={logoPath} alt="Bouquet Bar Logo" className="h-24 w-auto mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Join Bouquet Bar</h2>
            </div>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
                <CardDescription className="text-gray-600">
                  Enter your details to join our floral community
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Error Alert */}
                {showErrorAlert && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-in fade-in duration-300">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-red-800 font-medium">Account creation failed</p>
                      <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={closeErrorAlert}
                      className="h-6 w-6 text-red-600 hover:bg-red-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          required
                          className={`pl-10 border-gray-200 focus:border-primary focus:ring-primary/20 ${
                            fieldErrors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                          }`}
                          placeholder="First name"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          data-testid="input-first-name"
                        />
                      </div>
                      {fieldErrors.firstName && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {fieldErrors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          required
                          className={`pl-10 border-gray-200 focus:border-primary focus:ring-primary/20 ${
                            fieldErrors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                          }`}
                          placeholder="Last name"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          data-testid="input-last-name"
                        />
                      </div>
                      {fieldErrors.lastName && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {fieldErrors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className={`pl-10 border-gray-200 focus:border-primary focus:ring-primary/20 ${
                          fieldErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                        }`}
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        data-testid="input-email"
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number</Label>
                    <div className="flex gap-2">
                      <Select value={countryCode} onValueChange={setCountryCode}>
                        <SelectTrigger className={`w-[100px] border-gray-200 focus:border-primary ${
                          fieldErrors.phone ? 'border-red-500 focus:border-red-500' : ''
                        }`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+91">+91</SelectItem>
                          <SelectItem value="+1">+1</SelectItem>
                          <SelectItem value="+44">+44</SelectItem>
                          <SelectItem value="+65">+65</SelectItem>
                          <SelectItem value="+971">+971</SelectItem>
                          <SelectItem value="+86">+86</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          required
                          className={`pl-10 border-gray-200 focus:border-primary focus:ring-primary/20 ${
                            fieldErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                          }`}
                          placeholder="00000 00000"
                          value={formData.phone}
                          onChange={handleInputChange}
                          data-testid="input-phone"
                        />
                      </div>
                    </div>
                    {fieldErrors.phone && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className={`pl-10 border-gray-200 focus:border-primary focus:ring-primary/20 ${
                          fieldErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                        }`}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleInputChange}
                        data-testid="input-password"
                      />
                    </div>
                    {fieldErrors.password && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.password}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Must be at least 6 characters with uppercase, lowercase letters and numbers
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        className={`pl-10 border-gray-200 focus:border-primary focus:ring-primary/20 ${
                          fieldErrors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                        }`}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        data-testid="input-confirm-password"
                      />
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full text-lg py-3 h-auto font-semibold bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                    disabled={signupMutation.isPending}
                    data-testid="button-signup"
                  >
                    {signupMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>

                <div className="text-center pt-4 border-t border-gray-100">
                  <p className="text-gray-600">
                    Already have an account?{" "}
                    <Link href="/signin" className="text-primary hover:text-primary/80 font-semibold">
                      Sign In
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