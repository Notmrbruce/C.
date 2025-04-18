/**
 * Protected Route Component
 *
 * This component provides route protection for authenticated routes.
 * It:
 * - Checks if the user is authenticated
 * - Redirects to the authentication page if not authenticated
 * - Shows a loading spinner while checking authentication status
 * - Renders children only if the user is authenticated
 *
 * This component should wrap any routes that require authentication.
 */
"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Get authentication state and loading status from auth context
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Redirect to auth page if not authenticated
  useEffect(() => {
    if (!loading && !user && pathname !== "/auth") {
      router.push("/auth")
    }
  }, [user, loading, router, pathname])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  // Don't render anything if not authenticated and not on auth page
  if (!user && pathname !== "/auth") {
    return null
  }

  // Render children if authenticated or on auth page
  return <>{children}</>
}
