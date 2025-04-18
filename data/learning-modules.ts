/**
 * Learning Modules Data
 *
 * This file contains the sample data for learning modules used throughout the application.
 * It includes:
 * - Categories of learning modules (Rules, Routes, Traction)
 * - Detailed content for specific modules including quizzes, flashcards, and true/false exercises
 * - A collection of all sample modules for easy access
 *
 * This data structure serves as the foundation for the learning platform's content.
 */

// Sample learning module data organized by categories
export const learningModules = {
  /**
   * Rules category - focuses on policies, guidelines, standards, and procedures
   * These modules help users understand the regulatory aspects of the organization
   */
  Rules: ["Policies", "Guidelines", "Standards", "Procedures"],

  /**
   * Routes category - focuses on pathways, journeys, tracks, and progressions
   * These modules help users understand the different learning paths available
   */
  Routes: ["Pathways", "Journeys", "Tracks", "Progressions"],

  /**
   * Traction category - focuses on momentum, progress, growth, and development
   * These modules help users build momentum in their learning journey
   */
  Traction: ["Momentum", "Progress", "Growth", "Development"],
}

/**
 * Web Development Fundamentals Module
 *
 * A comprehensive module covering the basics of web development
 * including HTML, CSS, JavaScript, and related technologies.
 */
export const webDevFundamentals = {
  title: "Web Development Fundamentals",
  category: "Routes",
  description: "Learn the core concepts and technologies of modern web development",
  methods: ["quiz", "flashcard", "truefalse"],
  content: {
    /**
     * Quiz section with multiple-choice questions
     * Each question includes:
     * - The question text
     * - An optional image URL
     * - Multiple choice options
     * - The index of the correct answer
     * - An optional hint
     */
    quiz: [
      {
        question: "What does HTML stand for?",
        imageUrl: "/html-code-example.png",
        options: [
          "Hyper Text Markup Language",
          "High Tech Modern Language",
          "Hyperlink and Text Markup Language",
          "Home Tool Markup Language",
        ],
        correctAnswer: 0,
        hint: "It's the standard markup language for documents designed to be displayed in a web browser.",
      },
      {
        question: "Which of the following is NOT a CSS box model property?",
        imageUrl: "/css-box-model-diagram.png",
        options: ["Margin", "Border", "Padding", "Alignment"],
        correctAnswer: 3,
        hint: "The CSS box model consists of content, padding, border, and margin.",
      },
      {
        question: "What is the correct JavaScript syntax to change the content of an HTML element with the id 'demo'?",
        imageUrl: "/dom-manipulation-code.png",
        options: [
          "document.getElement('demo').innerHTML = 'Hello';",
          "document.getElementById('demo').innerHTML = 'Hello';",
          "#demo.innerHTML = 'Hello';",
          "document.getElementByName('demo').innerHTML = 'Hello';",
        ],
        correctAnswer: 1,
        hint: "You need to use a method that selects an element by its ID attribute.",
      },
      {
        question: "Which HTTP status code indicates a successful response?",
        imageUrl: "/http-status-code-network.png",
        options: ["404", "500", "200", "302"],
        correctAnswer: 2,
        hint: "Status codes in the 200 range indicate success.",
      },
      {
        question: "Which of the following is a JavaScript framework?",
        imageUrl: "/javascript-framework-showdown.png",
        options: ["Django", "Flask", "Ruby on Rails", "React"],
        correctAnswer: 3,
        hint: "It was developed by Facebook and is widely used for building user interfaces.",
      },
    ],

    /**
     * Flashcards section with term-definition pairs
     * Each flashcard includes:
     * - The term to learn
     * - An optional image URL
     * - The definition of the term
     */
    flashcards: [
      {
        term: "HTML",
        imageUrl: "/html-code-display.png",
        definition:
          "HyperText Markup Language - The standard markup language for documents designed to be displayed in a web browser.",
      },
      {
        term: "CSS",
        imageUrl: "/stylized-css-badge.png",
        definition:
          "Cascading Style Sheets - A style sheet language used for describing the presentation of a document written in HTML.",
      },
      {
        term: "JavaScript",
        imageUrl: "/javascript-abstract-logo.png",
        definition:
          "A programming language that enables interactive web pages and is an essential part of web applications.",
      },
      {
        term: "API",
        imageUrl: "/placeholder.svg?key=st93i",
        definition:
          "Application Programming Interface - A set of rules that allows different software applications to communicate with each other.",
      },
      {
        term: "DOM",
        imageUrl: "/placeholder.svg?key=gpa6h",
        definition:
          "Document Object Model - A programming interface for web documents that represents the page so programs can change the document structure, style, and content.",
      },
      {
        term: "Responsive Design",
        imageUrl: "/placeholder.svg?height=300&width=500&query=responsive%20web%20design",
        definition:
          "An approach to web design that makes web pages render well on a variety of devices and window or screen sizes.",
      },
      {
        term: "AJAX",
        imageUrl: "/placeholder.svg?height=300&width=500&query=AJAX%20request%20diagram",
        definition:
          "Asynchronous JavaScript and XML - A set of web development techniques that allows web applications to work asynchronously.",
      },
    ],

    /**
     * True/False section with statements to evaluate
     * Each item includes:
     * - The statement to evaluate
     * - An optional image URL
     * - Whether the statement is true or false
     * - An explanation of why the statement is true or false
     */
    truefalse: [
      {
        statement: "HTML is a programming language.",
        imageUrl: "/html-code-example.png",
        isTrue: false,
        explanation:
          "HTML is a markup language, not a programming language. It's used to structure content on the web, but doesn't have programming capabilities like conditionals, loops, etc.",
      },
      {
        statement: "CSS can be used to create animations.",
        imageUrl: "/placeholder.svg?height=300&width=500&query=CSS%20animation%20example",
        isTrue: true,
        explanation:
          "CSS can create animations using properties like @keyframes, transition, and animation. These allow for movement, color changes, and other visual effects without JavaScript.",
      },
      {
        statement: "JavaScript can only run in the browser.",
        imageUrl: "/placeholder.svg?height=300&width=500&query=Node.js%20server",
        isTrue: false,
        explanation:
          "JavaScript can run both in browsers and on servers (using Node.js). It's a versatile language that powers both frontend and backend development.",
      },
      {
        statement: "HTTP is a stateless protocol.",
        imageUrl: "/placeholder.svg?height=300&width=500&query=HTTP%20request%20response%20cycle",
        isTrue: true,
        explanation:
          "HTTP is indeed stateless, meaning each request from a client to server is treated as a new request, without any memory of previous requests.",
      },
      {
        statement: "Responsive websites automatically adjust their layout based on the device's screen size.",
        imageUrl: "/placeholder.svg?height=300&width=500&query=responsive%20design%20across%20devices",
        isTrue: true,
        explanation:
          "Responsive design uses techniques like fluid grids, flexible images, and media queries to adapt layouts to different screen sizes and devices.",
      },
    ],
  },
}

