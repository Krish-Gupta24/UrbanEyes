"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Navigation, MapPin, Camera, X } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    { icon: Navigation, label: "Route Planner", href: "/route", color: "bg-primary" },
    { icon: MapPin, label: "Find Parking", href: "/parking", color: "bg-accent" },
    { icon: Camera, label: "AR Landmarks", href: "/ar", color: "bg-chart-5" },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action buttons */}
      <div
        className={cn(
          "flex flex-col-reverse gap-3 mb-3 transition-all duration-300",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
        )}
      >
        {actions.map((action, index) => (
          <Link key={action.href} href={action.href}>
            <Button
              size="sm"
              className={cn(
                "h-12 px-4 shadow-lg transition-all duration-300 hover:scale-105",
                action.color,
                "text-white border-0",
              )}
              style={{
                animationDelay: `${index * 50}ms`,
                animation: isOpen ? "slideInRight 0.3s ease-out" : undefined,
              }}
            >
              <action.icon className="h-4 w-4 mr-2" />
              {action.label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Main FAB */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
          "bg-primary hover:bg-primary/90 border-0",
          isOpen && "rotate-45",
        )}
      >
        {isOpen ? <X className="h-6 w-6 text-white" /> : <Plus className="h-6 w-6 text-white" />}
      </Button>
    </div>
  )
}
