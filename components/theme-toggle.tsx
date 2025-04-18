/**
 * Theme Toggle Component
 *
 * This component provides a button to toggle between light and dark themes.
 * It uses the theme context to access the current theme and toggle function.
 *
 * The button displays a Moon icon in light mode and a Sun icon in dark mode,
 * indicating the theme that will be switched to when clicked.
 */
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"

export function ThemeToggle() {
  // Get the current theme and toggle function from the theme context
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="text-white p-2 hover:bg-gray-800 rounded-md transition-colors"
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {/* Show Moon icon in light mode, Sun icon in dark mode */}
      {theme === "light" ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
    </button>
  )
}
