import { asset } from "../lib/asset";

// All content below comes from the existing portfolio. Nothing is invented.

export const profile = {
  name: "Sayantan Bhattacharjee",
  brand: "SayantanXBTC",
  roles: ["Automation Engineer", "Applied Particle Physics Researcher", "Web Developer"],
  eyebrow: "Automation Engineer / Applied Physics Researcher",
  headline: ["Reliable systems,", "built with", "experimental rigor."],
  typed: "I turn complex manual processes into streamlined, repeatable workflows.",
  intro:
    "B.Tech Computer Science student at Lovely Professional University, specializing in automation engineering and software quality assurance.",
  location: "Agartala, Tripura, India",
  email: "bhattacharjeesayantan86@gmail.com",
  phones: ["+91 9366335595", "+91 8798144052"],
  phoneLink: "tel:+919366335595",
  resume: asset("docs/Sayantan-General%20CV.pdf"),
  portrait: asset("images/portrait.webp"),
  socials: [
    { label: "GitHub", href: "https://github.com/SayantanXBTC" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/sayantan-bhattacharje/" },
    { label: "Instagram", href: "https://instagram.com/sayantanxbtc" },
    { label: "Email", href: "mailto:bhattacharjeesayantan86@gmail.com" },
  ],
};

export const sections = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "achievements", label: "Achievements" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
];

export const about = {
  statement:
    "I'm a Computer Science engineer focused on software engineering, testing and automation, building reliable systems with experimental rigor.",
  paragraphs: [
    "I'm a B.Tech Computer Science student at Lovely Professional University, specializing in automation engineering and software quality assurance. My journey began with solving automation challenges, which evolved into a passion for designing robust testing frameworks and reliable software systems.",
    "My background in applied particle physics research has shaped my approach to software development. I apply experimental methodology to engineering: formulate hypotheses, design controlled tests, measure outcomes, and iterate based on data. This scientific rigor translates directly into building maintainable, well-tested codebases.",
    "Beyond development, I actively participate in competitive quizzing, contribute to research discussions, and optimize automation pipelines for performance. I focus on transforming complex manual processes into streamlined, repeatable workflows that deliver consistent results.",
  ],
  snapshot: [
    { label: "Primary", value: "Java, Selenium, TestNG, REST API testing" },
    { label: "Frontend", value: "React, TailwindCSS, Vite, Framer Motion" },
    { label: "Data & DevOps", value: "Docker, Git, GitHub Actions" },
    { label: "Tools", value: "Postman, Maven, Jenkins, Allure Reporting" },
  ],
  // Every figure here already appears in the existing portfolio content.
  stats: [
    { value: 9.1, decimals: 1, suffix: "", label: "CGPA", note: "B.Tech CSE, LPU" },
    { value: 88, decimals: 0, suffix: "%", label: "Test coverage", note: "Techvanto internship" },
    { value: 25, decimals: 0, prefix: "~", suffix: "%", label: "Faster requests", note: "Avg. processing time" },
    { value: 65000, decimals: 0, suffix: "+", label: "Quiz participants", note: "Ranked in the top 100" },
  ],
};

export const experience = [
  {
    year: "Jun — Aug 2025",
    role: "JAVA Programming Intern",
    org: "Techvanto Academy",
    summary:
      "Developed advanced Java modules focusing on concurrency, collections, and JDBC. Designed unit & integration tests and improved performance across database operations.",
    points: [
      "Designed multithreaded components handling concurrent requests",
      "Implemented JDBC connection pooling and optimized SQL queries",
      "Created automated test suites for core modules with JUnit and TestNG",
    ],
    impact: "Reduced average request processing time by ~25% and improved test coverage to 88%",
    tech: ["Java", "JDBC", "Concurrency", "SQL", "JUnit", "TestNG"],
    gallery: [{ src: asset("docs/sayantan-intern.jpg"), alt: "Techvanto Academy internship certificate" }],
    galleryLabel: "View certificate",
  },
  {
    year: "Leadership",
    role: "President",
    org: "ConverseE+ Club",
    summary:
      "Led a student-run engineering and entrepreneurship club where I organized 15+ workshops, hackathons and mentoring sessions. Built partnerships with local startups and helped students ship 8 small projects.",
    points: [],
    impact: "Increased club membership and raised sponsorships for events.",
    tech: ["Leadership", "Mentoring", "Hackathons", "Partnerships"],
    gallery: [
      { src: asset("images/PRES1.webp"), alt: "ConverseE+ Club event" },
      { src: asset("images/PRES2.webp"), alt: "ConverseE+ Club session" },
    ],
    galleryLabel: "View gallery",
  },
];

