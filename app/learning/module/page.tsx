"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { sampleModules } from "@/data/learning-modules"
import { Sidebar } from "@/components/sidebar"
import AuthPage from "../../../auth-page"

export default function LearningModulePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [category, setCategory] = useState<string | null>(null)
  const [module, setModule] = useState<string | null>(null)
  const [moduleData, setModuleData] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated via simulation
    const simulatedAuth = localStorage.getItem("simulatedAuth")
    setIsAuthenticated(simulatedAuth === "true")
    setLoading(false)
  }, [])

  useEffect(() => {
    // Get the category and module from the URL
    const categoryParam = searchParams.get("category")
    const moduleParam = searchParams.get("module")

    if (categoryParam && moduleParam) {
      setCategory(categoryParam)
      setModule(moduleParam)

      // Get the module data if it exists in our sample modules
      if (moduleParam in sampleModules) {
        setModuleData(sampleModules[moduleParam as keyof typeof sampleModules])
      }
    }
  }, [searchParams])

  const handleMethodSelect = (method: string) => {
    router.push(`/learning/module/method?category=${category}&module=${module}&method=${method}`)
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
          {/* Header with Back Button */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/learning")}
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Modules
              </button>
            </div>
          </div>

          {/* Learning Module Content */}
          <div className="bg-[hsl(var(--card-bg))] rounded-lg p-6 mb-6">
            <h1 className="text-3xl font-bold mb-2 text-foreground">{module}</h1>
            <p className="text-muted-foreground mb-8">From {category} category</p>

            {moduleData ? (
              <div className="space-y-8">
                <div className="bg-card rounded-lg p-8 shadow-sm border border-[hsl(var(--card-border))]">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">About This Module</h2>
                  <p className="text-muted-foreground mb-6">{moduleData.description}</p>

                  <div className="border-t border-[hsl(var(--card-border))] pt-6">
                    <h3 className="text-xl font-bold mb-4 text-foreground">Choose a Learning Method</h3>
                    <p className="text-muted-foreground mb-4">
                      Select one of the following learning methods. Once you begin, you'll need to return to this page
                      to switch methods.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      {/* Quiz Method Card */}
                      <div
                        onClick={() => handleMethodSelect("quiz")}
                        className="bg-[hsl(var(--card-bg))] rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-primary"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-foreground">Quiz</h4>
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-blue-600"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                              <path d="M12 17h.01" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-4">
                          Test your knowledge with multiple-choice questions and get immediate feedback.
                        </p>
                        <div className="text-sm text-muted-foreground">{moduleData.content.quiz.length} questions</div>
                        <div className="flex justify-end mt-4">
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>

                      {/* Flashcards Method Card */}
                      <div
                        onClick={() => handleMethodSelect("flashcard")}
                        className="bg-[hsl(var(--card-bg))] rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-primary"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-foreground">Flashcards</h4>
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-green-600"
                            >
                              <rect width="18" height="18" x="3" y="3" rx="2" />
                              <path d="M3 9h18" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-4">
                          Study key terms and concepts with interactive flashcards.
                        </p>
                        <div className="text-sm text-muted-foreground">
                          {moduleData.content.flashcards.length} cards
                        </div>
                        <div className="flex justify-end mt-4">
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>

                      {/* True/False Method Card */}
                      <div
                        onClick={() => handleMethodSelect("truefalse")}
                        className="bg-[hsl(var(--card-bg))] rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-primary"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-foreground">True/False</h4>
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-purple-600"
                            >
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                              <path d="m9 11 3 3L22 4" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-4">
                          Evaluate statements and determine if they are true or false.
                        </p>
                        <div className="text-sm text-muted-foreground">
                          {moduleData.content.truefalse.length} statements
                        </div>
                        <div className="flex justify-end mt-4">
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-lg p-8 shadow-sm border border-[hsl(var(--card-border))]">
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">Module Not Found</h2>
                  <p className="text-muted-foreground mb-6">Sorry, we couldn't find the module you're looking for.</p>
                  <button
                    onClick={() => router.push("/learning")}
                    className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90"
                  >
                    Return to Modules
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
