"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  MapPin,
  Navigation,
  Car,
  Users,
  Shield,
  CheckCircle,
  ArrowRight,
  Star,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState ("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const type = searchParams.get("type") || "user";
    setUserType(type);
  }, [searchParams]);

  const userSteps = [
    {
      title: "Welcome to UrbanEyes!",
      description: "Your smart navigation companion",
      content: (
        <div className="text-center space-y-6">
          <div className="bg-primary/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto">
            <Navigation className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Smart Route Planning</h3>
            <p className="text-muted-foreground">
              Find the fastest routes with real-time traffic updates and
              intelligent parking suggestions.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Real-time traffic</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Parking finder</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>AR landmarks</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Smart suggestions</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Discover AR Features",
      description: "Explore landmarks with augmented reality",
      content: (
        <div className="text-center space-y-6">
          <div className="bg-accent/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto">
            <Star className="h-12 w-12 text-accent" />
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">AR Landmark Explorer</h3>
            <p className="text-muted-foreground">
              Point your camera at landmarks to discover rich historical
              information and interactive content.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Historical facts</span>
                <CheckCircle className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Audio guides</span>
                <CheckCircle className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Interactive overlays</span>
                <CheckCircle className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "You're All Set!",
      description: "Start exploring with UrbanEyes",
      content: (
        <div className="text-center space-y-6">
          <div className="bg-primary/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto">
            <Users className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Ready to Navigate!</h3>
            <p className="text-muted-foreground">
              Join thousands of users who trust UrbanEyes for their daily
              navigation needs.
            </p>
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-lg">10k+</div>
                  <div className="text-muted-foreground">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">50k+</div>
                  <div className="text-muted-foreground">Routes Planned</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">4.8★</div>
                  <div className="text-muted-foreground">User Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const ownerSteps = [
    {
      title: "Welcome, Parking Owner!",
      description: "Manage your parking business efficiently",
      content: (
        <div className="text-center space-y-6">
          <div className="bg-primary/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto">
            <Car className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              Parking Management Made Easy
            </h3>
            <p className="text-muted-foreground">
              Streamline your parking operations with our comprehensive
              management tools.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Real-time monitoring</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Automated billing</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Analytics dashboard</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Mobile management</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Setup Your Parking Spots",
      description: "Configure your parking inventory",
      content: (
        <div className="text-center space-y-6">
          <div className="bg-accent/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto">
            <Shield className="h-12 w-12 text-accent" />
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Easy Spot Management</h3>
            <p className="text-muted-foreground">
              Add your parking spots, set pricing, and manage availability with
              simple tools.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Add parking spots</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs bg-transparent"
                >
                  +/-
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Set pricing rules</span>
                <span className="text-xs text-muted-foreground">$5/hour</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Generate parking slips</span>
                <CheckCircle className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Start Managing Today!",
      description: "Access your admin dashboard",
      content: (
        <div className="text-center space-y-6">
          <div className="bg-primary/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto">
            <Users className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Your Dashboard Awaits!</h3>
            <p className="text-muted-foreground">
              Access powerful tools to manage your parking business and maximize
              revenue.
            </p>
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-lg">24/7</div>
                  <div className="text-muted-foreground">Monitoring</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">95%</div>
                  <div className="text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">$2k+</div>
                  <div className="text-muted-foreground">Avg Revenue</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const steps = userType === "parking-owner" ? ownerSteps : userSteps;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      const redirectPath =
        userType === "parking-owner" ? "/admin/dashboard" : "/";
      router.push(redirectPath);
    }
  };

  const handleSkip = () => {
    const redirectPath =
      userType === "parking-owner" ? "/admin/dashboard" : "/";
    router.push(redirectPath);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-primary rounded-lg p-2">
              <MapPin className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">UrbanEyes</span>
          </div>
          <Progress value={progress} className="w-full h-2" />
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Onboarding Card */}
        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {steps[currentStep].title}
            </CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {steps[currentStep].content}

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip for now
              </Button>

              <Button
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Navigation dots */}
        <div className="flex justify-center space-x-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
