"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn, SlideIn } from "@/components/page-transition";
import { Zap, MapPin } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10 flex flex-col justify-center items-center text-center px-4">
      {/* Badge */}
      <FadeIn>
        <Badge
          variant="secondary"
          className="mb-6 animate-pulse hover:scale-105 transition-transform"
        >
          <Zap className="h-4 w-4 mr-2" />
          404 • Page Not Found
        </Badge>
      </FadeIn>

      {/* Heading */}
      <FadeIn delay={0.2}>
        <h1 className="text-5xl md:text-7xl font-bold text-balance mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent animate-gradient">
          Oops! We Can’t Find That Page
        </h1>
      </FadeIn>

      {/* Description */}
      <FadeIn delay={0.4}>
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed">
          The page you are looking for doesn’t exist or may have been moved. Use
          the buttons below to navigate back to safety.
        </p>
      </FadeIn>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
        <SlideIn direction="left" delay={0.6}>
          <Link href="/">
            <Button
              size="lg"
              className="w-full sm:w-auto transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <MapPin className="h-5 w-5 mr-2" />
              Go to Home
            </Button>
          </Link>
        </SlideIn>
        <SlideIn direction="right" delay={0.8}>
          <Link href="/route">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto bg-transparent transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <MapPin className="h-5 w-5 mr-2" />
              Explore Route Planner
            </Button>
          </Link>
        </SlideIn>
      </div>

      {/* Optional Footer Note */}
      <FadeIn delay={1}>
        <p className="text-muted-foreground text-sm">
          If you believe this is a mistake, please check the URL or contact
          support.
        </p>
      </FadeIn>
    </div>
  );
}
