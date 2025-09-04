"use client";

import React, { useState } from "react";
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
import { MapPin, Navigation, Camera, Zap, Smartphone, Eye, Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatedCounter } from "@/components/animated-counter";
import { FloatingActionButton } from "@/components/floating-action-button";
import { FadeIn, SlideIn } from "@/components/page-transition";

// ✅ Tailwind-safe color mapping
const colorClasses = {
  primary: {
    bg: "bg-blue-100/50",
    bgHover: "group-hover:bg-blue-200/50",
    text: "text-blue-600",
  },
  accent: {
    bg: "bg-purple-100/50",
    bgHover: "group-hover:bg-purple-200/50",
    text: "text-purple-600",
  },
  chart5: {
    bg: "bg-indigo-100/50",
    bgHover: "group-hover:bg-indigo-200/50",
    text: "text-indigo-600",
  },
};


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
    if (e.key === "Enter") handleQuickSearch();
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-gray-100 to-green-100">
        <div className="absolute inset-0 opacity-30">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(58, 134, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(58, 134, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Fake roads */}
        <div className="absolute top-1/3 left-0 right-0 h-1 bg-gray-300 transform rotate-12"></div>
        <div className="absolute top-2/3 left-0 right-0 h-1 bg-gray-300 transform -rotate-6"></div>
        <div className="absolute top-0 bottom-0 left-1/4 w-1 bg-gray-300 transform rotate-3"></div>
        <div className="absolute top-0 bottom-0 right-1/3 w-1 bg-gray-300 transform -rotate-2"></div>

        {/* Center marker */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full w-4 h-4 animate-ping opacity-75"></div>
            <div className="relative bg-blue-600 rounded-full w-4 h-4 border-2 border-white shadow-lg"></div>
          </div>
        </div>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <SlideIn direction="left">
              <div className="flex items-center space-x-2">
                <Link href="/" className="flex items-center space-x-2">
                  <img
                    src="/logo.png"
                    className="h-10 transition-transform hover:scale-110"
                  />
                  <span className="text-2xl font-bold text-foreground">
                    UrbanEyes
                  </span>
                </Link>
              </div>
            </SlideIn>
            <div className="hidden md:flex items-center space-x-6">
              <SlideIn direction="down" delay={0.1}>
                <Link href="/route" className="hover:text-primary">
                  Route Planner
                </Link>
              </SlideIn>
              <SlideIn direction="down" delay={0.2}>
                <Link href="/parking" className="hover:text-primary">
                  Parking Finder
                </Link>
              </SlideIn>
              <SlideIn direction="down" delay={0.3}>
                <Link href="/ar" className="hover:text-primary">
                  AR Landmarks
                </Link>
              </SlideIn>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Welcome Message */}
            <FadeIn>
              <div className="mb-8">
                <FadeIn>
                  <Badge
                    variant="secondary"
                    className="mb-6 animate-pulse hover:scale-105 transition-transform"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Smart City Navigation Platform
                  </Badge>
                </FadeIn>
                <h1 className="text-5xl md:text-7xl font-inter font-bold text-gray-800 mb-6 leading-tight">
                  Navigate
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {" "}
                    Smarter
                  </span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Experience the future of urban mobility with AI-powered
                  navigation, real-time parking intelligence, and immersive AR
                  guidance
                </p>
              </div>
            </FadeIn>

            {/* Search Bar */}
            <FadeIn delay={0.2}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleQuickSearch();
                }}
                className="relative"
              >
                <div className="flex items-center bg-white rounded-3xl shadow-2xl p-3 transition-all duration-300 hover:shadow-3xl focus-within:shadow-3xl focus-within:ring-4 focus-within:ring-blue-500/20 border border-gray-100">
                  <div className="flex items-center flex-1 px-4 py-3">
                    <Search className="h-6 w-6 text-gray-400 mr-4" />
                    <input
                      type="text"
                      placeholder="From: Current location"
                      value={fromLocation}
                      onChange={(e) => setFromLocation(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-xl font-roboto"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl p-4 transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl"
                  >
                    <ArrowRight className="h-7 w-7" />
                  </button>
                </div>
              </form>
            </FadeIn>

            {/* Quick Actions */}
            <FadeIn delay={0.4}>
              <div className="mt-12 flex justify-center space-x-6">
                <button
                  onClick={() => handleQuickSearch("Taj Mahal")}
                  className="flex items-center space-x-3 bg-white/90 hover:bg-white text-gray-700 px-6 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm hover:scale-105 border border-gray-200"
                >
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Taj Mahal</span>
                </button>
                <button
                  onClick={() => handleQuickSearch("Agra Fort")}
                  className="flex items-center space-x-3 bg-white/90 hover:bg-white text-gray-700 px-6 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm hover:scale-105 border border-gray-200"
                >
                  <MapPin className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Agra Fort</span>
                </button>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-20">
          <FadeIn delay={0.2}>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                Everything You Need for Smart Travel
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
                  "Get the fastest and most efficient routes with real-time traffic data.",
                color: "primary",
                delay: 0.4,
              },
              {
                icon: MapPin,
                title: "Real-time Parking",
                description:
                  "Find available parking spots near your destination with live updates.",
                color: "accent",
                delay: 0.6,
              },
              {
                icon: Camera,
                title: "AR Landmark Info",
                description:
                  "Point your camera at landmarks to discover rich historical insights.",
                color: "chart5",
                delay: 0.8,
              },
            ].map((feature) => {
              const colors = colorClasses[feature.color];
              return (
                <SlideIn
                  key={feature.title}
                  direction="up"
                  delay={feature.delay}
                >
                  <Card className="group hover:shadow-xl transition-all duration-500 border-0 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <div
                        className={`h-12 w-12 ${colors.bg} ${colors.bgHover} rounded-lg flex items-center justify-center mb-4`}
                      >
                        <feature.icon className={`h-6 w-6 ${colors.text}`} />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </SlideIn>
              );
            })}
          </div>
        </section>

        {/* Stats */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                {
                  end: 50000,
                  suffix: "+",
                  label: "Routes Calculated",
                  color: "text-blue-600",
                },
                {
                  end: 12000,
                  suffix: "+",
                  label: "Parking Spots",
                  color: "text-purple-600",
                },
                {
                  end: 500,
                  suffix: "+",
                  label: "AR Landmarks",
                  color: "text-indigo-600",
                },
                {
                  end: 99.9,
                  suffix: "%",
                  label: "Uptime",
                  color: "text-blue-500",
                },
              ].map((stat, index) => (
                <FadeIn key={stat.label} delay={index * 0.1}>
                  <div className="group hover:scale-105 transition-transform duration-300">
                    <div className={`text-3xl font-bold mb-2 ${stat.color}`}>
                      <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                    </div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-background/80 backdrop-blur-sm py-12">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
            <FadeIn>
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <img src="/logo.png" className="h-10" />
                <span className="text-xl font-bold">UrbanEyes</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Built With Love</span>
                <Badge variant="outline">
                  <Smartphone className="h-3 w-3 mr-1" />
                  Mobile Ready
                </Badge>
              </div>
            </FadeIn>
          </div>
        </footer>

        <FloatingActionButton />
      </div>
    </div>
  );
}
