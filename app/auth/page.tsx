"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Eye, EyeOff, Lock, User } from "lucide-react"

export default function AuthPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isResetMode, setIsResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const { signIn, resetPassword, error } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const email = `${username}@c2crail.net`

    if (isResetMode) {
      await resetPassword(email)
      setResetSent(true)
    } else {
      await signIn(email, password)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="relative min-h-screen w-full bg-background">
      {/* Background Dashboard Shell */}
      <div className="absolute inset-0 opacity-10">
        <div className="flex h-full">
          {/* Sidebar Shell */}
          <div className="w-[100px] bg-[hsl(var(--sidebar-bg))]"></div>

          {/* Main Content Shell */}
          <div className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              {/* Header Shell */}
              <div className="h-16 bg-[hsl(var(--card-bg))] rounded-lg mb-6"></div>

              {/* Content Shells */}
              <div className="h-40 bg-[hsl(var(--card-bg))] rounded-lg mb-6"></div>
              <div className="grid grid-cols-3 gap-6">
                <div className="h-32 bg-[hsl(var(--card-bg))] rounded-lg"></div>
                <div className="h-32 bg-[hsl(var(--card-bg))] rounded-lg"></div>
                <div className="h-32 bg-[hsl(var(--card-bg))] rounded-lg"></div>
              </div>
              <div className="h-64 bg-[hsl(var(--card-bg))] rounded-lg mt-6"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Form Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-lg border border-[hsl(var(--card-border))]">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">C2C Rail Learning Platform</h1>
            <p className="text-muted-foreground mt-2">
              {isResetMode ? "Reset your password" : "Sign in to access your account"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-500">{error}</div>
          )}

          {resetSent && (
            <div className="mb-6 p-3 bg-green-500/10 border border-green-500/30 rounded-md text-green-500">
              Password reset email sent. Please check your inbox.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex rounded-md overflow-hidden">
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="flex-grow pl-10 py-2 bg-muted text-foreground rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="first.last"
                      required
                    />
                    <div className="bg-muted/50 px-3 py-2 text-muted-foreground flex items-center">@c2crail.net</div>
                  </div>
                </div>
              </div>

              {!isResetMode && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 bg-muted text-foreground rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  {isResetMode ? "Send Reset Link" : "Sign In"}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsResetMode(!isResetMode)
                setResetSent(false)
              }}
              className="text-primary hover:underline text-sm"
            >
              {isResetMode ? "Back to Sign In" : "Forgot Password?"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
