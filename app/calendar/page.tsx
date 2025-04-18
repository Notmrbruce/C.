"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, Calendar, FileText, Download, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import AuthPage from "../../auth-page"

export default function CalendarPage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  // Check authentication on mount
  useEffect(() => {
    const simulatedAuth = localStorage.getItem("simulatedAuth")
    setIsAuthenticated(simulatedAuth === "true")
    setAuthLoading(false)
  }, [])

  // State variables
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [allCalendarData, setAllCalendarData] = useState<string[][]>([])
  const [filteredData, setFilteredData] = useState<string[][]>([])
  const [showOptions, setShowOptions] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState("")

  const [status, setStatus] = useState<{ type: string; title: string; message: string } | null>(null)
  const [calendarType, setCalendarType] = useState("all")
  const [activeSection, setActiveSection] = useState<"upload" | "instructions" | "options">("upload")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadAreaRef = useRef<HTMLDivElement>(null)

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (uploadAreaRef.current) {
      uploadAreaRef.current.classList.remove("border-primary")
      uploadAreaRef.current.classList.remove("bg-primary/10")
    }

    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [])

  // Handle file selection
  const handleFile = useCallback((file: File) => {
    // Validate file type (must be CSV)
    if (!file || file.type !== "text/csv") {
      setStatus({
        type: "error",
        title: "Please select a valid CSV file",
        message: "The file you selected is not a CSV file. Please try again with a TRACS Enterprise CSV export.",
      })
      return
    }

    setUploadedFile(file)
    setIsProcessing(true)
    setProgressText("Reading your schedule file...")
    setProgress(0)

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const contents = e.target?.result as string
        processCSV(contents)
      } catch (error) {
        console.error("Error processing file:", error)
        setStatus({
          type: "error",
          title: "Error Processing File",
          message: `There was a problem reading your file: ${error instanceof Error ? error.message : String(error)}`,
        })
        setIsProcessing(false)
      }
    }

    reader.onerror = () => {
      setStatus({
        type: "error",
        title: "Error Reading File",
        message: "There was a problem reading your file. Please try again.",
      })
      setIsProcessing(false)
    }

    try {
      reader.readAsText(file)
    } catch (error) {
      setStatus({
        type: "error",
        title: "Error Reading File",
        message: `There was a problem reading your file: ${error instanceof Error ? error.message : String(error)}`,
      })
      setIsProcessing(false)
    }
  }, [])

  // Process CSV data
  const processCSV = useCallback(async (csvContent: string) => {
    updateProgress("Parsing CSV file...", 30)

    try {
      // Use PapaParse library (imported dynamically)
      const Papa = (await import("papaparse")).default

      Papa.parse(csvContent, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            updateProgress("Converting schedule format...", 60)
            const rawData = results.data as string[][]

            // Find the header row containing 'Date', 'On', 'Off'
            let headerRow = -1
            for (let i = 0; i < rawData.length; i++) {
              if (rawData[i].includes("Date") && rawData[i].includes("On") && rawData[i].includes("Off")) {
                headerRow = i
                break
              }
            }

            // Validate that this appears to be a TRACS export
            if (headerRow === -1) {
              throw new Error(
                "Could not find header row in CSV. Please ensure this is a valid TRACS Enterprise export file.",
              )
            }

            // Extract data rows (everything after the header)
            const dataRows = rawData.slice(headerRow + 1)

            // Create array for iCal compatible data
            const icalData: string[][] = []

            // Add standard iCal header row
            icalData.push([
              "Subject",
              "Start Date",
              "Start Time",
              "End Date",
              "End Time",
              "All Day",
              "Description",
              "Location",
            ])

            // First pass - identify overnight shifts
            const overnightShiftEndTimes: Record<string, string> = {}

            // First pass: identify overnight shifts
            dataRows.forEach((row) => {
              // Skip invalid rows
              if (!row[0] || !row[0].includes("/")) return

              // Extract date information
              const dateText = row[0]
              // Match pattern like "27/03 Th27/03/2025 Th"
              const dateMatch = dateText.match(/(\d{2}\/\d{2}).*?(\d{2}\/\d{2}\/\d{4})/)
              if (!dateMatch) return

              const fullDate = dateMatch[2] // Gets "DD/MM/YYYY"
              const [day, month, year] = fullDate.split("/")

              // Convert to MM/DD/YYYY format with zero-padding
              const formattedDate = `${month.padStart(2, "0")}/${day.padStart(2, "0")}/${year}`

              const startTime = row[1]
              const endTime = row[2]

              // Only process actual shifts (not RD, AL, STUD)
              if (startTime && endTime && startTime !== "RD" && startTime !== "AL" && startTime !== "STUD") {
                try {
                  // Validate time format
                  const startTimeParts = startTime.split(":")
                  const endTimeParts = endTime.split(":")

                  if (startTimeParts.length !== 2 || endTimeParts.length !== 2) {
                    console.log(`Invalid time format for ${fullDate}: ${startTime} - ${endTime}`)
                    return
                  }

                  const [startHour, startMinute] = startTimeParts.map(Number)
                  const [endHour, endMinute] = endTimeParts.map(Number)

                  const startTimeMinutes = startHour * 60 + startMinute
                  const endTimeMinutes = endHour * 60 + endMinute

                  // If end time is earlier than start time, it's an overnight shift
                  if (endTimeMinutes < startTimeMinutes) {
                    // Calculate the next day's date
                    const dateParts = formattedDate.split("/")
                    const nextDateObj = new Date(
                      Number(dateParts[2]),
                      Number.parseInt(dateParts[0]) - 1,
                      Number.parseInt(dateParts[1]),
                    )
                    nextDateObj.setDate(nextDateObj.getDate() + 1)

                    // Format as MM/DD/YYYY with zero-padding
                    const nextDate = `${String(nextDateObj.getMonth() + 1).padStart(2, "0")}/${String(nextDateObj.getDate()).padStart(2, "0")}/${nextDateObj.getFullYear()}`

                    // Store the end time for the next day
                    overnightShiftEndTimes[nextDate] = endTime
                  }
                } catch (error) {
                  console.error("Error processing time:", error, row)
                }
              }
            })

            // Second pass: process each row into calendar events
            dataRows.forEach((row) => {
              // Skip invalid rows
              if (!row[0] || !row[0].includes("/")) return

              // Extract date information
              const dateText = row[0]
              const dateMatch = dateText.match(/(\d{2}\/\d{2}).*?(\d{2}\/\d{2}\/\d{4})/)
              if (!dateMatch) return

              const fullDate = dateMatch[2]
              const [day, month, year] = fullDate.split("/")

              // Convert to MM/DD/YYYY format with zero-padding
              const formattedDate = `${month.padStart(2, "0")}/${day.padStart(2, "0")}/${year}`

              const startTime = row[1]
              const endTime = row[2]
              const shiftCode = row[3] || ""

              // Check for previous overnight shift
              const previousShiftEndTime = overnightShiftEndTimes[formattedDate]

              // Handle Rest Days
              if (!startTime || startTime === "RD") {
                let restDayStartTime = ""
                let restDayEndTime = ""
                let allDay = "TRUE"

                // If there's an overnight shift ending on this day,
                // adjust rest day to start after shift ends
                if (previousShiftEndTime) {
                  const [hours, minutes] = previousShiftEndTime.split(":").map(Number)
                  let newMinutes = minutes + 1
                  let newHours = hours

                  // Handle minute overflow
                  if (newMinutes >= 60) {
                    newHours = (newHours + 1) % 24
                    newMinutes = newMinutes % 60
                  }

                  // Format as HH:MM
                  restDayStartTime = `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`
                  restDayEndTime = "23:59"
                  allDay = "FALSE" // No longer an all-day event
                }

                // Create rest day event with warning if it follows an overnight shift
                const description = previousShiftEndTime
                  ? `Rest Day (${dateText}) - WARNING: FINISHED AFTER MIDNIGHT ASK BEFORE PLANNING ANYTHING EARLY`
                  : `Rest Day (${dateText})`

                icalData.push([
                  "RD", // Subject
                  formattedDate, // Start Date
                  restDayStartTime, // Start Time
                  formattedDate, // End Date
                  restDayEndTime, // End Time
                  allDay, // All Day
                  description, // Description with warning if needed
                  "", // Location
                ])
              }
              // Handle Annual Leave
              else if (startTime === "AL" || startTime === "A/L") {
                let alStartTime = ""
                let alEndTime = ""
                let allDay = "TRUE"

                // If there's an overnight shift ending on this day,
                // adjust leave to start after shift ends
                if (previousShiftEndTime) {
                  const [hours, minutes] = previousShiftEndTime.split(":").map(Number)
                  let newMinutes = minutes + 1
                  let newHours = hours

                  // Handle minute overflow
                  if (newMinutes >= 60) {
                    newHours = (newHours + 1) % 24
                    newMinutes = newMinutes % 60
                  }

                  // Format as HH:MM
                  alStartTime = `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`
                  alEndTime = "23:59"
                  allDay = "FALSE" // No longer an all-day event
                }

                // Create annual leave event with warning if it follows an overnight shift
                const description = previousShiftEndTime
                  ? `Annual Leave (${dateText}) - WARNING: FINISHED AFTER MIDNIGHT ASK BEFORE PLANNING ANYTHING EARLY`
                  : `Annual Leave (${dateText})`

                icalData.push([
                  "A/L", // Subject
                  formattedDate, // Start Date
                  alStartTime, // Start Time
                  formattedDate, // End Date
                  alEndTime, // End Time
                  allDay, // All Day
                  description, // Description with warning if needed
                  "", // Location
                ])
              }
              // Handle Study Days
              else if (startTime === "STUD") {
                // Default start time for study days is 9 AM
                let studStartTime = "09:00"

                // If there's an overnight shift ending on this day after 9 AM,
                // adjust study day to start after shift ends
                if (previousShiftEndTime) {
                  const [hours, minutes] = previousShiftEndTime.split(":").map(Number)
                  let newMinutes = minutes + 1
                  let newHours = hours

                  // Handle minute overflow
                  if (newMinutes >= 60) {
                    newHours = (newHours + 1) % 24
                    newMinutes = newMinutes % 60
                  }

                  // Only adjust if shift ends after 9 AM
                  const calculatedStartMinutes = newHours * 60 + newMinutes
                  if (calculatedStartMinutes > 9 * 60) {
                    studStartTime = `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`
                  }
                }

                // Create study day event (9 AM - 5 PM by default)
                icalData.push([
                  "STUD Day", // Subject
                  formattedDate, // Start Date
                  studStartTime, // Start Time
                  formattedDate, // End Date
                  "17:00", // End Time (5 PM)
                  "FALSE", // All Day
                  `Study Day (${dateText})`, // Description
                  "", // Location
                ])
              }
              // Handle Regular Work Shifts
              else {
                // Start with end date same as start date
                let endDate = formattedDate

                // Check if this is an overnight shift
                if (startTime && endTime) {
                  try {
                    const startTimeParts = startTime.split(":")
                    const endTimeParts = endTime.split(":")

                    if (startTimeParts.length === 2 && endTimeParts.length === 2) {
                      const [startHour, startMinute] = startTimeParts.map(Number)
                      const [endHour, endMinute] = endTimeParts.map(Number)

                      const startTimeMinutes = startHour * 60 + startMinute
                      const endTimeMinutes = endHour * 60 + endMinute

                      // If end time is earlier than start time, it spans to next day
                      if (endTimeMinutes < startTimeMinutes) {
                        const dateParts = formattedDate.split("/")
                        const startDateObj = new Date(
                          Number(dateParts[2]),
                          Number.parseInt(dateParts[0]) - 1,
                          Number.parseInt(dateParts[1]),
                        )

                        // Calculate next day's date
                        const endDateObj = new Date(startDateObj)
                        endDateObj.setDate(endDateObj.getDate() + 1)

                        // Format as MM/DD/YYYY
                        endDate = `${String(endDateObj.getMonth() + 1).padStart(2, "0")}/${String(endDateObj.getDate()).padStart(2, "0")}/${endDateObj.getFullYear()}`
                      }
                    }
                  } catch (error) {
                    console.error(`Error processing shift times for ${fullDate}:`, error)
                  }
                }

                // Create regular shift event
                icalData.push([
                  shiftCode || "Work Shift", // Subject (use shift code if available)
                  formattedDate, // Start Date
                  startTime, // Start Time
                  endDate, // End Date (might be next day)
                  endTime, // End Time
                  "FALSE", // All Day
                  `Work Shift (${dateText})`, // Description
                  "", // Location
                ])
              }
            })

            // Store the complete data
            setAllCalendarData(icalData)

            // Apply default filter (all events)
            applyFilter("all", icalData)

            // Update UI to show options
            updateProgress("Ready!", 100)
            setTimeout(() => {
              setIsProcessing(false)
              setShowOptions(true)
              setShowPreview(true)
              setActiveSection("options")
            }, 500)
          } catch (error) {
            console.error("Error processing CSV:", error)
            setStatus({
              type: "error",
              title: "Error Processing CSV",
              message: `There was a problem processing your file: ${error instanceof Error ? error.message : String(error)}`,
            })
            setIsProcessing(false)
          }
        },
        error: (error) => {
          console.error("Error parsing CSV:", error)
          setStatus({
            type: "error",
            title: "Error Parsing CSV",
            message: "There was a problem parsing your file. Please ensure it is a valid CSV file.",
          })
          setIsProcessing(false)
        },
      })
    } catch (error) {
      console.error("Error in Papa.parse:", error)
      setStatus({
        type: "error",
        title: "Error Parsing CSV",
        message: `There was a problem parsing your file: ${error instanceof Error ? error.message : String(error)}`,
      })
      setIsProcessing(false)
    }
  }, [])

  // Apply filter to calendar data
  const applyFilter = useCallback((filterType: string, data: string[][]) => {
    if (!data || data.length === 0) return

    // Create new filtered data array, starting with header row
    const newFilteredData: string[][] = []
    newFilteredData.push(data[0]) // Keep header row

    // Apply the selected filter
    switch (filterType) {
      case "all":
        // Include all events (no filtering needed)
        newFilteredData.push(...data.slice(1))
        break

      case "workdays":
        // Only include work shifts and STUD days
        for (let i = 1; i < data.length; i++) {
          const row = data[i]
          if (row[0] !== "RD" && row[0] !== "A/L") {
            newFilteredData.push(row)
          }
        }
        break

      case "daysoff":
        // Only include rest days and annual leave
        for (let i = 1; i < data.length; i++) {
          const row = data[i]
          if (row[0] === "RD" || row[0] === "A/L") {
            newFilteredData.push(row)
          }
        }
        break
    }

    setFilteredData(newFilteredData)
    setCalendarType(filterType)
  }, [])

  // Generate iCal file
  const generateICalFile = useCallback(async () => {
    if (!filteredData || filteredData.length <= 1) {
      setStatus({
        type: "error",
        title: "No Data Available",
        message: "Please upload a file first.",
      })
      return
    }

    setIsProcessing(true)
    setProgressText("Generating iCal file...")
    setProgress(0)

    // Add slight delay for better UX
    setTimeout(async () => {
      try {
        updateProgress("Converting to iCal format...", 50)

        // Parse the data for iCal
        const events = []
        const headers = filteredData[0]

        // Convert array data to objects (easier to work with)
        for (let i = 1; i < filteredData.length; i++) {
          const event: Record<string, string> = {}
          for (let j = 0; j < headers.length; j++) {
            event[headers[j]] = filteredData[i][j]
          }
          events.push(event)
        }

        // Generate iCal content
        const icalContent = await generateICalContent(events)

        updateProgress("Creating downloadable file...", 80)

        // Create downloadable file
        const blob = new Blob([icalContent], { type: "text/calendar;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = "tracs_schedule.ics"

        // Update progress and show success message
        updateProgress("Done!", 100)

        setTimeout(() => {
          setIsProcessing(false)

          // Show success message with download button
          const eventCount = filteredData.length - 1 // Subtract header row
          let eventType = "events"

          switch (calendarType) {
            case "workdays":
              eventType = "work shifts and STUD days"
              break
            case "daysoff":
              eventType = "rest days and annual leave"
              break
          }

          setStatus({
            type: "success",
            title: "Calendar File Ready!",
            message: `Your iCal file with ${eventCount} ${eventType} is ready to download. Click the button below to save it to your computer.`,
          })

          // Trigger download
          link.click()
        }, 500)
      } catch (error) {
        console.error("Error generating iCal:", error)
        setIsProcessing(false)
        setStatus({
          type: "error",
          title: "Error Generating Calendar",
          message: `There was a problem creating your iCal file: ${error instanceof Error ? error.message : String(error)}`,
        })
      }
    }, 500)
  }, [filteredData, calendarType])

  // Generate iCal content
  const generateICalContent = useCallback(async (events: Record<string, string>[]) => {
    // Import uuid library dynamically
    const { v4: uuidv4 } = await import("uuid")

    // Start the iCal file with required headers
    const icalContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//TRACS Converter//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ]

    // Process each event
    events.forEach((event) => {
      try {
        // Skip events without subject or start date
        if (!event.Subject || !event["Start Date"]) return

        // Generate unique ID for this event
        const uid = uuidv4()

        // Format dates and times
        let startDateTime, endDateTime
        const allDay = event["All Day"] && event["All Day"].toUpperCase() === "TRUE"

        // Get the date parts
        const startDateParts = event["Start Date"].split("/")
        if (startDateParts.length !== 3) return

        const startMonth = startDateParts[0].padStart(2, "0")
        const startDay = startDateParts[1].padStart(2, "0")
        const startYear = startDateParts[2]

        // Get end date parts (use start date if not provided)
        let endMonth, endDay, endYear

        if (event["End Date"]) {
          const endDateParts = event["End Date"].split("/")
          if (endDateParts.length !== 3) {
            endMonth = startMonth
            endDay = startDay
            endYear = startYear
          } else {
            endMonth = endDateParts[0].padStart(2, "0")
            endDay = endDateParts[1].padStart(2, "0")
            endYear = endDateParts[2]
          }
        } else {
          endMonth = startMonth
          endDay = startDay
          endYear = startYear
        }

        // Format for iCal
        if (allDay) {
          // All-day events
          startDateTime = `${startYear}${startMonth}${startDay}`

          // For all-day events, end date should be the day after
          // in iCal format (exclusive end date)
          const endDateObj = new Date(`${endYear}-${endMonth}-${endDay}`)
          endDateObj.setDate(endDateObj.getDate() + 1)

          endYear = endDateObj.getFullYear().toString()
          endMonth = String(endDateObj.getMonth() + 1).padStart(2, "0")
          endDay = String(endDateObj.getDate()).padStart(2, "0")

          endDateTime = `${endYear}${endMonth}${endDay}`
        } else {
          // Timed events
          let startTime = event["Start Time"] || "00:00"
          let endTime = event["End Time"] || "23:59"

          // Clean up times
          startTime = startTime.trim()
          endTime = endTime.trim()

          // Ensure proper format
          if (startTime.split(":").length !== 2) startTime = "00:00"
          if (endTime.split(":").length !== 2) endTime = "23:59"

          const [startHour, startMinute] = startTime.split(":")
          const [endHour, endMinute] = endTime.split(":")

          // Format as YYYYMMDDTHHMMSS
          startDateTime = `${startYear}${startMonth}${startDay}T${startHour.padStart(2, "0")}${startMinute.padStart(2, "0")}00`
          endDateTime = `${endYear}${endMonth}${endDay}T${endHour.padStart(2, "0")}${endMinute.padStart(2, "0")}00`
        }

        // Create the event in iCal format
        icalContent.push("BEGIN:VEVENT")
        icalContent.push(`UID:${uid}`)

        // Add dates - different format for all-day vs. timed events
        if (allDay) {
          icalContent.push(`DTSTART;VALUE=DATE:${startDateTime}`)
          icalContent.push(`DTEND;VALUE=DATE:${endDateTime}`)
        } else {
          icalContent.push(`DTSTART:${startDateTime}`)
          icalContent.push(`DTEND:${endDateTime}`)
        }

        // Add event details
        icalContent.push(`SUMMARY:${escapeIcal(event.Subject)}`)

        if (event.Description) {
          icalContent.push(`DESCRIPTION:${escapeIcal(event.Description)}`)
        }

        if (event.Location) {
          icalContent.push(`LOCATION:${escapeIcal(event.Location)}`)
        }

        // Add creation timestamp
        const now = new Date()
        const timestamp = now
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}/, "")
        icalContent.push(`DTSTAMP:${timestamp}`)

        icalContent.push("END:VEVENT")
      } catch (error) {
        console.error("Error processing event for iCal:", error, event)
      }
    })

    // Close the calendar
    icalContent.push("END:VCALENDAR")

    // Join with CRLF as required by iCal spec
    return icalContent.join("\r\n")
  }, [])

  // Escape special characters for iCal format
  const escapeIcal = useCallback((text: string) => {
    if (!text) return ""
    return text
      .replace(/\\/g, "\\\\") // Escape backslashes
      .replace(/;/g, "\\;") // Escape semicolons
      .replace(/,/g, "\\,") // Escape commas
      .replace(/\n/g, "\\n") // Escape newlines
  }, [])

  // Update progress indicator
  const updateProgress = useCallback((text: string, percent: number) => {
    setProgressText(text)
    setProgress(percent)
  }, [])

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (uploadAreaRef.current) {
      uploadAreaRef.current.classList.add("border-primary")
      uploadAreaRef.current.classList.add("bg-primary/10")
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (uploadAreaRef.current) {
      uploadAreaRef.current.classList.remove("border-primary")
      uploadAreaRef.current.classList.remove("bg-primary/10")
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleBrowseClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0])
      }
    },
    [handleFile],
  )

  const handleRadioChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      applyFilter(e.target.value, allCalendarData)
    },
    [applyFilter, allCalendarData],
  )

  const resetForm = useCallback(() => {
    setUploadedFile(null)
    setAllCalendarData([])
    setFilteredData([])
    setShowOptions(false)
    setShowPreview(false)
    setIsProcessing(false)
    setStatus(null)
    setActiveSection("upload")
  }, [])

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

  // Return the original component JSX
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activePage="calendar" />

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Rest of the component JSX */}
        <div className="max-w-6xl mx-auto">
          {/* Header with Search */}
          <div className="flex justify-between items-center mb-6">
            <div className="w-1/2">
              <h1 className="text-3xl font-bold text-foreground">Calendar Converter</h1>
              <p className="text-muted-foreground">Transform your work schedule into calendar events</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveSection("upload")}
                className={`px-3 py-2 rounded-md transition-colors ${activeSection === "upload" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Upload
              </button>
              <button
                onClick={() => setActiveSection("instructions")}
                className={`px-3 py-2 rounded-md transition-colors ${activeSection === "instructions" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Instructions
              </button>
              {showOptions && (
                <button
                  onClick={() => setActiveSection("options")}
                  className={`px-3 py-2 rounded-md transition-colors ${activeSection === "options" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Options
                </button>
              )}
              {/* Search removed */}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-[hsl(var(--card-bg))] rounded-lg border border-[hsl(var(--card-border))] overflow-hidden">
            {/* Content Header */}
            <div className="border-b border-[hsl(var(--card-border))] p-4">
              <div className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">
                  {activeSection === "upload"
                    ? "Upload Schedule"
                    : activeSection === "instructions"
                      ? "How It Works"
                      : "Calendar Options"}
                </h2>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* Upload Section */}
                {activeSection === "upload" && !isProcessing && !status && (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      ref={uploadAreaRef}
                      className="border-2 border-dashed border-[hsl(var(--card-border))] rounded-lg p-12 text-center cursor-pointer transition-all bg-muted/5 hover:border-primary hover:bg-primary/10"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                    >
                      <div className="text-5xl text-primary mb-4">
                        <Upload className="h-16 w-16 mx-auto" />
                      </div>
                      <p className="text-foreground text-lg mb-4">Drag & drop your TRACS Enterprise CSV file here</p>
                      <p className="text-muted-foreground mb-4">- or -</p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileInputChange}
                      />
                      <button
                        onClick={handleBrowseClick}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 inline-flex items-center"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Browse Files
                      </button>
                    </div>

                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={() => setActiveSection("instructions")}
                        className="text-primary hover:text-primary/90 flex items-center"
                      >
                        Need help? View instructions
                        <ArrowLeft className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Instructions Section */}
                {activeSection === "instructions" && !isProcessing && !status && (
                  <motion.div
                    key="instructions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
                          1
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">Export from TRACS</h3>
                          <p className="text-muted-foreground">
                            Navigate to your work plan on TRACS and set the dates you'd like to convert
                          </p>
                          <p className="text-muted-foreground">
                            Scroll to the bottom and click{" "}
                            <span className="text-primary font-medium">Export to CSV</span> in the bottom left corner
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
                          2
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">Upload Your File</h3>
                          <p className="text-muted-foreground">
                            Drag and drop the CSV file here or use the Browse button
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
                          3
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">Choose Calendar Options</h3>
                          <p className="text-muted-foreground">
                            Select what to include in your calendar (all events, work only, or days off only)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
                          4
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">Download & Import</h3>
                          <p className="text-muted-foreground">
                            Generate your iCal file and import it into your preferred calendar app
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-[hsl(var(--card-border))]">
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative w-[260px] h-[530px] bg-black rounded-[40px] p-3 border border-[hsl(var(--card-border))] shadow-lg">
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120px] h-[25px] bg-black rounded-b-[20px] z-10"></div>
                          <div className="w-full h-full overflow-hidden rounded-[30px] bg-black">
                            <Image
                              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_8886.PNG-A56NSfODJG7bFKt3mq0JMsA3FdP7RE.png"
                              alt="Calendar app showing work schedule"
                              width={260}
                              height={530}
                              className="w-full h-full object-cover object-top"
                            />
                          </div>
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[100px] h-1 bg-gray-500 rounded-full"></div>
                        </div>

                        <div className="max-w-md">
                          <h3 className="font-medium mb-4 flex items-center text-foreground">
                            <Calendar className="mr-2 h-5 w-5 text-primary" />
                            See the Result
                          </h3>
                          <p className="text-muted-foreground">
                            Your shifts and days off are clearly displayed in your calendar app, making it easy to plan
                            your life around your work schedule.
                          </p>

                          <div className="mt-6 space-y-4">
                            <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Calendar className="h-4 w-4 text-primary" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Create separate calendars for work days and days off to set different colors for easy
                                visual scanning
                              </p>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Upload className="h-4 w-4 text-primary" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                When sharing your schedule with family or friends, consider sharing only your days off
                                for privacy
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-center">
                      <button
                        onClick={() => setActiveSection("upload")}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 inline-flex items-center"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Schedule Now
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Options Section */}
                {activeSection === "options" && showOptions && !isProcessing && !status && (
                  <motion.div
                    key="options"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-6">
                      <h3 className="text-foreground font-medium mb-3">
                        What would you like to include in your calendar?
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className="flex items-center p-4 bg-muted/10 rounded-lg border border-[hsl(var(--card-border))] cursor-pointer hover:border-primary transition-colors">
                          <input
                            type="radio"
                            name="calendar-type"
                            value="all"
                            checked={calendarType === "all"}
                            onChange={handleRadioChange}
                            className="sr-only"
                          />
                          <div className="flex items-center">
                            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex items-center justify-center mr-3">
                              {calendarType === "all" && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">All Events</div>
                              <div className="text-xs text-muted-foreground">
                                Include all shifts, rest days, and leave
                              </div>
                            </div>
                          </div>
                        </label>

                        <label className="flex items-center p-4 bg-muted/10 rounded-lg border border-[hsl(var(--card-border))] cursor-pointer hover:border-primary transition-colors">
                          <input
                            type="radio"
                            name="calendar-type"
                            value="workdays"
                            checked={calendarType === "workdays"}
                            onChange={handleRadioChange}
                            className="sr-only"
                          />
                          <div className="flex items-center">
                            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex items-center justify-center mr-3">
                              {calendarType === "workdays" && (
                                <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Work Days Only</div>
                              <div className="text-xs text-muted-foreground">Include shifts and STUD days</div>
                            </div>
                          </div>
                        </label>

                        <label className="flex items-center p-4 bg-muted/10 rounded-lg border border-[hsl(var(--card-border))] cursor-pointer hover:border-primary transition-colors">
                          <input
                            type="radio"
                            name="calendar-type"
                            value="daysoff"
                            checked={calendarType === "daysoff"}
                            onChange={handleRadioChange}
                            className="sr-only"
                          />
                          <div className="flex items-center">
                            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex items-center justify-center mr-3">
                              {calendarType === "daysoff" && (
                                <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Days Off Only</div>
                              <div className="text-xs text-muted-foreground">Include rest days and annual leave</div>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Preview Table */}
                    {showPreview && filteredData.length > 1 && (
                      <div className="border border-[hsl(var(--card-border))] rounded-lg overflow-hidden mb-6 bg-muted/10">
                        <div className="max-h-[300px] overflow-y-auto">
                          <table className="w-full">
                            <thead>
                              <tr>
                                <th className="p-3 text-left bg-muted/20 text-primary font-medium">Subject</th>
                                <th className="p-3 text-left bg-muted/20 text-primary font-medium">Start Date</th>
                                <th className="p-3 text-left bg-muted/20 text-primary font-medium">Start Time</th>
                                <th className="p-3 text-left bg-muted/20 text-primary font-medium">End Date</th>
                                <th className="p-3 text-left bg-muted/20 text-primary font-medium">End Time</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredData.slice(1, 6).map((row, index) => (
                                <tr key={index} className="hover:bg-muted/20">
                                  <td className="p-3 border-t border-[hsl(var(--card-border))]">
                                    {row[0]}
                                    {row[0] === "RD" && (
                                      <span className="ml-2 inline-block px-1.5 py-0.5 text-xs rounded bg-red-500/20 text-red-500">
                                        RD
                                      </span>
                                    )}
                                    {row[0] === "A/L" && (
                                      <span className="ml-2 inline-block px-1.5 py-0.5 text-xs rounded bg-red-500/20 text-red-500">
                                        A/L
                                      </span>
                                    )}
                                    {row[0] === "STUD Day" && (
                                      <span className="ml-2 inline-block px-1.5 py-0.5 text-xs rounded bg-purple-500/20 text-purple-500">
                                        STUD
                                      </span>
                                    )}
                                    {row[0] !== "RD" && row[0] !== "A/L" && row[0] !== "STUD Day" && (
                                      <span className="ml-2 inline-block px-1.5 py-0.5 text-xs rounded bg-purple-500/20 text-purple-500">
                                        WORK
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 border-t border-[hsl(var(--card-border))]">{row[1]}</td>
                                  <td className="p-3 border-t border-[hsl(var(--card-border))]">{row[2]}</td>
                                  <td className="p-3 border-t border-[hsl(var(--card-border))]">{row[3]}</td>
                                  <td className="p-3 border-t border-[hsl(var(--card-border))]">{row[4]}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="p-3 border-t border-[hsl(var(--card-border))] text-sm text-muted-foreground">
                          Showing preview of {Math.min(5, filteredData.length - 1)} of {filteredData.length - 1} events
                        </div>
                      </div>
                    )}

                    <div className="flex justify-center">
                      <button
                        onClick={generateICalFile}
                        className="bg-primary text-primary-foreground py-3 px-6 rounded-md hover:bg-primary/90 text-lg font-medium flex items-center"
                      >
                        <Calendar className="inline-block mr-2 h-5 w-5" />
                        Generate iCal File
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Progress Indicator */}
                {isProcessing && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center justify-center py-8"
                  >
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                    <p className="text-foreground mb-6">{progressText}</p>
                    <div className="w-full max-w-md">
                      <div className="flex justify-between text-sm text-muted-foreground mb-1">
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Status Messages */}
                {status && (
                  <motion.div
                    key="status"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`flex flex-col items-center text-center p-6 ${
                        status.type === "success"
                          ? "bg-green-500/10 border border-green-500/30 rounded-lg"
                          : "bg-red-500/10 border border-red-500/30 rounded-lg"
                      }`}
                    >
                      {status.type === "success" ? (
                        <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                      ) : (
                        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                      )}
                      <h3 className="text-xl font-bold mb-2 text-foreground">{status.title}</h3>
                      <p className="text-muted-foreground mb-6">{status.message}</p>

                      {status.type === "success" && (
                        <>
                          <div className="flex items-start p-4 bg-red-500/10 border-l-4 border-red-500 rounded mb-6 text-left">
                            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm text-foreground">
                                <span className="font-medium text-red-500">For best results:</span> Use "Add Calendar"
                                option when importing, rather than adding to an existing calendar. This enables custom
                                colors, easy sharing, and simple deletion if needed.
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={resetForm}
                            className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-md flex items-center"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download iCal File
                          </button>
                        </>
                      )}

                      {status.type === "error" && (
                        <button
                          onClick={resetForm}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-6 rounded-md"
                        >
                          Try Again
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
