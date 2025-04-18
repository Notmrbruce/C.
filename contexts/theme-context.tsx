/**
 * Theme Context
 *
 * This module provides theme management for the application.
 * It implements a context-based theme system that:
 * - Supports light and dark themes
 * - Persists theme preference in localStorage
 * - Respects system theme preference when no stored preference exists
 * - Provides a toggle function to switch between themes
 *
 * The context is consumed by components that need to access or modify the theme.
 */
"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

// Define the available theme options
type Theme = "light" | "dark"

// Define the shape of the theme context
type ThemeContextType = {
  theme: Theme // Current theme
  toggleTheme: () => void // Function to toggle between light and dark themes
}

// Create the theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * Theme Provider Component
 *
 * Wraps the application to provide theme state and toggle function
 * to all child components.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // State for the current theme
  const [theme, setTheme] = useState<Theme>("light")

  // Initialize theme from localStorage or system preference on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null

    // Check for stored theme or system preference
    if (storedTheme) {
      setTheme(storedTheme)
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark")
    }
  }, [])

  // Update document class and localStorage when theme changes
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Store theme preference in localStorage
    localStorage.setItem("theme", theme)
  }, [theme])

  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  // Provide the theme context to child components
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

/**
 * Custom hook to use the theme context
 *
 * Provides easy access to the theme context in functional components.
 *
 * @returns {ThemeContextType} The theme context
 * @throws {Error} If used outside of a ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
