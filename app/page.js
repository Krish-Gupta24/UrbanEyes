"use client";

import  React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Navigation,
  Camera,
  Zap,
  Globe,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { AnimatedCounter } from "@/components/animated-counter";
import { FloatingActionButton } from "@/components/floating-action-button";
import { FadeIn, SlideIn } from "@/components/page-transition";

export default function HomePage() {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const router = useRouter();

  const handleQuickSearch = () => {
    if (fromLocation.trim() || toLocation.trim()) {
      const params = new URLSearchParams();
      if (fromLocation.trim()) params.set("from", fromLocation.trim());
      if (toLocation.trim()) params.set("to", toLocation.trim());
      router.push(`/route?${params.toString()}`);
    } else {
      router.push("/route");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleQuickSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <SlideIn direction="left">
            <div className="flex items-center space-x-2">
              <img
                src="/logo.png"
                className="h-10 text-primary transition-transform hover:scale-110"
              />
              <span className="text-2xl font-bold text-foreground">
                UrbanEyes
              </span>
            </div>
          </SlideIn>
          <div className="hidden md:flex items-center space-x-6">
            <SlideIn direction="down" delay={0.1}>
              <Link
                href="/route"
                className="text-foreground hover:text-primary transition-all duration-300 hover:scale-105"
              >
                Route Planner
              </Link>
            </SlideIn>
            <SlideIn direction="down" delay={0.2}>
              <Link
                href="/parking"
                className="text-foreground hover:text-primary transition-all duration-300 hover:scale-105"
              >
                Parking Finder
              </Link>
            </SlideIn>
            <SlideIn direction="down" delay={0.3}>
              <Link
                href="/ar"
                className="text-foreground hover:text-primary transition-all duration-300 hover:scale-105"
              >
                AR Landmarks
              </Link>
            </SlideIn>
          </div>
          <SlideIn direction="right">
            <div className="flex items-center space-x-2">
              <ThemeToggle />
            </div>
          </SlideIn>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <Badge
              variant="secondary"
              className="mb-6 animate-pulse hover:scale-105 transition-transform"
            >
              <Zap className="h-4 w-4 mr-2" />
              Discover Smarter Travel
            </Badge>
          </FadeIn>

          <FadeIn delay={0.2}>
            <h1 className="text-5xl md:text-7xl font-bold text-balance mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent animate-gradient">
              Navigate Smarter with AR
            </h1>
          </FadeIn>

          <FadeIn delay={0.4}>
            <p className="text-xl text-muted-foreground text-balance mb-12 max-w-2xl mx-auto leading-relaxed">
              Discover the future of travel with intelligent route planning,
              real-time parking availability, and immersive AR landmark
              exploration. All in one powerful platform.
            </p>
          </FadeIn>

          {/* Quick Route Search */}
          <FadeIn delay={0.6}>
            <Card className="max-w-2xl mx-auto mb-12 shadow-lg border-0 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Quick Route Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="From: Current location"
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="bg-background transition-all duration-300 focus:scale-105"
                  />
                  <Input
                    placeholder="To: Taj Mahal, Agra"
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="bg-background transition-all duration-300 focus:scale-105"
                  />
                </div>
                <Button
                  className="w-full transition-all duration-300 hover:scale-105"
                  size="lg"
                  onClick={handleQuickSearch}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Find Best Route & Parking
                </Button>
              </CardContent>
            </Card>
          </FadeIn>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <SlideIn direction="left" delay={0.8}>
              <Link href="/route">
                <Button
                  size="lg"
                  className="w-full sm:w-auto transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <MapPin className="h-5 w-5 mr-2" />
                  Explore Route Planner
                </Button>
              </Link>
            </SlideIn>
            <SlideIn direction="right" delay={1.0}>
              <Link href="/ar">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto bg-transparent transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Try AR Landmarks
                </Button>
              </Link>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <FadeIn delay={0.2}>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-balance mb-4">
              Everything You Need for Smart Travel
            </h2>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Powered by cutting-edge technology and designed for the modern
              traveler
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Navigation,
              title: "Smart Route Planning",
              description:
                "Get the fastest and most efficient routes with real-time traffic data and intelligent optimization.",
              color: "primary",
              delay: 0.4,
            },
            {
              icon: MapPin,
              title: "Real-time Parking",
              description:
                "Find available parking spots near your destination with live availability updates and pricing.",
              color: "accent",
              delay: 0.6,
            },
            {
              icon: Camera,
              title: "AR Landmark Info",
              description:
                "Point your camera at landmarks to discover rich historical information and interactive content.",
              color: "chart-5",
              delay: 0.8,
            },
          ].map((feature, index) => (
            <SlideIn key={feature.title} direction="up" delay={feature.delay}>
              <Card className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-0 bg-card/50 backdrop-blur-sm cursor-pointer">
                <CardHeader>
                  <div
                    className={`h-12 w-12 bg-${feature.color}/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-${feature.color}/20 transition-all duration-300 group-hover:scale-110`}
                  >
                    <feature.icon className={`h-6 w-6 text-${feature.color}`} />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="group-hover:text-foreground transition-colors duration-300">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </SlideIn>
          ))}
        </div>
      </section>

      {/* Demo Stats */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              {
                end: 50000,
                suffix: "+",
                label: "Routes Calculated",
                color: "text-primary",
              },
              {
                end: 12000,
                suffix: "+",
                label: "Parking Spots",
                color: "text-accent",
              },
              {
                end: 500,
                suffix: "+",
                label: "AR Landmarks",
                color: "text-chart-5",
              },
              {
                end: 99.9,
                suffix: "%",
                label: "Uptime",
                color: "text-chart-3",
              },
            ].map((stat, index) => (
              <FadeIn key={stat.label} delay={index * 0.1}>
                <div className="group hover:scale-105 transition-transform duration-300">
                  <div className={`text-3xl font-bold mb-2 ${stat.color}`}>
                    <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                  </div>
                  <div className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {stat.label}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-sm py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <FadeIn>
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <img src="/logo.png" className="h-10 text-primary" />
                <span className="text-xl font-bold">UrbanEyes</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Built With Love </span>
                <Badge
                  variant="outline"
                  className="hover:scale-105 transition-transform"
                >
                  <Smartphone className="h-3 w-3 mr-1" />
                  Mobile Ready
                </Badge>
              </div>
            </FadeIn>
          </div>
        </div>
      </footer>

      <FloatingActionButton />
    </div>
  );
}
