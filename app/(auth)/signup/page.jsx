"use client";

import  React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Eye,
  EyeOff,
  MapPin,
  Shield,
  Users,
  Car,
  Navigation,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "user",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // call your API route to create user
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const { error } = await res.json();
        toast.error(error || "Signup failed");
        setIsLoading(false);
        return;
      }

      toast.success("Account created successfully");

      // auto-login after signup
      const loginRes = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (loginRes?.error) {
        toast.error("Login failed after signup");
      } else {
        router.push(`/auth/onboarding?type=${formData.userType}`);
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div>
              <img src="/logo.png" className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">UrbanEyes</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground">
            Join thousands of users navigating smarter
          </p>
        </div>

        {/* Signup Form */}
        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Sign Up</CardTitle>
            <CardDescription className="text-center">
              Create your account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  required
                  className="bg-input border-border focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  required
                  className="bg-input border-border focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    required
                    className="bg-input border-border focus:ring-2 focus:ring-ring pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      updateFormData("confirmPassword", e.target.value)
                    }
                    required
                    className="bg-input border-border focus:ring-2 focus:ring-ring pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* User Type Selection */}
              <div className="space-y-3">
                <Label>Account Type</Label>
                <RadioGroup
                  value={formData.userType}
                  onValueChange={(value) => updateFormData("userType", value)}
                  className="grid grid-cols-1 gap-3"
                >
                  <div className="flex items-center space-x-3 border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="user" id="user" />
                    <div className="flex items-center space-x-2 flex-1">
                      <Navigation className="h-4 w-4 text-accent" />
                      <div>
                        <Label
                          htmlFor="user"
                          className="font-medium cursor-pointer"
                        >
                          Regular User
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Find routes and parking spots
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="parking-owner" id="parking-owner" />
                    <div className="flex items-center space-x-2 flex-1">
                      <Car className="h-4 w-4 text-accent" />
                      <div>
                        <Label
                          htmlFor="parking-owner"
                          className="font-medium cursor-pointer"
                        >
                          Parking Spot Owner
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Manage and rent parking spaces
                        </p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-accent hover:text-accent/80 font-medium transition-colors"
                >
                  Login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Trust Elements */}
        <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>Secure & Encrypted</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>Trusted by 10k+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