/**
 * UX Design Principles Module
 *
 * A module covering the fundamentals of user experience design
 * including usability, accessibility, and information architecture.
 */
export const uxDesignPrinciples = {
  title: "UX Design Principles",
  category: "Rules",
  description: "Master the fundamental principles of user experience design",
  methods: ["quiz", "flashcard", "truefalse"],
  content: {
    // Quiz section with multiple-choice questions
    quiz: [
      {
        question: "What does UX stand for?",
        imageUrl: "/placeholder.svg?height=300&width=500&query=UX%20design%20process",
        options: ["User Experience", "User Examination", "User Extension", "User Execution"],
        correctAnswer: 0,
        hint: "It refers to how a person feels when interacting with a system.",
      },
      {
        question: "Which of the following is NOT one of Jakob Nielsen's 10 usability heuristics?",
        imageUrl: "/placeholder.svg?height=300&width=500&query=usability%20heuristics",
        options: [
          "Visibility of system status",
          "Match between system and the real world",
          "Aesthetic and minimalist design",
          "Maximum color variety",
        ],
        correctAnswer: 3,
        hint: "Nielsen's heuristics focus on simplicity and clarity rather than visual complexity.",
      },
      {
        question: "What is the primary goal of user research in UX design?",
        imageUrl: "/placeholder.svg?height=300&width=500&query=user%20research%20methods",
        options: [
          "To create beautiful interfaces",
          "To understand user needs and behaviors",
          "To reduce development costs",
          "To increase marketing effectiveness",
        ],
        correctAnswer: 1,
        hint: "UX design is centered around understanding the people who will use the product.",
      },
    ],

    // Flashcards section with term-definition pairs
    flashcards: [
      {
        term: "Usability",
        imageUrl: "/placeholder.svg?height=300&width=500&query=usability%20testing",
        definition:
          "The extent to which a product can be used by specified users to achieve specified goals with effectiveness, efficiency, and satisfaction in a specified context of use.",
      },
      {
        term: "Accessibility",
        imageUrl: "/placeholder.svg?height=300&width=500&query=web%20accessibility",
        definition:
          "The practice of making websites and applications usable by as many people as possible, including those with disabilities.",
      },
      {
        term: "Information Architecture",
        imageUrl: "/placeholder.svg?height=300&width=500&query=information%20architecture%20diagram",
        definition:
          "The structural design of shared information environments; the art and science of organizing and labeling websites, intranets, online communities, and software to support usability and findability.",
      },
      {
        term: "User Persona",
        imageUrl: "/placeholder.svg?height=300&width=500&query=user%20persona%20template",
        definition:
          "A fictional representation of your ideal customer based on market research and real data about your existing customers.",
      },
    ],

    // True/False section with statements to evaluate
    truefalse: [
      {
        statement: "UX design and UI design are the same thing.",
        imageUrl: "/placeholder.svg?height=300&width=500&query=UX%20vs%20UI%20design",
        isTrue: false,
        explanation:
          "While related, UX (User Experience) design focuses on the overall feel of the experience, while UI (User Interface) design focuses specifically on the visual elements and interaction points.",
      },
      {
        statement: "Accessibility in design only benefits users with disabilities.",
        imageUrl: "/placeholder.svg?height=300&width=500&query=accessibility%20benefits%20everyone",
        isTrue: false,
        explanation:
          "Accessibility benefits all users. Features like good contrast, keyboard navigation, and clear instructions help everyone, not just those with disabilities.",
      },
      {
        statement: "User testing should be conducted throughout the design process, not just at the end.",
        imageUrl: "/placeholder.svg?height=300&width=500&query=iterative%20user%20testing",
        isTrue: true,
        explanation:
          "User testing is most effective when conducted iteratively throughout the design process, allowing for continuous improvement based on feedback.",
      },
    ],
  },
}

