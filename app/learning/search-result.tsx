/**
 * Search Result Component
 *
 * This component renders a single search result for a learning module.
 * It displays:
 * - Module name with highlighted search terms
 * - Module category with highlighted search terms
 * - Module description with highlighted search terms
 * - Available learning methods
 * - Navigation chevron
 *
 * The component uses Framer Motion for animation effects.
 */
"use client"

import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { highlightMatch } from "./search-utils"

/**
 * Props for the SearchResult component
 *
 * @interface SearchResultProps
 * @property {string} moduleName - The name of the module
 * @property {any} moduleData - The module data object
 * @property {string} searchQuery - The current search query for highlighting
 * @property {function} onClick - Function to call when the result is clicked
 */
interface SearchResultProps {
  moduleName: string
  moduleData: any
  searchQuery: string
  onClick: () => void
}

export function SearchResult({ moduleName, moduleData, searchQuery, onClick }: SearchResultProps) {
  return (
    <motion.div
      // Animation properties
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="bg-card rounded-lg p-6 shadow-sm cursor-pointer hover:shadow-md transition-all flex justify-between items-center border border-[hsl(var(--card-border))]"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          {/* Module name with highlighted search terms */}
          <h3 className="text-xl font-bold text-foreground">
            {typeof highlightMatch(moduleName, searchQuery) === "string"
              ? moduleName
              : highlightMatch(moduleName, searchQuery)}
          </h3>
          {/* Module category with highlighted search terms */}
          <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
            {typeof highlightMatch(moduleData.category, searchQuery) === "string"
              ? moduleData.category
              : highlightMatch(moduleData.category, searchQuery)}
          </span>
        </div>
        {/* Module description with highlighted search terms */}
        <p className="text-muted-foreground">
          {typeof highlightMatch(moduleData.description, searchQuery) === "string"
            ? moduleData.description
            : highlightMatch(moduleData.description, searchQuery)}
        </p>

        {/* Available learning methods */}
        <div className="flex gap-2 mt-2">
          {moduleData.methods?.map((method: string) => (
            <span key={method} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
              {method}
            </span>
          ))}
        </div>
      </div>
      {/* Navigation chevron */}
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </motion.div>
  )
}