export const projects = [
  {
    title: "PhysVerse",
    featured: true,
    tag: "3D / Physics",
    desc: "An immersive 3D physics simulation platform that visualizes complex particle interactions, quantum mechanics, and cosmological phenomena with real-time particle systems.",
    tech: ["React", "Three.js", "WebGL", "Physics", "GLSL"],
    details: [
      "Real-time 3D particle physics simulation",
      "Interactive quantum mechanics visualization",
      "WebGL-powered rendering engine",
      "Custom GLSL shaders for effects",
    ],
    github: "https://github.com/SayantanXBTC/PhysVerse",
    live: "https://physsversee.netlify.app/",
    image: asset("images/physsverse.webp"),
    ratio: 2543 / 1176,
  },
  {
    title: "Humanity OS",
    tag: "AI / Wellbeing",
    desc: "Real-time wellbeing platform combining on-device emotion analysis, carbon tracking, and AI therapist with offline-first storage and privacy-first architecture.",
    tech: ["React", "Vite", "TensorFlow.js", "Gemini AI", "IndexedDB"],
    details: [
      "On-device ML emotion detection",
      "Privacy-first data architecture",
      "AI-powered mental health support",
      "Carbon footprint tracking",
    ],
    github: "https://github.com/SayantanXBTC/Humanity-OS",
    live: "https://humanity-os.netlify.app/",
    image: asset("images/humanityos.webp"),
  },
  {
    title: "Drug Analysis Platform",
    tag: "Agentic AI",
    desc: "AI-powered drug recommendation system where users input their medical conditions and receive personalized drug suggestions with detailed information using agentic AI technology.",
    tech: ["Python", "Agentic AI", "React", "Tailwind CSS", "Flask"],
    details: [
      "Agentic AI for intelligent drug recommendations",
      "Condition-based drug analysis and suggestions",
      "Interactive React frontend with Tailwind CSS",
      "Real-time drug information and side effects",
    ],
    github: "https://github.com/SayantanXBTC/Medical-Analysis-Platform",
    live: "https://medicalanalysisplatform.netlify.app/",
    image: asset("images/druganalysis.webp"),
  },
  {
    title: "Red Cross Society Website",
    tag: "Full-stack",
    desc: "Comprehensive web platform featuring volunteer management, donation tracking, event coordination, and AI-powered chatbot for instant assistance.",
    tech: ["MongoDB", "Express", "React", "Node.js", "Socket.io"],
    details: [
      "Real-time volunteer coordination",
      "Secure payment integration",
      "Event management system",
      "AI chatbot for support",
    ],
    github: "https://github.com/SayantanXBTC/RedCrossAGT",
    live: "https://redcrosstrp.netlify.app/",
    image: asset("images/redcross.webp"),
  },
  {
    title: "Bank Management System",
    tag: "Java / Desktop",
    desc: "End-to-end banking application with secure database operations, automated transaction processing, and comprehensive financial reporting.",
    tech: ["Java", "Swing", "JDBC", "MySQL", "JUnit"],
    details: [
      "Secure transaction processing",
      "Multi-user account management",
      "Automated report generation",
      "Role-based access control",
    ],
    github: "https://github.com/SayantanXBTC/Bank-Management-System-",
    image: asset("images/bankmanagement.webp"),
  },
];

export const skillGroups = [
  { title: "Languages", items: ["Java", "JavaScript", "Python", "C", "C++"] },
  { title: "Frontend", items: ["React", "HTML5", "CSS3", "Tailwind CSS", "Framer Motion"] },
  { title: "Backend & Databases", items: ["Node.js", "Express.js", "MongoDB", "MySQL", "REST APIs"] },
  { title: "Testing & Automation", items: ["Selenium", "TestNG", "JUnit", "Postman", "Testing Library"] },
  { title: "DevOps & Tools", items: ["Git", "Docker", "Jenkins", "Maven", "GitHub Actions"] },
  {
    title: "Working Style",
    items: ["Problem Solving", "Team Collaboration", "Communication", "Time Management", "Leadership", "Adaptability"],
  },
];

