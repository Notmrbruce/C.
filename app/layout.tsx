import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/contexts/theme-context"

// Load the Inter font with Latin subset
const inter = Inter({ subsets: ["latin"] })

// Define metadata for the application
export const metadata: Metadata = {
  title: "C2C Rail Learning Platform",
  description: "A platform for learning and education for C2C Rail employees",
    generator: 'v0.dev'
}

/**
 * Root layout component
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components (pages)
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* ThemeProvider enables theme switching throughout the app */}
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
