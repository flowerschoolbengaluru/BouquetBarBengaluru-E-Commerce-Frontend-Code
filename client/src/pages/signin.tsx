import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/user-auth";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Mail, Lock, ShoppingBag, GraduationCap, Star } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import logoPath from "@assets/E_Commerce_Bouquet_Bar_Logo_1757484444893.png";

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: ""
  });
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { login } = useAuth();

  const signinMutation = useMutation({
    mutationFn: async (userData: { email: string; password: string }) => {
      return await apiRequest("/api/auth/signin", {
        method: "POST",
        body: JSON.stringify(userData),
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      // Save user data in localStorage, cookies and context
      login(data.user);

      // Additionally save to localStorage for persistence
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('isAuthenticated', 'true');
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      // Set user data in cache to trigger cart sync
      queryClient.setQueryData(["/api/auth/user"], data.user);
      // Invalidate auth queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/auth"] });
      
      setLocation("/shop");
    },
    onError: async (error: any) => {
      // Clear previous errors
      setErrors({
        email: "",
        password: "",
        general: ""
      });

      if (error?.response) {
        try {
          const status = error.response.status;
          const text = await error.response.text();
          
          console.log('Sign-in error:', { status, text }); // For debugging
          
          // Handle 401 Unauthorized - Invalid credentials
          if (status === 401) {
            // Show generic error message for security - don't reveal if email exists or not
            setErrors({
              email: "",
              password: "",
              general: "Invalid email or password. Please check your credentials and try again."
            });
            return;
          }
          
          // Handle 400 Bad Request
          if (status === 400) {
            setErrors({
              email: "",
              password: "Invalid password format.",
              general: ""
            });
            return;
          }

          // For other server errors
          setErrors({
            email: "",
            password: "",
            general: "Server error. Please try again later."
          });
          
        } catch (e) {
          // If we can't read the response
          setErrors({
            email: "",
            password: "",
            general: "Connection error. Please try again."
          });
        }
      } else if (error?.message) {
        // Network errors (no response from server)
        if (error.message.includes("Network") || error.message.includes("fetch")) {
          setErrors({
            email: "",
            password: "",
            general: "Network error. Please check your internet connection."
          });
        } else {
          setErrors({
            email: "",
            password: "",
            general: error.message
          });
        }
      } else {
        // Unknown error
        setErrors({
          email: "",
          password: "",
          general: "An unexpected error occurred. Please try again."
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({
      email: "",
      password: "",
      general: ""
    });

    // Validate form
    let hasError = false;
    const newErrors = {
      email: "",
      password: "",
      general: ""
    };

    if (!formData.email) {
      newErrors.email = "Email is required";
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      hasError = true;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    signinMutation.mutate({
      email: formData.email,
      password: formData.password,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
        general: ""
      });
    }
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
                Welcome Back
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Access your account to continue your floral journey with premium courses and flower collections.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Shop Premium Flowers</h3>
                  <p className="text-gray-600">Fresh flowers delivered to your door</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Continue Learning</h3>
                  <p className="text-gray-600">Access your enrolled courses</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Track Progress</h3>
                  <p className="text-gray-600">Monitor your learning journey</p>
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
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            </div>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">Sign In</CardTitle>
                <CardDescription className="text-gray-600">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* General Error Message */}
                {errors.general && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {errors.general}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
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
                          errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''
                        }`}
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        data-testid="input-email"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <span>•</span>
                        {errors.email}
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
                          errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''
                        }`}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        data-testid="input-password"
                      />
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <span>•</span>
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary/20 border-gray-300 rounded"
                        data-testid="checkbox-remember"
                      />
                      <Label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">
                        Remember me
                      </Label>
                    </div>

                    <div className="text-sm">
                      <Link href="/forgot-password">
                        <button
                          type="button"
                          className="text-primary hover:text-primary/80 font-medium"
                          data-testid="link-forgot-password"
                        >
                          Forgot password?
                        </button>
                      </Link>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full font-semibold py-3 text-lg"
                    disabled={signinMutation.isPending}
                    data-testid="button-signin"
                  >
                    {signinMutation.isPending ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <div className="text-center pt-4 border-t border-gray-100">
                  <p className="text-gray-600">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-primary hover:text-primary/80 font-semibold">
                      Create account
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