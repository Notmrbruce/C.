/**
 * Firebase Configuration
 *
 * This module initializes and exports Firebase services for use throughout the application.
 * It handles:
 * - Firebase app initialization
 * - Authentication service setup
 * - Environment variable configuration
 *
 * The Firebase configuration is loaded from environment variables for security.
 */
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"

/**
 * Firebase configuration object
 *
 * These values are loaded from environment variables to keep sensitive
 * information out of the codebase. In a production environment, these
 * should be set in the deployment platform (e.g., Vercel).
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase app (or get existing app if already initialized)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

// Initialize Firebase Authentication
const auth = getAuth(app)

// Export Firebase services for use in other modules
export { app, auth }
