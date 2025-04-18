/**
 * Search Utilities
 *
 * This module provides utility functions for the search functionality
 * in the learning platform. It includes:
 * - Text highlighting for search results
 * - Relevance score calculation for search ranking
 * - Helper functions for search operations
 */

/**
 * Highlights matching text in a string
 *
 * This function takes a text string and a search query, then returns
 * JSX with highlighted portions that match the query.
 *
 * @param {string} text - The text to highlight within
 * @param {string} query - The search query to highlight
 * @returns {string|JSX.Element[]} - Either the original text or JSX with highlighted matches
 */
export function highlightMatch(text: string, query: string) {
  // If query is empty, return the original text
  if (!query.trim()) {
    return text
  }

  // Create a regex to match the query (case-insensitive)
  const regex = new RegExp(`(${escapeRegExp(query)})`, "gi")
  // Split the text by the regex to separate matching and non-matching parts
  const parts = text.split(regex)

  // Map each part to either plain text or highlighted JSX
  return parts.map((part, i) =>
    regex.test(part) ? (
      // Highlight matching parts with a yellow background
      <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
        {part}
      </mark>
    ) : (
      // Return non-matching parts as-is
      part
    ),
  )
}

/**
 * Escapes special characters in a string for use in a regular expression
 *
 * This prevents special regex characters from being interpreted as regex syntax.
 *
 * @param {string} string - The string to escape
 * @returns {string} - The escaped string safe for regex use
 */
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Calculate relevance score for search results
 *
 * This function determines how relevant a module is to a search query
 * by checking for matches in various fields and assigning weighted scores.
 *
 * @param {string} moduleName - The name of the module
 * @param {any} moduleData - The module data object
 * @param {string} query - The search query
 * @returns {number} - The relevance score (higher is more relevant)
 */
export function calculateRelevance(moduleName: string, moduleData: any, query: string): number {
  // Split the query into individual search terms
  const searchTerms = query.toLowerCase().split(/\s+/)
  let score = 0

  // Check module name (highest priority)
  const moduleNameLower = moduleName.toLowerCase()
  searchTerms.forEach((term) => {
    if (moduleNameLower.includes(term)) {
      // Higher score for exact matches in the title
      score += 10

      // Even higher if it's at the beginning of the title
      if (moduleNameLower.startsWith(term)) {
        score += 5
      }
    }
  })

  // Check module description (medium priority)
  if (moduleData.description) {
    const descriptionLower = moduleData.description.toLowerCase()
    searchTerms.forEach((term) => {
      if (descriptionLower.includes(term)) {
        score += 5
      }
    })
  }

  // Check module category (medium-low priority)
  if (moduleData.category) {
    const categoryLower = moduleData.category.toLowerCase()
    searchTerms.forEach((term) => {
      if (categoryLower.includes(term)) {
        score += 3
      }
    })
  }

  // Check methods (lowest priority)
  if (moduleData.methods && Array.isArray(moduleData.methods)) {
    searchTerms.forEach((term) => {
      moduleData.methods.forEach((method: string) => {
        if (method.toLowerCase().includes(term)) {
          score += 2
        }
      })
    })
  }

  return score
}
