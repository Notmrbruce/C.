/**
 * Dashboard Page Component
 *
 * This is the main dashboard page of the application.
 * It:
 * - Checks authentication status
 * - Shows loading state while checking authentication
 * - Redirects to auth page if not authenticated
 * - Displays the dashboard with course listings
 * - Provides logout functionality
 */
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar"
import AuthPage from "../auth-page"

export default function Dashboard() {
  const router = useRouter()
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  // Loading state while checking authentication
  const [loading, setLoading] = useState(true)

  // Check authentication status on component mount
  useEffect(() => {
    // Check if user is authenticated via simulation
    const simulatedAuth = localStorage.getItem("simulatedAuth")
    setIsAuthenticated(simulatedAuth === "true")
    setLoading(false)
  }, [])

  /**
   * Handle user logout
   * Clears authentication state and updates component state
   */
  const handleLogout = () => {
    localStorage.removeItem("simulatedAuth")
    setIsAuthenticated(false)
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage />
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar navigation */}
      <Sidebar activePage="home" />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header with title and logout button */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <div className="flex items-center gap-6">
              {/* Logout button */}
              <Button variant="outline" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                Logout (Simulation)
              </Button>
            </div>
          </div>

          {/* Welcome Section */}
          <div className="bg-[hsl(var(--card-bg))] rounded-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-foreground">Hello Josh!</h1>
            <p className="text-muted-foreground">It's good to see you again.</p>
          </div>

          {/* Courses Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-foreground">Explore Our Courses</h2>
            </div>
            {/* Course listings */}
            <div className="space-y-4">
              {/* Figma Course */}
              <div className="bg-[hsl(var(--card-bg))] rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M15 5H9a4 4 0 0 0 0 8h6a4 4 0 0 0 0-8zm0 6H9a2 2 0 0 1 0-4h6a2 2 0 0 1 0 4z" />
                      <path d="M9 13a4 4 0 0 0 0 8a4 4 0 0 0 0-8zm0 6a2 2 0 0 1 0-4 2 2 0 0 1 0 4z" />
                      <path d="M15 13a4 4 0 0 0 0 8a4 4 0 0 0 0-8zm0 6a2 2 0 0 1 0-4 2 2 0 0 1 0 4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Learn Figma</h3>
                    <p className="text-sm text-muted-foreground">by Christopher Morgan</p>
                  </div>
                </div>
                <Button className="bg-primary text-primary-foreground rounded-md px-4 py-2 hover:bg-primary/90">
                  View course
                </Button>
              </div>

              {/* Photography Course */}
              <div className="bg-[hsl(var(--card-bg))] rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Analog photography</h3>
                    <p className="text-sm text-muted-foreground">by Gordon Norman</p>
                  </div>
                </div>
                <Button className="bg-primary text-primary-foreground rounded-md px-4 py-2 hover:bg-primary/90">
                  View course
                </Button>
              </div>

              {/* Instagram Course */}
              <div className="bg-[hsl(var(--card-bg))] rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-yellow-500 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="18" cy="6" r="1.5" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Master Instagram</h3>
                    <p className="text-sm text-muted-foreground">by Sophie Gill</p>
                  </div>
                </div>
                <Button className="bg-primary text-primary-foreground rounded-md px-4 py-2 hover:bg-primary/90">
                  View course
                </Button>
              </div>

              {/* Drawing Course */}
              <div className="bg-[hsl(var(--card-bg))] rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M17 3L21 7L7 21L3 21L3 17L17 3Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Basics of drawing</h3>
                    <p className="text-sm text-muted-foreground">by Jean Tate</p>
                  </div>
                </div>
                <Button className="bg-primary text-primary-foreground rounded-md px-4 py-2 hover:bg-primary/90">
                  View course
                </Button>
              </div>

              {/* Photoshop Course */}
              <div className="bg-[hsl(var(--card-bg))] rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">Ps</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Photoshop - Essence</h3>
                    <p className="text-sm text-muted-foreground">by David Green</p>
                  </div>
                </div>
                <Button className="bg-primary text-primary-foreground rounded-md px-4 py-2 hover:bg-primary/90">
                  View course
                </Button>
              </div>
            </div>

            {/* View All Courses Button */}
            <div className="mt-8 flex justify-center">
              <Button
                onClick={() => router.push("/learning")}
                className="bg-primary text-primary-foreground rounded-md px-8 py-3 hover:bg-primary/90 flex items-center gap-2"
              >
                View All Courses
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
