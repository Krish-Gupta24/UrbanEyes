"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Navigation, Menu, Globe } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function MainNavigation() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/route", label: "Route Planner" },
    { href: "/parking", label: "Parking Finder" },
    { href: "/ar", label: "AR Landmarks" },
  ]

  return (
    <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <Navigation className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
          <span className="text-2xl font-bold text-foreground">UrbanEyes</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navItems.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-foreground hover:text-primary transition-all duration-300 hover:scale-105 relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-105 bg-transparent">
            <Globe className="h-4 w-4 mr-2" />
            EN
          </Button>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="outline"
                size="sm"
                className="transition-all duration-300 hover:scale-105 bg-transparent"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-lg text-foreground hover:text-primary transition-all duration-300 hover:translate-x-2 p-2 rounded-lg hover:bg-muted"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