/**
 * Data Visualization Techniques Module
 *
 * A module covering methods for effectively visualizing data
 * including chart types, color usage, and best practices.
 */
export const dataVisualization = {
  title: "Data Visualization Techniques",
  category: "Traction",
  description: "Learn how to effectively communicate data through visual representations",
  methods: ["quiz", "flashcard", "truefalse"],
  content: {
    // Quiz section with multiple-choice questions
    quiz: [
      {
        question: "Which chart type is best for showing the composition of a whole?",
        imageUrl: "/placeholder.svg?height=300&width=500&query=pie%20chart%20vs%20bar%20chart",
        options: ["Line chart", "Scatter plot", "Pie chart", "Bar chart"],
        correctAnswer: 2,
        hint: "This chart divides a circle into slices to illustrate numerical proportion.",
      },
      {
        question: "What is the primary purpose of data visualization?",
        imageUrl: "/placeholder.svg?height=300&width=500&query=data%20visualization%20examples",
        options: [
          "To make data look attractive",
          "To communicate information clearly and efficiently",
          "To hide complex data structures",
          "To replace textual information entirely",
        ],
        correctAnswer: 1,
        hint: "It's about making complex data more accessible, understandable, and usable.",
      },
    ],

    // Flashcards section with term-definition pairs
    flashcards: [
      {
        term: "Data Visualization",
        imageUrl: "/placeholder.svg?height=300&width=500&query=data%20visualization%20examples",
        definition:
          "The graphic representation of data to communicate information clearly and efficiently through statistical graphics, plots, information graphics, and other tools.",
      },
      {
        term: "Infographic",
        imageUrl: "/placeholder.svg?height=300&width=500&query=infographic%20example",
        definition:
          "A visual representation of information or data, designed to present complex information quickly and clearly.",
      },
      {
        term: "Choropleth Map",
        imageUrl: "/placeholder.svg?height=300&width=500&query=choropleth%20map%20example",
        definition:
          "A thematic map in which areas are shaded or patterned in proportion to the measurement of the statistical variable being displayed on the map.",
      },
    ],

    // True/False section with statements to evaluate
    truefalse: [
      {
        statement: "3D charts are always better than 2D charts for data visualization.",
        imageUrl: "/placeholder.svg?height=300&width=500&query=3D%20vs%202D%20charts",
        isTrue: false,
        explanation:
          "3D charts often distort data and make it harder to interpret accurately. 2D charts are generally clearer and more precise for most data visualization needs.",
      },
      {
        statement: "Color is an important element in data visualization.",
        imageUrl: "/placeholder.svg?height=300&width=500&query=color%20in%20data%20visualization",
        isTrue: true,
        explanation:
          "Color can be used effectively to highlight important data, show patterns, and create visual hierarchies, though it should be used thoughtfully and with accessibility in mind.",
      },
    ],
  },
}

/**
 * Collection of all sample modules
 *
 * This object provides easy access to all the sample modules
 * by their title for use throughout the application.
 */
export const sampleModules = {
  "Web Development Fundamentals": webDevFundamentals,
  "UX Design Principles": uxDesignPrinciples,
  "Data Visualization Techniques": dataVisualization,
}
