/**
 * Authentication Page Component
 *
 * This component provides the authentication interface for the application.
 * It includes:
 * - Email-based authentication form
 * - Email confirmation view
 * - Development mode login simulation
 *
 * The authentication flow is:
 * 1. User enters their C2C Rail email address
 * 2. System would send a magic link (simulated in this implementation)
 * 3. User is shown a confirmation screen
 *
 * For development purposes, there's also a "Simulate Login" button
 * that bypasses the actual authentication flow.
 */
"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"

export default function AuthPage() {
  // State for the email input field
  const [username, setUsername] = useState("")
  // State to track if the "email sent" confirmation should be shown
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()

  /**
   * Handles the submission of the authentication form
   * In a real implementation, this would trigger sending a magic link email
   *
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real implementation, this would send a magic link
    setEmailSent(true)
  }

  /**
   * Simulates a successful login for development purposes
   * Sets authentication state in localStorage and redirects to dashboard
   */
  const handleSimulateLogin = () => {
    // Store authentication state in localStorage
    localStorage.setItem("simulatedAuth", "true")
    // Redirect to dashboard
    router.push("/")
  }

  /**
   * Dashboard Shell Background Component
   *
   * Renders a simplified, blurred version of the dashboard as a background
   * to provide visual context for the authentication form
   */
  const DashboardShell = () => (
    <div className="absolute inset-0 z-0 opacity-10 blur-sm pointer-events-none">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-[100px] bg-gray-900"></div>

      {/* Main content */}
      <div className="ml-[100px] p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="h-16 bg-gray-200 rounded-lg mb-6"></div>

          {/* Welcome section */}
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>

          {/* Course cards */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Dashboard shell background */}
      <DashboardShell />

      {/* Auth form */}
      <div className="z-10 w-full max-w-md p-8 bg-card rounded-lg shadow-lg border border-border">
        {!emailSent ? (
          // Initial authentication form
          <>
            <h1 className="text-2xl font-bold text-center mb-2 text-foreground">Authentication Required</h1>
            <p className="text-center text-muted-foreground mb-1">Access is restricted to C2C Rail employees only</p>
            <p className="text-center text-muted-foreground mb-6">Enter your C2C email to receive a sign-in link</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                  Email
                </label>
                {/* Email input with domain suffix appended */}
                <div className="flex">
                  <Input
                    id="email"
                    type="text"
                    placeholder="first.last"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="rounded-r-none"
                    required
                  />
                  <div className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-input bg-muted text-muted-foreground">
                    @c2crail.net
                  </div>
                </div>
              </div>

              {/* Authentication instructions */}
              <div className="text-sm text-muted-foreground space-y-2">
                <p>You must use your @c2crail.net email address to access the platform</p>
                <p>You must access the email link on the same device you are attempting to log in from</p>
              </div>

              {/* Alert about checking junk folder */}
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-amber-700">
                      The login link will be sent to your email. Please check your junk/spam folder.
                    </p>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Send Login Link
              </Button>
            </form>
          </>
        ) : (
          // Email sent confirmation view
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-foreground">Check your email</h1>
            <p className="mb-2 text-muted-foreground">We've sent a login link to:</p>
            <p className="font-medium mb-6 text-foreground">{username}@c2crail.net</p>

            {/* Alert about checking junk folder */}
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded mb-6 text-left">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-700">
                    Please check your junk/spam folder if you don't see the email in your inbox.
                  </p>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={() => setEmailSent(false)}>
              Back to login
            </Button>
          </div>
        )}

        {/* Development mode button - for bypassing authentication during development */}
        <div className="mt-8 pt-4 border-t border-border">
          <Button onClick={handleSimulateLogin} className="w-full bg-green-600 hover:bg-green-700 text-white">
            Simulate Login (Skip Authentication)
          </Button>
          <p className="text-xs text-center mt-2 text-muted-foreground">Development mode only</p>
        </div>
      </div>
    </div>
  )
}
