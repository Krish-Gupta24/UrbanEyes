"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleToggle = () => {
    const currentTheme = resolvedTheme || theme || "light"
    if (currentTheme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  const getIcon = () => {
    const currentTheme = resolvedTheme || theme || "light"
    if (currentTheme === "dark") {
      return <Moon className="h-4 w-4" />
    } else {
      return <Sun className="h-4 w-4" />
    }
  }

  const currentTheme = resolvedTheme || theme || "light"

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className="w-9 h-9 p-0 transition-all duration-300 hover:scale-105 bg-transparent"
      title={`Switch to ${currentTheme === "dark" ? "light" : "dark"} mode`}
    >
      {getIcon()}
      <span className="sr-only">Toggle theme (current: {currentTheme})</span>
    </Button>
  )
}
