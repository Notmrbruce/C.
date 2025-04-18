/**
 * Search Bar Component
 *
 * This component provides a search input field with clear functionality
 * for searching learning modules. It includes:
 * - Search input with icon
 * - Clear button to reset search
 * - Callback handling for search changes
 *
 * The component is designed to be used in the learning modules page.
 */
"use client"

import type React from "react"
import { Search, X } from "lucide-react"

/**
 * Props for the SearchBar component
 *
 * @interface SearchBarProps
 * @property {string} searchQuery - The current search query
 * @property {function} setSearchQuery - Function to update the search query
 * @property {function} clearSearch - Function to clear the search query
 */
interface SearchBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  clearSearch: () => void
}

export function SearchBar({ searchQuery, setSearchQuery, clearSearch }: SearchBarProps) {
  /**
   * Handle changes to the search input
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="relative">
      {/* Search icon */}
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />

      {/* Search input field */}
      <input
        type="text"
        className="bg-muted rounded-full pl-10 pr-10 py-2 w-full md:w-[300px] text-foreground"
        placeholder="Search modules..."
        value={searchQuery}
        onChange={handleSearchChange}
        aria-label="Search learning modules"
      />

      {/* Clear button - only shown when there's a search query */}
      {searchQuery && (
        <button
          onClick={clearSearch}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
