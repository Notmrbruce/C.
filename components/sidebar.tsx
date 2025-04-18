/**
 * Sidebar Component
 *
 * This component renders the main navigation sidebar for the application.
 * It provides navigation links to different sections of the app and includes
 * a logout button and theme toggle.
 *
 * @param {Object} props - Component props
 * @param {string} [props.activePage="home"] - The currently active page to highlight in the sidebar
 */
"use client"

import { Home, Calendar, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"

export function Sidebar({ activePage = "home" }: { activePage?: string }) {
  const router = useRouter()

  /**
   * Handles user logout
   *
   * This function:
   * 1. Clears all authentication-related data from localStorage and sessionStorage
   * 2. Redirects the user to the authentication page
   *
   * It ensures complete cleanup of auth state to prevent any lingering authentication issues
   */
  const handleLogout = () => {
    // Clear the simulated authentication state
    localStorage.removeItem("simulatedAuth")
    // Also clear any other potential auth tokens or state that might be stored
    localStorage.removeItem("authToken")
    localStorage.removeItem("userSession")
    sessionStorage.removeItem("authState")

    // Redirect to the authentication page
    router.push("/auth")
  }

  return (
    <div className="w-[100px] bg-[hsl(var(--sidebar-bg))] flex flex-col items-center py-8 gap-12">
      {/* Logo/Brand identifier */}
      <div className="text-[hsl(var(--sidebar-text))] text-3xl font-bold">C.</div>

      {/* Navigation buttons container */}
      <div className="flex flex-col gap-10 items-center">
        {/* Home navigation button */}
        <button
          className={`text-[hsl(var(--sidebar-text))] p-2 rounded-md ${
            activePage === "home" ? "bg-[hsl(var(--sidebar-active))]" : "hover:bg-[hsl(var(--sidebar-hover))]"
          } transition-colors`}
          onClick={() => router.push("/")}
        >
          <Home className="w-6 h-6" />
        </button>

        {/* Learning modules navigation button */}
        <button
          onClick={() => router.push("/learning")}
          className={`text-[hsl(var(--sidebar-text))] p-2 rounded-md ${
            activePage === "learning" ? "bg-[hsl(var(--sidebar-active))]" : "hover:bg-[hsl(var(--sidebar-hover))]"
          } transition-colors`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
          </svg>
        </button>

        {/* Calendar navigation button */}
        <button
          onClick={() => router.push("/calendar")}
          className={`text-[hsl(var(--sidebar-text))] p-2 rounded-md ${
            activePage === "calendar" ? "bg-[hsl(var(--sidebar-active))]" : "hover:bg-[hsl(var(--sidebar-hover))]"
          } transition-colors`}
        >
          <Calendar className="w-6 h-6" />
        </button>

        {/* Theme toggle button - imported from ThemeToggle component */}
        <ThemeToggle />
      </div>

      {/* Logout button - positioned at the bottom of the sidebar */}
      <div className="mt-auto">
        <button
          onClick={() => {
            // Confirmation dialog to prevent accidental logout
            if (confirm("Are you sure you want to log out?")) {
              handleLogout()
            }
          }}
          className="text-[hsl(var(--sidebar-text))] p-2 hover:bg-[hsl(var(--sidebar-hover))] rounded-md transition-colors"
          title="Logout"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
