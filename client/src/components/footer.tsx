import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Instagram, MessageCircle, Facebook, Linkedin, Twitter, CreditCard, Headphones } from "lucide-react";
import logoPath from "@assets/E_Commerce_Bouquet_Bar_Logo_1757433847861.png";
import { Link } from "wouter";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<"idle" | "success" | "error">("idle");

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNavigation = (path: string) => {
    if (path === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => {
        const heroSection = document.getElementById('home');
        const ShopSection = document.getElementById('shop')
        if (heroSection) {
          heroSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        if(ShopSection) {
          ShopSection.scrollIntoView({behavior:"smooth", block:"start"})
        }
      }, 100);
    }
  };

  // Updated newsletter submission with API integration
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newsletterEmail.trim()) return;

    setIsSubmitting(true);
    setSubscriptionStatus("idle");

    try {
      // Call your API endpoint
      await apiRequest('/api/landing/email', {
        method: 'POST',
        body: JSON.stringify({ email: newsletterEmail })
      });

      setSubscriptionStatus("success");
      setNewsletterEmail("");

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubscriptionStatus("idle");
      }, 5000);

    } catch (error) {
      console.error('Newsletter subscription failed:', error);
      setSubscriptionStatus("error");

      // Reset error message after 5 seconds
      setTimeout(() => {
        setSubscriptionStatus("idle");
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Social media links
  const socialLinks = {
    instagram:
      "https://www.instagram.com/theflowerschoolbengaluru?igsh=ZGUzMzM3NWJiOQ==",
    twitter: "https://x.com/flowerschoolblr?s=21",
    facebook: "https://www.facebook.com/share/1CXNE2aonp/",
    linkedin: "https://www.linkedin.com/company/theflowerschoolbengaluru/",
  };

  // Contact information
  const phoneNumber = "+91 99728 03847";
  const email = "info@flowerschoolbengaluru.com";
  const whatsappNumber = "+91 99728 03847";

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-white border-t border-gray-300">
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Brand Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-6 mb-8">
              <img src={logoPath} alt="Bouquet Bar Logo" className="h-16 w-auto" />
              <div className="text-left">
                <h2 className="text-3xl font-bold text-gray-900 tracking-wide">
                  Bouquet Bar
                </h2>
                <p className="text-lg text-gray-600 font-medium">Bengaluru, India</p>
              </div>
            </div>

            {/* Brand Description */}
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              India's premier floral design institute and online flower marketplace.
              Transforming passion into expertise through professional floral education and premium flower collections.
            </p>

            {/* Info Section (2 items, centered side by side) */}
            <div className="mt-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto text-center">
                {/* Safe Payments */}
                <div className="flex flex-col items-center">
                  <CreditCard className="w-8 h-8 text-pink-600 mb-3" />
                  <h4 className="text-lg font-semibold text-gray-900">
                    100% Safe & Secure Payments
                  </h4>
                  <p className="text-sm text-gray-600 mt-2">
                    Pay using secure payment methods
                  </p>
                </div>

                {/* Help Center */}
                <div className="flex flex-col items-center">
                  <Headphones className="w-8 h-8 text-pink-600 mb-3" />
                  <h4 className="text-lg font-semibold text-gray-900">
                    Dedicated Help Center
                  </h4>
                  <p className="text-sm text-gray-600 mt-2">Chat With Us</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Links Grid (3 columns spread evenly) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 md:gap-16 mb-16">
            {/* Company Information */}
            <div className="space-y-6">
              <h4 className="text-xl font-semibold text-gray-900 pb-2 inline-block">
                Company
              </h4>
              <div className="space-y-4">
                <p className="text-gray-600 text-sm leading-relaxed font-light">
                  Established as India's leading floral education institute, we combine
                  traditional artistry with modern techniques.
                </p>
                {/* Contact Information */}
                <div className="mt-4 space-y-2">
                  <p className="text-gray-900 font-medium">Contact Us</p>
                  <p className="text-gray-600 text-sm">{phoneNumber}</p>
                  <p className="text-gray-600 text-sm">{email}</p>
                  <p className="text-gray-600 text-sm">
                    WhatsApp: {whatsappNumber}
                  </p>
                </div>

                {/* Social Media Links */}
                <div className="mt-6">
                  <p className="text-gray-900 font-medium mb-2">Follow Us</p>
                  <div className="flex space-x-3">
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-200 hover:bg-pink-100 text-gray-700 p-3 rounded-lg transition-all duration-300 hover:scale-105"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                    <a
                      href={socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-200 hover:bg-blue-100 text-gray-700 p-3 rounded-lg transition-all duration-300 hover:scale-105"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-200 hover:bg-blue-100 text-gray-700 p-3 rounded-lg transition-all duration-300 hover:scale-105"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-200 hover:bg-blue-100 text-gray-700 p-3 rounded-lg transition-all duration-300 hover:scale-105"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a
                      href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-200 hover:bg-green-100 text-gray-700 p-3 rounded-lg transition-all duration-300 hover:scale-105"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="space-y-6">
              <h4 className="text-xl font-semibold text-gray-900 pb-2 inline-block">
                Services
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/shop">
                    <button
                      onClick={() => {
                        if (window.location.pathname !== '/shop') {
                          window.location.href = '/shop#fresh-flowers';
                        } else {
                          scrollToSection('fresh-flowers');
                        }
                      }}
                      className="text-gray-600 hover:text-gray-900 transition-all duration-300 font-medium w-full text-left"
                    >
                      Fresh Flower Delivery
                    </button>
                  </Link>
                </li>
                <li>
                  <Link href="/shop">
                    <button
                      onClick={() => {
                        if (window.location.pathname !== '/shop') {
                          window.location.href = '/shop#premium';
                        } else {
                          scrollToSection('premium');
                        }
                      }}
                      className="text-gray-600 hover:text-gray-900 transition-all duration-300 font-medium w-full text-left"
                    >
                      Premium Arrangements
                    </button>
                  </Link>
                </li>
                <li>
                  <Link href="/shop">
                    <button
                      onClick={() => {
                        if (window.location.pathname !== '/shop') {
                          window.location.href = '/shop#wedding';
                        } else {
                          scrollToSection('wedding');
                        }
                      }}
                      className="text-gray-600 hover:text-gray-900 transition-all duration-300 font-medium w-full text-left"
                    >
                      Wedding Florals
                    </button>
                  </Link>
                </li>
                <li>
                  <Link href="/shop">
                    <button
                      onClick={() => {
                        if (window.location.pathname !== '/shop') {
                          window.location.href = '/shop#corporate';
                        } else {
                          scrollToSection('corporate');
                        }
                      }}
                      className="text-gray-600 hover:text-gray-900 transition-all duration-300 font-medium w-full text-left"
                    >
                      Corporate Events
                    </button>
                  </Link>
                </li>
                <li>
                  <Link href="/shop">
                    <button
                      onClick={() => {
                        if (window.location.pathname !== '/shop') {
                          window.location.href = '/shop#floral-design-courses';
                        } else {
                          scrollToSection('floral-design-courses');
                        }
                      }}
                      className="text-gray-600 hover:text-gray-900 transition-all duration-300 font-medium w-full text-left"
                    >
                      Unique Gift
                    </button>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-6">
              <h4 className="text-xl font-semibold text-gray-900 pb-2 inline-block">
                Support
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/shipping-info">
                    <button className="text-gray-600 hover:text-gray-900 transition-all duration-300 font-medium w-full text-left">
                      Delivery Policy
                    </button>
                  </Link>
                </li>
                <li>
                  <Link href="/refund-policy">
                    <button className="text-gray-600 hover:text-gray-900 transition-all duration-300 font-medium w-full text-left">
                      Refund Policy
                    </button>
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy">
                    <button className="text-gray-600 hover:text-gray-900 transition-all duration-300 font-medium w-full text-left">
                      Privacy Policy
                    </button>
                  </Link>
                </li>
                      
              </ul>

              {/* Updated Newsletter Section */}
              <div className="mt-6">
                <p className="text-gray-900 font-medium mb-2">Subscribe Now</p>
                <p className="text-gray-600 text-xs mb-3">
                  Get updates on promotions and offers coupons.
                </p>

                {/* Status Messages */}
                {subscriptionStatus === "success" && (
                  <div className="mb-3 p-2 bg-green-100 text-green-700 text-xs rounded">
                    ✅ Thank you for subscribing!
                  </div>
                )}

                {subscriptionStatus === "error" && (
                  <div className="mb-3 p-2 bg-red-100 text-red-700 text-xs rounded">
                    ❌ Subscription failed. Please try again.
                  </div>
                )}

                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    className="flex-1 h-8 text-xs"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="h-8 px-3 text-xs"
                    disabled={isSubmitting || !newsletterEmail.trim()}
                  >
                    {isSubmitting ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "→"
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-16">
            <div className="w-full h-px bg-gray-200 mb-8"></div>
            <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
              <div>
                <p className="text-gray-600 font-light">
                  &copy; 2024{" "}
                  <span className="text-gray-900 font-semibold">
                    Bouquet Bar
                  </span>
                  . All rights reserved.
                </p>
                <p className="text-gray-500 text-sm mt-1 font-light">
                  Professional Floral Institute | Bengaluru, India
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-gray-600 text-sm font-light">
                  Crafted with expertise for floral excellence
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}