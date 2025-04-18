"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronRight, ArrowLeft, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { learningModules, sampleModules } from "@/data/learning-modules"
import { Sidebar } from "@/components/sidebar"
import { SearchBar } from "./search-bar"
import { SearchResult } from "./search-result"
import { EmptySearch } from "./empty-search"
import { calculateRelevance } from "./search-utils"
import AuthPage from "../../auth-page"

// Category icons/graphics
const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case "Rules":
      return (
        <div className="w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full">
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
            className="text-blue-600"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
        </div>
      )
    case "Routes":
      return (
        <div className="w-16 h-16 flex items-center justify-center bg-green-100 rounded-full">
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
            className="text-green-600"
          >
            {/* Horizontal rails */}
            <line x1="2" y1="8" x2="22" y2="8" />
            <line x1="2" y1="16" x2="22" y2="16" />

            {/* Vertical ties/sleepers */}
            <line x1="4" y1="6" x2="4" y2="18" />
            <line x1="8" y1="6" x2="8" y2="18" />
            <line x1="12" y1="6" x2="12" y2="18" />
            <line x1="16" y1="6" x2="16" y2="18" />
            <line x1="20" y1="6" x2="20" y2="18" />
          </svg>
        </div>
      )
    case "Traction":
      return (
        <div className="w-16 h-16 flex items-center justify-center bg-red-100 rounded-full">
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
            className="text-red-600"
          >
            <rect x="4" y="15" width="16" height="6" rx="2" />
            <rect x="7" y="3" width="10" height="6" rx="2" />
            <path d="M12 9v6" />
          </svg>
        </div>
      )
    default:
      return null
  }
}

