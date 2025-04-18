/**
 * Tailwind CSS Configuration
 *
 * This file configures Tailwind CSS for the application.
 * It includes:
 * - Dark mode configuration
 * - Content paths for purging unused CSS
 * - Theme customization including colors, container settings, and border radius
 * - Plugin configuration
 *
 * The configuration extends the default Tailwind theme with custom colors
 * and other design tokens that match the application's design system.
 */
import type { Config } from "tailwindcss"

const config = {
  /**
   * Enable dark mode based on class
   * This allows for manual control of dark mode rather than relying on system preferences
   */
  darkMode: ["class"],

  /**
   * Content paths for Tailwind to scan for class usage
   * This ensures that only used classes are included in the final CSS
   */
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "*.{js,ts,jsx,tsx,mdx}"],

  theme: {
    /**
     * Container configuration
     * Sets default container behavior including centering, padding, and max-width
     */
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },

    /**
     * Theme extensions
     * Adds custom design tokens to the default Tailwind theme
     */
    extend: {
      /**
       * Custom color palette
       * Uses CSS variables defined in globals.css for theming support
       */
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },

      /**
       * Custom border radius values
       * Uses CSS variables for consistent border radius across the application
       */
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },

  /**
   * Tailwind plugins
   * Can be extended with additional plugins as needed
   */
  plugins: [],
} satisfies Config

export default config
