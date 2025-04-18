/**
 * Authentication Context
 *
 * This module provides authentication state management and functions for the application.
 * It implements a context-based authentication system that:
 * - Manages user authentication state
 * - Provides sign-in, sign-out, and password reset functionality
 * - Restricts access to @c2crail.net email addresses only
 * - Handles authentication errors with appropriate messages
 *
 * The context is consumed by components that need to access or modify authentication state.
 */
"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"

/**
 * Authentication Context Type Definition
 *
 * Defines the shape of the authentication context with all available
 * properties and methods.
 */
type AuthContextType = {
  user: User | null // Current authenticated user or null if not authenticated
  loading: boolean // Loading state during authentication operations
  signIn: (email: string, password: string) => Promise<void> // Sign in function
  signOut: () => Promise<void> // Sign out function
  resetPassword: (email: string) => Promise<void> // Password reset function
  error: string | null // Error message from the last authentication operation
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Authentication Provider Component
 *
 * Wraps the application to provide authentication state and functions
 * to all child components.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State for the current authenticated user
  const [user, setUser] = useState<User | null>(null)
  // Loading state for authentication operations
  const [loading, setLoading] = useState(true)
  // Error state for authentication operations
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Set up authentication state listener on component mount
  useEffect(() => {
    // Subscribe to authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    // Clean up subscription on component unmount
    return () => unsubscribe()
  }, [])

  /**
   * Sign in with email and password
   *
   * Authenticates a user with their email and password.
   * Only allows @c2crail.net email addresses.
   *
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<void>}
   */
  const signIn = async (email: string, password: string) => {
    setError(null)
    try {
      // Validate email domain
      if (!email.endsWith("@c2crail.net")) {
        throw new Error("Only @c2crail.net email addresses are allowed")
      }

      await signInWithEmailAndPassword(auth, email, password)
      router.push("/")
    } catch (error: any) {
      console.error("Authentication error:", error)

      // Handle specific Firebase error codes with user-friendly messages
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        setError("Invalid email or password")
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed login attempts. Please try again later")
      } else {
        setError(error.message || "An error occurred during sign in")
      }
    }
  }

  /**
   * Sign out the current user
   *
   * Logs out the current user and redirects to the authentication page.
   *
   * @returns {Promise<void>}
   */
  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      router.push("/auth")
    } catch (error: any) {
      console.error("Sign out error:", error)
      setError(error.message)
    }
  }

  /**
   * Reset user password
   *
   * Sends a password reset email to the specified address.
   * Only allows @c2crail.net email addresses.
   *
   * @param {string} email - Email address to send the reset link to
   * @returns {Promise<void>}
   */
  const resetPassword = async (email: string) => {
    setError(null)
    try {
      // Validate email domain
      if (!email.endsWith("@c2crail.net")) {
        throw new Error("Only @c2crail.net email addresses are allowed")
      }

      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      console.error("Password reset error:", error)
      setError(error.message)
    }
  }

  // Provide the authentication context to child components
  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, resetPassword, error }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to use the authentication context
 *
 * Provides easy access to the authentication context in functional components.
 *
 * @returns {AuthContextType} The authentication context
 * @throws {Error} If used outside of an AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