export default function LearningPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchResults, setSearchResults] = useState<{ moduleName: string; moduleData: any; relevance: number }[]>([])
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated via simulation
    const simulatedAuth = localStorage.getItem("simulatedAuth")
    setIsAuthenticated(simulatedAuth === "true")
    setLoading(false)
  }, [])

  // Perform search
  const performSearch = useCallback((query: string) => {
    if (query.trim() === "") {
      setIsSearching(false)
      setSearchResults([])
      return
    }

    setIsSearching(true)

    // Filter modules based on search query
    const results = Object.entries(sampleModules)
      .map(([moduleName, moduleData]) => ({
        moduleName,
        moduleData,
        relevance: calculateRelevance(moduleName, moduleData, query),
      }))
      .filter((item) => item.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)

    setSearchResults(results)
  }, [])

  // Initialize search from URL if present
  useEffect(() => {
    const query = searchParams.get("q")
    if (query && query !== searchQuery) {
      setSearchQuery(query)
      performSearch(query)
    }
  }, [searchParams, performSearch, searchQuery])

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    // Clear search when selecting a category
    clearSearch()
  }

  // Handle module selection
  const handleModuleSelect = (module: string) => {
    // Navigate to the module page
    router.push(
      `/learning/module?category=${selectedCategory || searchResults.find((r) => r.moduleName === module)?.moduleData.category}&module=${module}`,
    )
  }

  // Go back to categories
  const handleBackToCategories = () => {
    setSelectedCategory(null)
  }

  // Update search query
  const updateSearchQuery = useCallback(
    (query: string) => {
      // Prevent unnecessary updates if the query hasn't changed
      if (query === searchQuery) return

      setSearchQuery(query)

      // Update URL with search query
      const url = new URL(window.location.href)
      if (query) {
        url.searchParams.set("q", query)
      } else {
        url.searchParams.delete("q")
      }
      window.history.replaceState({}, "", url.toString())

      performSearch(query)
    },
    [performSearch, searchQuery],
  )

  // Clear search
  const clearSearch = () => {
    setSearchQuery("")
    setIsSearching(false)
    setSearchResults([])

    // Remove search query from URL
    const url = new URL(window.location.href)
    url.searchParams.delete("q")
    window.history.replaceState({}, "", url.toString())
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthPage />
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activePage="learning" />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header with Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="w-full md:w-auto">
              <h1 className="text-3xl font-bold text-foreground">Learning Modules</h1>
              <p className="text-muted-foreground">Discover and explore our learning resources</p>
            </div>
            <SearchBar searchQuery={searchQuery} setSearchQuery={updateSearchQuery} clearSearch={clearSearch} />
          </div>

          {/* Search Results Section */}
          {isSearching && (
            <div className="bg-[hsl(var(--card-bg))] rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-foreground">
                  Search Results{" "}
                  {searchResults.length > 0 && <span className="text-muted-foreground">({searchResults.length})</span>}
                </h2>
                <button onClick={clearSearch} className="text-muted-foreground hover:text-foreground flex items-center">
                  <X className="w-4 h-4 mr-1" />
                  Clear search
                </button>
              </div>

              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map(({ moduleName, moduleData }) => (
                    <SearchResult
                      key={moduleName}
                      moduleName={moduleName}
                      moduleData={moduleData}
                      searchQuery={searchQuery}
                      onClick={() => handleModuleSelect(moduleName)}
                    />
                  ))}
                </div>
              ) : (
                <EmptySearch query={searchQuery} />
              )}
            </div>
          )}

          {/* Learning Modules Section */}
          <div
            className={`bg-[hsl(var(--card-bg))] rounded-lg p-6 mb-6 ${isSearching && searchResults.length > 0 ? "mt-4" : ""}`}
          >
            <AnimatePresence mode="wait">
              {!selectedCategory ? (
                // Category Selection View
                <motion.div
                  key="categories"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="text-3xl font-bold mb-6 text-foreground">Available Modules</h1>
                  <p className="text-muted-foreground mb-8">Select a category to explore learning modules</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.keys(learningModules).map((category) => (
                      <motion.div
                        key={category}
                        whileHover={{ y: -5 }}
                        onClick={() => handleCategorySelect(category)}
                        className="bg-card rounded-lg p-6 shadow-sm cursor-pointer hover:shadow-md transition-all border border-[hsl(var(--card-border))]"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <CategoryIcon category={category} />
                          <div className="flex-1">
                            <h2 className="text-xl font-bold text-foreground">{category}</h2>
                            <p className="text-muted-foreground mt-1">
                              {learningModules[category as keyof typeof learningModules].length} modules available
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground mt-1" />
                        </div>
                        <p className="text-muted-foreground mt-2">
                          {category === "Rules"
                            ? "Learn about policies and guidelines that govern our operations."
                            : category === "Routes"
                              ? "Explore different pathways and journeys for learning and growth."
                              : "Gain momentum and make progress in your learning journey."}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                // Module Selection View
                <motion.div
                  key="modules"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center mb-6">
                    <button
                      onClick={handleBackToCategories}
                      className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Back to Categories
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <CategoryIcon category={selectedCategory} />
                    <div>
                      <h1 className="text-3xl font-bold text-foreground">{selectedCategory} Modules</h1>
                      <p className="text-muted-foreground">Select a module to begin learning</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Filter modules by category */}
                    {Object.entries(sampleModules)
                      .filter(([_, moduleData]) => moduleData.category === selectedCategory)
                      .map(([moduleName, moduleData]) => (
                        <motion.div
                          key={moduleName}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          onClick={() => handleModuleSelect(moduleName)}
                          className="bg-card rounded-lg p-6 shadow-sm cursor-pointer hover:shadow-md transition-all flex justify-between items-center border border-[hsl(var(--card-border))]"
                        >
                          <div>
                            <h2 className="text-xl font-bold mb-2 text-foreground">{moduleName}</h2>
                            <p className="text-muted-foreground">{moduleData.description}</p>

                            {/* Show available learning methods */}
                            <div className="flex gap-2 mt-2">
                              {moduleData.methods?.map((method: string) => (
                                <span
                                  key={method}
                                  className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                                >
                                  {method}
                                </span>
                              ))}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </motion.div>
                      ))}

                    {/* Show original modules if no sample modules for this category */}
                    {Object.entries(sampleModules).filter(([_, moduleData]) => moduleData.category === selectedCategory)
                      .length === 0 &&
                      learningModules[selectedCategory as keyof typeof learningModules].map((module) => (
                        <motion.div
                          key={module}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          onClick={() => handleModuleSelect(module)}
                          className="bg-card rounded-lg p-6 shadow-sm cursor-pointer hover:shadow-md transition-all flex justify-between items-center border border-[hsl(var(--card-border))]"
                        >
                          <div>
                            <h2 className="text-xl font-bold mb-2 text-foreground">{module}</h2>
                            <p className="text-muted-foreground">
                              Learn about {module.toLowerCase()} in {selectedCategory.toLowerCase()}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </motion.div>
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