export const achievements = [
  {
    title: "National Youth Festival 2025",
    role: "State Representative",
    badge: "National Recognition",
    detail:
      "Selected as the state representative from Tripura to present 'Tech for Viksit Bharat 2047' at the National Youth Festival. Presented a 12-minute talk outlining technology-driven education initiatives and prototype ideas for scalable learning platforms.",
    impact: "Presented to national leaders; selected among top delegates for a follow-up workshop.",
    images: [1, 2, 3, 4, 5].map((n) => ({
      src: asset(`images/NYF${n}.webp`),
      alt: `National Youth Festival 2025, photo ${n}`,
    })),
  },
  {
    title: "National Space Day 2025",
    role: "Quiz Winner",
    badge: "Top 100",
    detail:
      "Ranked among the top 100 participants in a national-level space quiz (65,000+ participants). Shortlisted and invited to the ISRO Sriharikota facility for a special outreach program.",
    impact: "Hands-on exposure to launch operations and research teams at ISRO.",
    images: [{ src: asset("images/SPACE.webp"), alt: "National Space Day 2025" }],
  },
  {
    title: "CPE Multi-Event Winner",
    role: "College level",
    badge: "Multi-Talented",
    detail:
      "Won multiple events across debates, quizzes, vocabulary & aptitude at the college level. Regular member of quiz teams and debate squads.",
    impact: "Overall holistic development.",
    images: [1, 2, 3, 4].map((n) => ({
      src: asset(`images/CPE${n}.webp`),
      alt: `CPE multi-event winner, photo ${n}`,
    })),
  },
];

export const education = [
  {
    years: "2023 — Now",
    title: "B.Tech, Computer Science & Engineering",
    place: "Lovely Professional University",
    when: "Aug 2023 – Present",
    details: "CGPA 9.1 · Data Structures, OS, DBMS, Software Testing",
    status: "Current",
  },
  {
    years: "2020 — 2022",
    title: "Intermediate",
    place: "Hindi Higher Secondary School, Agartala, Tripura",
    when: "2020 – 2022",
    details: "93.6% · Focus: Physics & Maths",
    status: "Completed",
  },
  {
    years: "2019 — 2020",
    title: "Matriculation",
    place: "Holy Cross School, Agartala, Tripura",
    when: "2019 – 2020",
    details: "96%",
    status: "Completed",
  },
];

export const certificates = [
  {
    title: "Foundations of Virtual Reality",
    org: "IIT Madras (NPTEL)",
    date: "November 2025",
    points: [
      "VR hardware, software, and 3D rendering pipelines",
      "Motion tracking and immersive environment design",
      "Practical VR UX and performance optimization",
    ],
    link: asset("docs/foundation-sb.pdf"),
  },
  {
    title: "ChatGPT-4 Prompt Engineering: ChatGPT, Generative AI & LLM",
    org: "Infosys Springboard",
    date: "August 2025",
    points: [
      "Finite automata, regular expressions, and context-free grammars",
      "Turing machines and computational complexity",
      "Formal language theory and compiler design principles",
    ],
    link: asset("docs/chatgpt.pdf"),
  },
  {
    title: "Master Generative AI & Tools",
    org: "Udemy",
    date: "August 2025",
    points: [
      "GANs, VAEs, Transformers & generative pipelines",
      "AI-generated images, text & audio workflows",
      "Hands-on projects using modern generative AI tools",
    ],
    link: asset("docs/master-sayantan.pdf"),
  },
  {
    title: "Build Generative AI Apps with No-Code",
    org: "Infosys Springboard",
    date: "August 2025",
    points: [
      "Created AI applications without writing code",
      "Drag-and-drop builders to integrate AI modules",
      "End-to-end deployment for AI applications",
    ],
    link: asset("docs/buildgenainocode.pdf"),
  },
  {
    title: "Test Tribe REST Assured Course",
    org: "Test Tribe",
    date: "January 2026",
    points: [
      "REST API automation using REST Assured framework",
      "Advanced API testing patterns and best practices",
      "Integration with TestNG and Maven for CI/CD",
    ],
    link: asset("docs/microservices.pdf"),
  },
  {
    title: "Test Automation using SOAP UI",
    org: "LinkedIn Learning",
    date: "January 2026",
    points: [
      "SOAP and REST web services testing automation",
      "Advanced scripting and data-driven testing",
      "Performance testing and load testing with SOAP UI",
    ],
    link: asset("docs/soapui.pdf"),
  },
];

// Keywords for the scroll-velocity strip (all taken from the skills above).
export const marqueeTop = ["Java", "Selenium", "TestNG", "REST Assured", "JUnit", "JDBC", "Maven", "Jenkins"];
export const marqueeBottom = ["React", "Node.js", "MongoDB", "Docker", "GitHub Actions", "Python", "Three.js", "Postman"];

export const videoSrc =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_041744_63efcd78-bf7d-4039-99e2-2461e8a61903.mp4";
