"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import AuthPage from "../../../../auth-page"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Flag,
  Award,
  SkipForward,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { sampleModules } from "@/data/learning-modules"
import { Sidebar } from "@/components/sidebar"
import { useTheme } from "@/contexts/theme-context"

type LearningMethod = "quiz" | "flashcard" | "truefalse"
type AnswerStatus = "correct" | "incorrect" | "skipped"

interface QuestionResult {
  question: string
  userAnswer: number | boolean | null
  correctAnswer: number | boolean
  status: AnswerStatus
  imageUrl?: string
}

export default function LearningMethodPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const { theme } = useTheme()

  // Get parameters from URL
  const [category, setCategory] = useState<string | null>(null)
  const [module, setModule] = useState<string | null>(null)
  const [method, setMethod] = useState<LearningMethod | null>(null)
  const [moduleData, setModuleData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Learning state
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [completed, setCompleted] = useState<number[]>([])
  const [skipped, setSkipped] = useState<number[]>([])
  const [imageLoaded, setImageLoaded] = useState(false)

  // Quiz results state
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([])
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([])

  // True/False results state
  const [trueFalseAnswers, setTrueFalseAnswers] = useState<(boolean | null)[]>([])

  // Feedback state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")

  // Calculate total items based on current method and module data
  const totalItems =
    moduleData && method
      ? method === "quiz"
        ? moduleData.content?.quiz?.length || 0
        : method === "flashcard"
          ? moduleData.content?.flashcards?.length || 0
          : moduleData.content?.truefalse?.length || 0
      : 0

  // Check authentication on mount
  useEffect(() => {
    const simulatedAuth = localStorage.getItem("simulatedAuth")
    setIsAuthenticated(simulatedAuth === "true")
    setAuthLoading(false)
  }, [])

  const calculateQuizResults = useCallback(() => {
    if (!moduleData?.content?.quiz) return

    const results: QuestionResult[] = []
    let correctCount = 0

    moduleData.content.quiz.forEach((question: any, index: number) => {
      const userAnswer = quizAnswers[index]
      const correctAnswer = question.correctAnswer
      let status: AnswerStatus = "skipped"

      if (userAnswer !== null) {
        if (userAnswer === correctAnswer) {
          status = "correct"
          correctCount++
        } else {
          status = "incorrect"
        }
      }

      results.push({
        question: question.question,
        userAnswer,
        correctAnswer,
        status,
        imageUrl: question.imageUrl,
      })
    })

    // Calculate score based on total items
    const calculatedScore = Math.round((correctCount / totalItems) * 100)
    setScore(calculatedScore)
    setQuestionResults(results)
    setShowResults(true)
  }, [moduleData, quizAnswers, totalItems])

  const calculateTrueFalseResults = useCallback(() => {
    if (!moduleData?.content?.truefalse) return

    const results: QuestionResult[] = []
    let correctCount = 0

    moduleData.content.truefalse.forEach((question: any, index: number) => {
      const userAnswer = trueFalseAnswers[index]
      const correctAnswer = question.isTrue
      let status: AnswerStatus = "skipped"

      if (userAnswer !== null) {
        if (userAnswer === correctAnswer) {
          status = "correct"
          correctCount++
        } else {
          status = "incorrect"
        }
      }

      results.push({
        question: question.statement,
        userAnswer,
        correctAnswer,
        status,
        imageUrl: question.imageUrl,
      })
    })

    // Calculate score based on total items
    const calculatedScore = Math.round((correctCount / totalItems) * 100)
    setScore(calculatedScore)
    setQuestionResults(results)
    setShowResults(true)
  }, [moduleData, trueFalseAnswers, totalItems])

  // Get URL parameters only once on component mount
  useEffect(() => {
    try {
      const categoryParam = searchParams.get("category")
      const moduleParam = searchParams.get("module")
      const methodParam = searchParams.get("method") as LearningMethod | null

      if (categoryParam) {
        setCategory(categoryParam)
      }

      if (moduleParam) {
        setModule(moduleParam)

        // Get the module data if it exists in our sample modules
        if (moduleParam in sampleModules) {
          setModuleData(sampleModules[moduleParam as keyof typeof sampleModules])
        }
      }

      if (methodParam && ["quiz", "flashcard", "truefalse"].includes(methodParam)) {
        setMethod(methodParam)
      }
    } catch (err) {
      setError("Error loading parameters: " + (err instanceof Error ? err.message : String(err)))
    }
  }, [searchParams])

  // Initialize quiz and true/false answers after moduleData is set
  useEffect(() => {
    if (moduleData && moduleData.content) {
      if (moduleData.content.quiz) {
        setQuizAnswers(new Array(moduleData.content.quiz.length).fill(null))
      }

      if (moduleData.content.truefalse) {
        setTrueFalseAnswers(new Array(moduleData.content.truefalse.length).fill(null))
      }
    }
  }, [moduleData])

  // Reset learning state when method changes
  useEffect(() => {
    if (method) {
      setCurrentIndex(0)
      setShowAnswer(false)
      setSelectedOption(null)
      setIsCorrect(null)
      setCompleted([])
      setSkipped([])
      setImageLoaded(false)
      setShowResults(false)
      setExpandedQuestions([])
    }
  }, [method])

  // Reset image loaded state when current index changes
  useEffect(() => {
    setImageLoaded(false)
  }, [currentIndex])

  const progressPercentage = totalItems > 0 ? ((currentIndex + 1) / totalItems) * 100 : 0

  const handleNext = useCallback(() => {
    if (currentIndex < totalItems - 1) {
      // Mark current item as completed if answered
      if (
        (method === "quiz" && selectedOption !== null) ||
        (method === "flashcard" && showAnswer) ||
        (method === "truefalse" && selectedOption !== null)
      ) {
        if (!completed.includes(currentIndex)) {
          setCompleted((prev) => [...prev, currentIndex])
        }
      }

      setCurrentIndex((prev) => prev + 1)

      // Reset state for the next question, but preserve completed state
      setShowAnswer(false)

      // Check if the next question has been completed before
      const nextIndex = currentIndex + 1
      if (completed.includes(nextIndex)) {
        if (method === "quiz") {
          const nextAnswer = quizAnswers[nextIndex]
          setSelectedOption(nextAnswer)
          if (nextAnswer !== null && moduleData?.content?.quiz?.[nextIndex]) {
            const correctAnswer = moduleData.content.quiz[nextIndex].correctAnswer
            setIsCorrect(nextAnswer === correctAnswer)
          }
        } else if (method === "truefalse") {
          const nextAnswer = trueFalseAnswers[nextIndex]
          if (nextAnswer !== null && moduleData?.content?.truefalse?.[nextIndex]) {
            setSelectedOption(nextAnswer ? 1 : 0)
            setIsCorrect(nextAnswer === moduleData.content.truefalse[nextIndex].isTrue)
            setShowAnswer(true)
          }
        } else if (method === "flashcard") {
          setShowAnswer(true)
        }
      } else if (skipped.includes(nextIndex)) {
        // If the next question was skipped, maintain that state
        setSelectedOption(null)
        setIsCorrect(null)
      } else {
        // Fresh question
        setSelectedOption(null)
        setIsCorrect(null)
      }
    } else if ((method === "quiz" || method === "truefalse") && currentIndex === totalItems - 1) {
      // If we're at the last question in quiz or true/false mode, calculate and show results
      // Mark the last question as completed if answered
      if ((method === "quiz" && selectedOption !== null) || (method === "truefalse" && selectedOption !== null)) {
        if (!completed.includes(currentIndex)) {
          setCompleted((prev) => [...prev, currentIndex])
        }
      }

      if (method === "quiz") {
        calculateQuizResults()
      } else if (method === "truefalse") {
        calculateTrueFalseResults()
      }
    }
  }, [
    currentIndex,
    totalItems,
    method,
    selectedOption,
    showAnswer,
    completed,
    skipped,
    moduleData,
    quizAnswers,
    trueFalseAnswers,
    calculateQuizResults,
    calculateTrueFalseResults,
  ])

  const handleSkip = useCallback(() => {
    // Mark current question as skipped
    if (!skipped.includes(currentIndex)) {
      setSkipped((prev) => [...prev, currentIndex])
    }

    // Update answers array with null for skipped question
    if (method === "quiz") {
      setQuizAnswers((prev) => {
        const newAnswers = [...prev]
        newAnswers[currentIndex] = null
        return newAnswers
      })
    } else if (method === "truefalse") {
      setTrueFalseAnswers((prev) => {
        const newAnswers = [...prev]
        newAnswers[currentIndex] = null
        return newAnswers
      })
    }

    // Move to next question or show results if at the end
    if (currentIndex < totalItems - 1) {
      setCurrentIndex((prev) => prev + 1)
      setShowAnswer(false)
      setSelectedOption(null)
      setIsCorrect(null)
    } else if ((method === "quiz" || method === "truefalse") && currentIndex === totalItems - 1) {
      // If we're at the last question, calculate and show results
      if (method === "quiz") {
        calculateQuizResults()
      } else if (method === "truefalse") {
        calculateTrueFalseResults()
      }
    }
  }, [
    currentIndex,
    totalItems,
    method,
    skipped,
    quizAnswers,
    trueFalseAnswers,
    calculateQuizResults,
    calculateTrueFalseResults,
  ])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)

      // Restore previous answer state but don't allow changes
      if (method === "quiz") {
        const prevAnswer = quizAnswers[currentIndex - 1]
        setSelectedOption(prevAnswer)
        if (prevAnswer !== null && moduleData?.content?.quiz?.[currentIndex - 1]) {
          const correctAnswer = moduleData.content.quiz[currentIndex - 1].correctAnswer
          setIsCorrect(prevAnswer === correctAnswer)
        } else {
          setIsCorrect(null)
        }
      } else if (method === "truefalse") {
        const prevAnswer = trueFalseAnswers[currentIndex - 1]
        if (prevAnswer !== null && moduleData?.content?.truefalse?.[currentIndex - 1]) {
          setSelectedOption(prevAnswer ? 1 : 0)
          setIsCorrect(prevAnswer === moduleData.content.truefalse[currentIndex - 1].isTrue)
          setShowAnswer(true)
        } else {
          setSelectedOption(null)
          setIsCorrect(null)
        }
      } else {
        // For flashcards
        if (completed.includes(currentIndex - 1)) {
          setShowAnswer(true)
        } else {
          setShowAnswer(false)
        }
        setSelectedOption(null)
        setIsCorrect(null)
      }
    }
  }, [currentIndex, method, quizAnswers, trueFalseAnswers, moduleData, completed])

  const handleOptionSelect = useCallback(
    (optionIndex: number) => {
      if (selectedOption !== null || !moduleData?.content?.quiz?.[currentIndex]) return // Prevent changing answer

      setSelectedOption(optionIndex)
      const correctAnswer = moduleData.content.quiz[currentIndex].correctAnswer
      setIsCorrect(optionIndex === correctAnswer)

      // Update quiz answers
      setQuizAnswers((prev) => {
        const newAnswers = [...prev]
        newAnswers[currentIndex] = optionIndex
        return newAnswers
      })

      // Mark as completed
      if (!completed.includes(currentIndex)) {
        setCompleted((prev) => [...prev, currentIndex])
      }

      // Remove from skipped if it was previously skipped
      if (skipped.includes(currentIndex)) {
        setSkipped((prev) => prev.filter((idx) => idx !== currentIndex))
      }
    },
    [selectedOption, moduleData, currentIndex, completed, skipped],
  )

  const handleTrueFalseSelect = useCallback(
    (answer: boolean) => {
      if (selectedOption !== null || !moduleData?.content?.truefalse?.[currentIndex]) return // Prevent changing answer

      setSelectedOption(answer ? 1 : 0)
      const isTrue = moduleData.content.truefalse[currentIndex].isTrue
      setIsCorrect(answer === isTrue)
      setShowAnswer(true)

      // Update true/false answers
      setTrueFalseAnswers((prev) => {
        const newAnswers = [...prev]
        newAnswers[currentIndex] = answer
        return newAnswers
      })

      // Mark as completed
      if (!completed.includes(currentIndex)) {
        setCompleted((prev) => [...prev, currentIndex])
      }

      // Remove from skipped if it was previously skipped
      if (skipped.includes(currentIndex)) {
        setSkipped((prev) => prev.filter((idx) => idx !== currentIndex))
      }
    },
    [selectedOption, moduleData, currentIndex, completed, skipped],
  )

  const handleFlashcardFlip = useCallback(() => {
    setShowAnswer((prev) => !prev)

    // Mark as completed when showing answer
    if (!showAnswer && !completed.includes(currentIndex)) {
      setCompleted((prev) => [...prev, currentIndex])
    }
  }, [showAnswer, completed, currentIndex])

  const toggleQuestionExpand = useCallback((index: number) => {
    setExpandedQuestions((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }, [])

  const getScoreMessage = useCallback(() => {
    if (score >= 90) return "Excellent! You've mastered this content!"
    if (score >= 80) return "Great job! You have a strong understanding!"
    if (score >= 70) return "Good work! You're on the right track!"
    if (score >= 60) return "Not bad! Keep practicing to improve!"
    return "Keep studying! You'll get there!"
  }, [score])

  const getScoreGraphic = useCallback(() => {
    if (score >= 90) return "🏆"
    if (score >= 80) return "🥇"
    if (score >= 70) return "🥈"
    if (score >= 60) return "🥉"
    return "📚"
  }, [score])

  const handleReturnToModule = useCallback(() => {
    router.push(`/learning/module?category=${category}&module=${module}`)
  }, [router, category, module])

  const handleRetryModule = useCallback(() => {
    // Reset all state and start over
    setCurrentIndex(0)
    setShowAnswer(false)
    setSelectedOption(null)
    setIsCorrect(null)
    setCompleted([])
    setSkipped([])
    setShowResults(false)
    setQuizAnswers(new Array(totalItems).fill(null))
    setTrueFalseAnswers(new Array(totalItems).fill(null))
    setExpandedQuestions([])
  }, [totalItems])

  const handleSubmitFeedback = useCallback(() => {
    // Close the feedback modal
    setShowFeedbackModal(false)

    // Reset the feedback text
    setFeedbackText("")

    // Show confirmation (in a real app, this would send the feedback to a server)
    alert("Thank you for your feedback! We'll review it shortly.")
  }, [])

  const renderQuizContent = () => {
    if (!moduleData?.content?.quiz || currentIndex >= moduleData.content.quiz.length || currentIndex < 0)
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-foreground text-xl">No quiz content available</p>
        </div>
      )

    const currentQuiz = moduleData.content.quiz[currentIndex]
    if (!currentQuiz) return null

    return (
      <div className="flex flex-col h-full">
        <div className="flex-grow flex flex-col justify-center items-center mb-8">
          <h2 className="text-2xl md:text-3xl text-foreground text-center mb-6">{currentQuiz.question}</h2>

          {/* Image container */}
          {currentQuiz.imageUrl && (
            <div className="w-full max-w-2xl mb-8 relative">
              <div className={`rounded-lg overflow-hidden ${imageLoaded ? "" : "bg-muted animate-pulse"}`}>
                <Image
                  src={currentQuiz.imageUrl || "/placeholder.svg"}
                  alt={`Image for: ${currentQuiz.question}`}
                  width={500}
                  height={300}
                  className="w-full h-auto object-cover rounded-lg"
                  onLoad={() => setImageLoaded(true)}
                  style={{ opacity: imageLoaded ? 1 : 0 }}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-muted-foreground border-t-foreground rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="w-full max-w-2xl space-y-4">
            {currentQuiz.options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={selectedOption !== null || completed.includes(currentIndex)}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  selectedOption === null && !completed.includes(currentIndex)
                    ? "bg-muted hover:bg-muted/80 text-foreground"
                    : selectedOption === index
                      ? isCorrect
                        ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-500 text-foreground"
                        : "bg-red-100 dark:bg-red-900/30 border-2 border-red-500 text-foreground"
                      : index === currentQuiz.correctAnswer && selectedOption !== null
                        ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-500 text-foreground"
                        : completed.includes(currentIndex) && quizAnswers[currentIndex] === index
                          ? quizAnswers[currentIndex] === currentQuiz.correctAnswer
                            ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-500 text-foreground"
                            : "bg-red-100 dark:bg-red-900/30 border-2 border-red-500 text-foreground"
                          : "bg-muted text-muted-foreground"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{option}</span>
                  {(selectedOption !== null || completed.includes(currentIndex)) &&
                    (index === currentQuiz.correctAnswer ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (selectedOption === index ||
                        (completed.includes(currentIndex) && quizAnswers[currentIndex] === index)) &&
                      index !== currentQuiz.correctAnswer ? (
                      <X className="w-5 h-5 text-red-500" />
                    ) : null)}
                </div>
              </button>
            ))}
          </div>

          {/* Feedback button */}
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="mt-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Flag className="w-4 h-4" />
            <span>Submit Feedback</span>
          </button>
        </div>
      </div>
    )
  }

  const renderFlashcardContent = () => {
    if (!moduleData?.content?.flashcards || currentIndex >= moduleData.content.flashcards.length || currentIndex < 0)
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-foreground text-xl">No flashcard content available</p>
        </div>
      )

    const currentFlashcard = moduleData.content.flashcards[currentIndex]
    if (!currentFlashcard) return null

    return (
      <div className="flex flex-col h-full">
        <div
          onClick={handleFlashcardFlip}
          className="flex-grow flex flex-col justify-center items-center cursor-pointer"
        >
          <div
            className={`w-full max-w-2xl bg-muted rounded-xl p-8 transition-all duration-300 transform ${
              showAnswer ? "scale-95" : ""
            }`}
          >
            <AnimatePresence mode="wait">
              {!showAnswer ? (
                <motion.div
                  key="question"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center min-h-[300px]"
                >
                  <h2 className="text-2xl md:text-3xl text-foreground text-center mb-6">{currentFlashcard.term}</h2>

                  {/* Image on front of card */}
                  {currentFlashcard.imageUrl && (
                    <div className="w-full max-w-md mb-6 relative">
                      <div className={`rounded-lg overflow-hidden ${imageLoaded ? "" : "bg-muted animate-pulse"}`}>
                        <Image
                          src={currentFlashcard.imageUrl || "/placeholder.svg"}
                          alt={`Image for: ${currentFlashcard.term}`}
                          width={500}
                          height={300}
                          className="w-full h-auto object-cover rounded-lg"
                          onLoad={() => setImageLoaded(true)}
                          style={{ opacity: imageLoaded ? 1 : 0 }}
                        />
                        {!imageLoaded && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-muted-foreground border-t-foreground rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <p className="text-muted-foreground text-center mt-4">Click to reveal answer</p>
                </motion.div>
              ) : (
                <motion.div
                  key="answer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center min-h-[300px]"
                >
                  <h3 className="text-xl text-muted-foreground mb-4">Definition:</h3>
                  <p className="text-foreground text-center text-lg mb-6">{currentFlashcard.definition}</p>
                  <p className="text-muted-foreground text-center mt-4">Click to see term</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="text-center text-muted-foreground mt-4">
          {showAnswer ? "Click to flip back" : "Tap to flip"}
        </div>

        {/* Feedback button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowFeedbackModal(true)
            }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Flag className="w-4 h-4" />
            <span>Submit Feedback</span>
          </button>
        </div>
      </div>
    )
  }

  const renderTrueFalseContent = () => {
    if (!moduleData?.content?.truefalse || currentIndex >= moduleData.content.truefalse.length || currentIndex < 0)
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-foreground text-xl">No true/false content available</p>
        </div>
      )

    const currentTF = moduleData.content.truefalse[currentIndex]
    if (!currentTF) return null

    return (
      <div className="flex flex-col h-full">
        <div className="flex-grow flex flex-col justify-center items-center mb-8">
          <h2 className="text-2xl md:text-3xl text-foreground text-center mb-6">{currentTF.statement}</h2>

          {/* Image container */}
          {currentTF.imageUrl && (
            <div className="w-full max-w-2xl mb-8 relative">
              <div className={`rounded-lg overflow-hidden ${imageLoaded ? "" : "bg-muted animate-pulse"}`}>
                <Image
                  src={currentTF.imageUrl || "/placeholder.svg"}
                  alt={`Image for: ${currentTF.statement}`}
                  width={500}
                  height={300}
                  className="w-full h-auto object-cover rounded-lg"
                  onLoad={() => setImageLoaded(true)}
                  style={{ opacity: imageLoaded ? 1 : 0 }}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-muted-foreground border-t-foreground rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-center w-full max-w-md">
            <button
              onClick={() => handleTrueFalseSelect(true)}
              disabled={selectedOption !== null || completed.includes(currentIndex)}
              className={`flex-1 py-4 px-6 rounded-lg text-lg font-medium transition-all ${
                selectedOption === null && !completed.includes(currentIndex)
                  ? "bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-foreground"
                  : selectedOption === 1 && isCorrect
                    ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-500 text-foreground"
                    : selectedOption === 1 && !isCorrect
                      ? "bg-red-100 dark:bg-red-900/30 border-2 border-red-500 text-foreground"
                      : currentTF.isTrue && (selectedOption !== null || completed.includes(currentIndex))
                        ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-500 text-foreground"
                        : completed.includes(currentIndex) && trueFalseAnswers[currentIndex] === true
                          ? "bg-red-100 dark:bg-red-900/30 border-2 border-red-500 text-foreground"
                          : "bg-muted text-muted-foreground"
              }`}
            >
              <div className="flex justify-center items-center gap-2">
                <span>True</span>
                {(selectedOption !== null || completed.includes(currentIndex)) && currentTF.isTrue && (
                  <Check className="w-5 h-5" />
                )}
              </div>
            </button>

            <button
              onClick={() => handleTrueFalseSelect(false)}
              disabled={selectedOption !== null || completed.includes(currentIndex)}
              className={`flex-1 py-4 px-6 rounded-lg text-lg font-medium transition-all ${
                selectedOption === null && !completed.includes(currentIndex)
                  ? "bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-foreground"
                  : selectedOption === 0 && isCorrect
                    ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-500 text-foreground"
                    : selectedOption === 0 && !isCorrect
                      ? "bg-red-100 dark:bg-red-900/30 border-2 border-red-500 text-foreground"
                      : !currentTF.isTrue && (selectedOption !== null || completed.includes(currentIndex))
                        ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-500 text-foreground"
                        : completed.includes(currentIndex) && trueFalseAnswers[currentIndex] === false
                          ? "bg-red-100 dark:bg-red-900/30 border-2 border-red-500 text-foreground"
                          : "bg-muted text-muted-foreground"
              }`}
            >
              <div className="flex justify-center items-center gap-2">
                <span>False</span>
                {(selectedOption !== null || completed.includes(currentIndex)) && !currentTF.isTrue && (
                  <Check className="w-5 h-5" />
                )}
              </div>
            </button>
          </div>

          <AnimatePresence>
            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-8 p-4 bg-muted rounded-lg max-w-2xl"
              >
                <p className="text-foreground">{currentTF.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback button */}
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="mt-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Flag className="w-4 h-4" />
            <span>Submit Feedback</span>
          </button>
        </div>
      </div>
    )
  }

  const renderResults = () => {
    const methodTitle = method === "quiz" ? "Quiz" : "True/False"

    // Calculate statistics
    const correctCount = questionResults.filter((q) => q.status === "correct").length
    const incorrectCount = questionResults.filter((q) => q.status === "incorrect").length
    const skippedCount = questionResults.filter((q) => q.status === "skipped").length

    return (
      <div className="flex flex-col h-full py-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-6">{getScoreGraphic()}</div>
          <h2 className="text-3xl font-bold mb-4 text-foreground">{methodTitle} Results</h2>

          <div className="w-48 h-48 rounded-full border-8 border-muted flex items-center justify-center mb-6 relative mx-auto">
            <div
              className="absolute inset-0 rounded-full animate-[spin_3s_ease-in-out]"
              style={{
                background: `conic-gradient(${theme === "dark" ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.3)"} ${score}%, transparent ${score}%)`,
                clipPath: "circle(50% at 50% 50%)",
              }}
            />
            <div className="bg-background rounded-full w-[calc(100%-16px)] h-[calc(100%-16px)] flex items-center justify-center">
              <span className="text-4xl font-bold text-foreground">{score}%</span>
            </div>
          </div>

          <p className="text-xl text-center mb-8 text-foreground">{getScoreMessage()}</p>
        </div>

        <div className="bg-[hsl(var(--card-bg))] rounded-lg p-6 mb-8 w-full max-w-2xl mx-auto">
          <h3 className="font-bold mb-4 text-xl text-foreground">Performance Summary:</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-card p-4 rounded-lg shadow-sm border border-[hsl(var(--card-border))]">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Questions:</span>
                <span className="font-bold text-foreground">{totalItems}</span>
              </div>
            </div>
            <div className="bg-card p-4 rounded-lg shadow-sm border border-[hsl(var(--card-border))]">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Score:</span>
                <span className="font-bold text-foreground">{score}%</span>
              </div>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-green-600 dark:text-green-400">Correct:</span>
                <span className="font-bold text-green-600 dark:text-green-400">{correctCount}</span>
              </div>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-red-600 dark:text-red-400">Incorrect:</span>
                <span className="font-bold text-red-600 dark:text-red-400">{incorrectCount}</span>
              </div>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-lg shadow-sm col-span-2">
              <div className="flex justify-between items-center">
                <span className="text-yellow-600 dark:text-yellow-400">Skipped:</span>
                <span className="font-bold text-yellow-600 dark:text-yellow-400">{skippedCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-[hsl(var(--card-border))] shadow-sm w-full max-w-2xl mx-auto mb-8">
          <div className="p-4 border-b border-[hsl(var(--card-border))]">
            <h3 className="font-bold text-xl text-foreground">Detailed Question Breakdown</h3>
          </div>
          <div className="divide-y divide-[hsl(var(--card-border))] max-h-[400px] overflow-y-auto">
            {questionResults.map((result, index) => (
              <div key={index} className="p-4">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleQuestionExpand(index)}
                >
                  <div className="flex items-center gap-3">
                    {result.status === "correct" && (
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                    {result.status === "incorrect" && (
                      <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                    )}
                    {result.status === "skipped" && (
                      <div className="w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                        <SkipForward className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                    )}
                    <span className="font-medium text-foreground">Question {index + 1}</span>
                  </div>
                  {expandedQuestions.includes(index) ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                {expandedQuestions.includes(index) && (
                  <div className="mt-4 pl-9">
                    <p className="text-foreground mb-4">{result.question}</p>

                    {result.imageUrl && (
                      <div className="mb-4">
                        <Image
                          src={result.imageUrl || "/placeholder.svg"}
                          alt={`Image for question ${index + 1}`}
                          width={300}
                          height={200}
                          className="rounded-lg"
                        />
                      </div>
                    )}

                    {method === "quiz" && (
                      <div className="bg-muted p-3 rounded-lg mb-2">
                        <p className="text-sm text-muted-foreground mb-1">Correct answer:</p>
                        <p className="font-medium text-foreground">
                          {moduleData.content.quiz[index].options[result.correctAnswer as number]}
                        </p>
                      </div>
                    )}

                    {method === "truefalse" && (
                      <div className="bg-muted p-3 rounded-lg mb-2">
                        <p className="text-sm text-muted-foreground mb-1">Correct answer:</p>
                        <p className="font-medium text-foreground">{result.correctAnswer ? "True" : "False"}</p>
                        {moduleData.content.truefalse[index].explanation && (
                          <div className="mt-2 pt-2 border-t border-[hsl(var(--card-border))]">
                            <p className="text-sm text-muted-foreground">Explanation:</p>
                            <p className="text-sm mt-1 text-foreground">
                              {moduleData.content.truefalse[index].explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {result.status !== "skipped" && result.status !== "unanswered" && method === "quiz" && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Your answer:</p>
                        <p
                          className={`font-medium ${result.status === "correct" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {moduleData.content.quiz[index].options[result.userAnswer as number]}
                        </p>
                      </div>
                    )}

                    {result.status !== "skipped" && result.status !== "unanswered" && method === "truefalse" && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Your answer:</p>
                        <p
                          className={`font-medium ${result.status === "correct" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {result.userAnswer ? "True" : "False"}
                        </p>
                      </div>
                    )}

                    {result.status === "skipped" && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">You skipped this question</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleRetryModule}
            className="px-6 py-3 bg-card border border-primary text-foreground rounded-md hover:bg-muted flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={handleReturnToModule}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Module
          </button>
        </div>
      </div>
    )
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthPage />
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar activePage="learning" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 dark:text-red-400 text-xl mb-4">An error occurred</p>
            <p className="text-foreground">{error}</p>
            <button
              onClick={() => router.push(`/learning/module?category=${category}&module=${module}`)}
              className="mt-6 bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90"
            >
              Return to Module
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state if module data is not yet available
  if (!moduleData) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar activePage="learning" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-foreground text-xl">Loading module content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activePage="learning" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-[hsl(var(--card-bg))] p-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => router.push(`/learning/module?category=${category}&module=${module}`)}
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Module
            </button>
            <div className="text-foreground">
              <span className="text-muted-foreground">{category}</span> / <span>{module}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">{/* Search removed */}</div>
        </div>

        {/* Progress Bar - Only show if not in results view */}
        {!showResults && (
          <div className="bg-[hsl(var(--card-bg))] px-4 py-2 flex items-center gap-4 border-t border-[hsl(var(--card-border))]">
            <div className="flex-shrink-0 w-12 h-8 flex items-center justify-center bg-card rounded-full text-foreground border border-[hsl(var(--card-border))]">
              {currentIndex + 1}
            </div>
            <div className="flex-grow h-2 bg-[hsl(var(--progress-bg))] rounded-full overflow-hidden">
              <div
                className="h-full bg-[hsl(var(--progress-fill))] transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex-shrink-0 w-12 h-8 flex items-center justify-center bg-card rounded-full text-foreground border border-[hsl(var(--card-border))]">
              {totalItems}
            </div>
          </div>
        )}

        {/* Learning Content */}
        <div className="flex-grow bg-background p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto bg-card rounded-xl p-6 h-full flex flex-col border border-[hsl(var(--card-border))] shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={showResults ? "results" : `${method}-${currentIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                {showResults ? (
                  renderResults()
                ) : (
                  <>
                    {method === "quiz" && renderQuizContent()}
                    {method === "flashcard" && renderFlashcardContent()}
                    {method === "truefalse" && renderTrueFalseContent()}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Controls - Only show if not in results view */}
        {!showResults && (
          <div className="bg-[hsl(var(--card-bg))] p-4 flex justify-center items-center border-t border-[hsl(var(--card-border))]">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  currentIndex === 0
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-card text-foreground hover:bg-muted border border-[hsl(var(--card-border))]"
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Skip button */}
              <button
                onClick={handleSkip}
                disabled={selectedOption !== null || completed.includes(currentIndex)}
                className={`px-6 py-2 ${
                  selectedOption !== null || completed.includes(currentIndex)
                    ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                    : "bg-yellow-500 dark:bg-yellow-600 hover:bg-yellow-600 dark:hover:bg-yellow-700"
                } text-white rounded-md flex items-center gap-2`}
              >
                <SkipForward className="w-5 h-5" />
                Skip
              </button>

              {/* Next/View Results button */}
              {(method === "quiz" || method === "truefalse") && currentIndex === totalItems - 1 ? (
                <button
                  onClick={method === "quiz" ? calculateQuizResults : calculateTrueFalseResults}
                  disabled={selectedOption === null && !completed.includes(currentIndex)}
                  className={`px-6 py-2 rounded-md flex items-center gap-2 ${
                    selectedOption === null && !completed.includes(currentIndex)
                      ? "bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  <Award className="w-5 h-5" />
                  View Results
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={
                    currentIndex === totalItems - 1 ||
                    ((method === "quiz" || method === "truefalse") &&
                      selectedOption === null &&
                      !completed.includes(currentIndex) &&
                      !skipped.includes(currentIndex))
                  }
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    currentIndex === totalItems - 1 ||
                    (
                      (method === "quiz" || method === "truefalse") &&
                        selectedOption === null &&
                        !completed.includes(currentIndex) &&
                        !skipped.includes(currentIndex)
                    )
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-card text-foreground hover:bg-muted border border-[hsl(var(--card-border))]"
                  }`}
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md border border-[hsl(var(--card-border))]">
            <h3 className="text-xl font-bold mb-4 text-foreground">Submit Feedback</h3>
            <p className="text-muted-foreground mb-4">
              Please let us know if you've found an issue with this question or have suggestions for improvement.
            </p>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="w-full border border-[hsl(var(--card-border))] bg-background text-foreground rounded-md p-2 mb-4 h-32"
              placeholder="Describe the issue or suggestion..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 border border-[hsl(var(--card-border))] rounded-md hover:bg-muted text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={!feedbackText.trim()}
                className={`px-4 py-2 rounded-md ${
                  feedbackText.trim()
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
