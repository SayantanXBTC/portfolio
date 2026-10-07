import { asset } from "../lib/asset";

// Natural pixel sizes, so every photo is shown at its own aspect ratio (no cropping).
const DIMS = {
  PRES1: [1400, 982],
  PRES2: [1400, 933],
  NYF1: [1400, 1867],
  NYF2: [1400, 2489],
  NYF3: [1400, 1194],
  NYF4: [1400, 764],
  NYF5: [1400, 1867],
  SPACE: [1400, 664],
  CPE1: [1400, 1050],
  CPE2: [1400, 1107],
  CPE3: [1400, 1668],
  CPE4: [1400, 1453],
};
const photo = (name, alt, extra = {}) => ({
  src: asset(`images/${name}.webp`),
  alt,
  w: DIMS[name][0],
  h: DIMS[name][1],
  ...extra,
});

// All content below comes from the existing portfolio. Nothing is invented.

export const profile = {
  name: "Sayantan Bhattacharjee",
  brand: "SayantanXBTC",
  greeting: "Hi, I'm",
  nameLines: ["Sayantan", "Bhattacharjee."],
  roles: ["Automation Engineer", "Full-Stack Developer"],
  signature: "Based in India · Building for the web",
  location: "Agartala, Tripura, India",
  email: "bhattacharjeesayantan86@gmail.com",
  phones: ["+91 9366335595", "+91 8798144052"],
  resume: asset("docs/Sayantan-General%20CV.pdf"),
  portrait: asset("images/profile.webp"),
  socials: [
    { label: "GitHub", href: "https://github.com/SayantanXBTC" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/sayantan-bhattacharje/" },
    { label: "Instagram", href: "https://instagram.com/sayantanxbtc" },
    { label: "Email", href: "mailto:bhattacharjeesayantan86@gmail.com" },
  ],
};

// Page order. `nav: false` keeps an entry out of the top navigation.
export const sections = [
  { id: "home", label: "Home", nav: false },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Work" },
  { id: "achievements", label: "Recognition" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact", nav: false },
];
// Numbered chapters (everything between the hero and the closing frame).
export const chapters = sections.filter((s) => s.id !== "home" && s.id !== "contact");
export const chapterIndex = (id) => {
  const i = chapters.findIndex((c) => c.id === id);
  return `${String(i + 1).padStart(2, "0")} / ${String(chapters.length).padStart(2, "0")}`;
};

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
};

export const experience = [
  {
    kind: "Leadership",
    year: "Student leadership",
    role: "President",
    org: "ConverseE+ Club",
    summary:
      "Led a student-run engineering and entrepreneurship club where I organized 15+ workshops, hackathons and mentoring sessions. Built partnerships with local startups and helped students ship 8 small projects.",
    points: [],
    impact: "Increased club membership and raised sponsorships for events.",
    tech: ["Leadership", "Mentoring", "Hackathons", "Partnerships"],
    photos: [
      photo("PRES1", "Sayantan at a ConverseE+ Club event", { caption: "ConverseE+ Club" }),
      photo("PRES2", "ConverseE+ Club session", { caption: "Club session" }),
    ],
  },
  {
    kind: "Internship",
    year: "Jun — Aug 2025",
    role: "Java Programming Intern",
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
    document: {
      src: asset("images/certs/intern.webp"),
      preview: asset("images/certs/intern-sm.webp"),
      alt: "Techvanto Academy internship certificate",
      caption: { title: "Certificate of completion", meta: "Techvanto Academy · 2025" },
    },
  },
];

// Screen recordings, compressed from the raw captures (public/videos/raw is not published).
const film = (slug) => ({
  slug,
  video: asset(`videos/${slug}.mp4`),
  poster: asset(`videos/${slug}.webp`),
  w: 1440,
  h: 788,
});

// Order is deliberate: QA / Automation, AI Testing, Computer Vision, Scientific Computing, Real-Time Systems.
export const projects = [
  {
    ...film("ai-bug-hunter"),
    title: "AI Bug Hunter",
    chapter: "QA / Automation",
    descriptor: "Autonomous Web Testing & Bug Intelligence",
    color: "#a78bfa",
    summary:
      "Give it a website and AI does the QA work: it explores the pages, writes Playwright tests, runs them, and groups related failures into a short list of real bugs.",
    core: "What if a QA engineer could give an AI a website and let it discover, test, and organize bugs automatically?",
    stats: [
      { value: "329", label: "automated tests" },
      { value: "DB + API", label: "multi-tenant isolation" },
      { value: "Sonnet 4.6", label: "writes the Playwright tests" },
    ],
    tech: ["TypeScript", "React", "Express", "Playwright", "Claude Sonnet 4.6", "PostgreSQL / Neon", "Google auth", "Vercel", "Render"],
    story: [
      "AI Bug Hunter is an autonomous web testing and bug-intelligence platform designed to reduce the amount of repetitive manual work involved in discovering and organizing software defects. Instead of requiring a tester to manually explore an application and write individual test cases, the platform can discover a public web application, use Claude Sonnet 4.6 to generate Playwright-based tests, execute those tests against the application, and analyze the resulting failures. The goal is not simply to report every failed test, but to turn raw automated failures into useful, consolidated bug information.",
      "A major part of the system is its bug intelligence layer. Multiple automated tests can fail for the same underlying reason, so the platform clusters failures into deduplicated bug reports rather than producing a noisy list of independent failures. This makes the output more useful to developers and QA engineers by transforming large volumes of test execution data into a smaller set of actionable issues.",
      "The platform was also designed as a proper multi-user application rather than a standalone testing script. Multi-tenant isolation is enforced at both the database and API layers, ensuring that one customer's test runs and bug reports cannot be accessed by another customer. It includes Google authentication, role-based permissions, and a substantial automated test suite containing 329 automated tests. The application is deployed using Vercel, Render, and Neon Postgres, combining an interactive React frontend, an Express backend, AI-powered test generation, browser automation, and secure persistent data storage.",
    ],
    facts: [
      "Discover → generate Playwright tests with Claude Sonnet 4.6 → execute → analyze",
      "Failures clustered into deduplicated bug reports",
      "Multi-tenant isolation enforced at the database and API layers",
      "Google authentication and role-based permissions",
      "329 automated tests",
      "Deployed on Vercel, Render and Neon Postgres",
    ],
    github: "https://github.com/SayantanXBTC/ai-bug-hunter",
    live: "https://ai-bug-hunter-api.vercel.app/",
  },
  {
    ...film("visuguard"),
    title: "VisuGuard",
    chapter: "AI Testing",
    descriptor: "AI-Powered Visual Regression Testing Suite",
    color: "#ff7a45",
    summary:
      "Catches unintended UI changes between releases: it screenshots each page, pixel-diffs it against an approved baseline, and Claude vision explains each change in plain English and rates its severity.",
    core: "Automated visual QA that doesn't just show what changed — it explains why the change matters.",
    stats: [
      { value: "10", label: "pages crawled per run, at most" },
      { value: "Severity", label: "on every change, from Claude vision" },
      { value: "PDF", label: "comparison reports via PDFKit" },
    ],
    tech: ["React", "Vite", "Node.js", "Express", "Playwright", "Resemble.js", "Claude API", "Supabase", "PostgreSQL", "PDFKit", "Docker", "Railway", "Vercel"],
    story: [
      "VisuGuard is an automated visual regression testing platform built to detect and explain visual changes between different versions or deployments of a web application. The platform addresses a common problem in modern web development: an application can remain functionally correct while a deployment unintentionally changes its visual appearance. Instead of relying entirely on manual inspection, VisuGuard automates the process of capturing screenshots, comparing them against approved baselines, identifying visual differences, and presenting those differences in an understandable report.",
      "The system uses Playwright for browser automation and Resemble.js for image comparison. A baseline version of a website can be captured first, after which a new deployment can be tested against that baseline. The platform can crawl up to ten pages, capture their rendered states, calculate visual differences, and preserve individual comparison reports. This creates a repeatable workflow for validating visual consistency across deployments rather than treating every release as a manual inspection exercise.",
      "VisuGuard also extends traditional pixel-diffing with an AI interpretation layer. Claude vision can analyze detected changes and explain them in plain English while assigning a severity level, making the raw visual diff easier to understand. The platform also includes Edith, a streaming in-app AI assistant, and supports exporting detailed comparison reports as PDFs using PDFKit. Authentication and security are handled through Supabase JWT authentication, Google OAuth, PostgreSQL Row-Level Security, and per-route rate limiting. The system is containerized with Docker and deployed across Railway and Vercel.",
    ],
    facts: [
      "Capture a baseline, then test a new deployment against it",
      "Crawls up to 10 pages per run",
      "Playwright capture + Resemble.js pixel diff",
      "Claude vision explains changes in plain English with a severity level",
      "Edith, a streaming in-app AI assistant",
      "PDF reports via PDFKit",
      "Supabase JWT, Google OAuth, Postgres Row-Level Security, per-route rate limiting",
      "Docker; deployed on Railway and Vercel",
    ],
    github: "https://github.com/SayantanXBTC/VisuGuard",
    live: "https://visu-guard.vercel.app/",
  },
  {
    ...film("recallpal"),
    title: "RecallPal",
    chapter: "Computer Vision",
    descriptor: "AI-Powered Dementia Assistance Platform",
    color: "#7b8cff",
    summary:
      "Helps people with dementia recognise loved ones: the camera turns a face into an embedding (a numeric fingerprint), finds the closest match in PostgreSQL with pgvector, and speaks a memory card.",
    core: "Using computer vision, vector search, and conversational AI to make everyday interactions easier for people living with memory-related difficulties.",
    stats: [
      { value: "<200ms", label: "recognition latency at scale" },
      { value: "512-d", label: "face embeddings · pgvector + HNSW" },
      { value: "28", label: "REST endpoints with consent + audit" },
    ],
    tech: ["Next.js 15", "Python", "Flask", "InsightFace", "PostgreSQL", "pgvector", "HNSW", "REST APIs", "Claude", "Docker"],
    story: [
      "RecallPal is an AI-powered assistance platform designed around the problem of helping people with dementia recognize and remember the people around them. The application combines real-time facial recognition with personalized memory information. When a person is recognized, RecallPal can retrieve the corresponding memory information and present it as a spoken memory card, creating a more natural and accessible way for the user to receive contextual information about someone they know.",
      "The recognition system uses InsightFace together with a vector-based retrieval architecture. Face embeddings are stored and searched using PostgreSQL with pgvector and HNSW indexing, allowing the application to efficiently locate the closest matching identity. The architecture is designed around 512-dimensional face embeddings and the project reports sub-200ms recognition latency at scale. This makes the project more than a simple facial-recognition demonstration: it combines computer vision, vector search, backend APIs, and a user-facing application into a single real-time workflow.",
      "RecallPal also includes EDITH, a Claude-powered voice assistant designed for caregivers. This gives the system a second interaction layer beyond recognition, allowing AI assistance to become part of the broader caregiving workflow. On the engineering side, the platform includes a GDPR-oriented consent and audit pipeline spanning 28 REST endpoints, while container optimization reduced Docker image size by 40% and RAM usage by 6×. The application combines a Next.js frontend with a Python/Flask backend and InsightFace-based recognition services.",
    ],
    facts: [
      "Real-time face recognition answered with a spoken memory card",
      "InsightFace with 512-dimensional embeddings",
      "PostgreSQL + pgvector with HNSW indexing",
      "Sub-200ms recognition latency at scale",
      "EDITH, a Claude-powered voice assistant for caregivers",
      "GDPR-oriented consent and audit pipeline across 28 REST endpoints",
      "Docker image 40% smaller, RAM use down 6×",
    ],
    github: "https://github.com/SayantanXBTC/RecallPal",
    live: "https://recall-pal.vercel.app/",
  },
  {
    ...film("physverse"),
    title: "PhysVerse",
    chapter: "Scientific Computing",
    descriptor: "Interactive Physics Exploration & Simulation Platform",
    color: "#f43f5e",
    summary:
      "Physics you can play with: run simulations like orbits, pendulums and black holes, tweak parameters such as gravity, and watch the system respond live. Formulas, physicists and challenges sit alongside.",
    core: "Turning physics from something you study into something you can interact with.",
    stats: [
      { value: "8+", label: "simulation families" },
      { value: "Live", label: "parameters you can change" },
      { value: "Full-stack", label: "React · Express · MongoDB" },
    ],
    tech: ["React", "TypeScript", "Node.js", "Express.js", "MongoDB", "REST APIs"],
    story: [
      "PhysVerse is an interactive physics platform created for people who want to explore physics through visualization, experimentation, and simulation rather than only reading static explanations. The platform brings together educational content about physics, famous physicists, formulas, challenges, user profiles, and interactive simulations into a single experience. Its central idea is to make abstract physical concepts easier to understand by allowing users to actually interact with and experiment with them.",
      "The project includes a simulation-driven architecture that allows different physics systems to be explored through interactive visual experiences. The simulation catalogue includes concepts such as solar systems, waves, pendulums, fluid systems, Lorenz attractors, quantum systems, black holes, and electromagnetic phenomena. Rather than presenting these as isolated animations, PhysVerse treats simulations as an interactive learning environment where users can experiment with parameters and observe how physical systems respond.",
      "Beyond simulations, the platform incorporates the broader educational experience around them. Users can explore information about famous physicists, browse formulas, complete physics challenges, compare performance through a leaderboard, and maintain a physics-focused profile. The application is built around a modern React-based frontend with a backend/API layer and persistent data architecture, making PhysVerse both an educational product and a full-stack engineering project.",
    ],
    facts: [
      "Simulations: solar systems, waves, pendulums, fluid systems, Lorenz attractors, quantum systems, black holes, electromagnetic phenomena",
      "Adjustable parameters on every simulation",
      "Famous physicists, a formula library and challenges",
      "Leaderboard and user profiles",
      "React frontend with a backend/API layer and persistent data",
    ],
    github: "https://github.com/SayantanXBTC/PhysVerse",
    live: "https://physverse.netlify.app/",
  },
  {
    ...film("tiki-topple"),
    title: "Tiki Topple",
    chapter: "Real-Time Systems",
    descriptor: "Real-Time Multiplayer Board Game",
    color: "#a3e635",
    summary:
      "A 2–4 player board game synced live over WebSockets. The server holds the official game state, so every move is checked there and no player can see another's cards.",
    core: "A board game used as a playground for real-time systems, networking, security, and state synchronization.",
    stats: [
      { value: "2–4", label: "players, synced in real time" },
      { value: "~50%", label: "lower hosting cost" },
      { value: "Auto", label: "reconnect after a drop" },
    ],
    tech: ["React 18", "Node.js", "Socket.io", "JavaScript", "Railway", "WebSockets"],
    story: [
      "Tiki Topple is a real-time multiplayer digital board game built to explore networking, synchronization, game-state management, and secure client-server architecture. The game supports 2–4 players and uses a React frontend with a Node.js backend and Socket.io to maintain real-time communication between connected players. Rather than treating the browser as the authority over the game, the application uses an authoritative server architecture so that important game state remains controlled by the backend.",
      "One of the interesting engineering challenges is information security between players. A multiplayer game cannot simply send every player's private information to every connected browser. Tiki Topple therefore keeps sensitive information, such as opponents' cards, hidden from unauthorized clients while synchronizing the public game state in real time. The server also incorporates request sanitization and rate limiting to protect the multiplayer API from abusive or malformed requests.",
      "The project also focuses on reliability during real-world network conditions. Automatic player reconnection and disconnect handling allow players to recover from temporary connection problems instead of immediately losing the game state. From a deployment perspective, the frontend and backend were consolidated into a single Railway service, reducing infrastructure complexity and cutting hosting costs by approximately half. The project ultimately became an exploration of how real-time multiplayer systems can combine responsive user interfaces with authoritative backend state and resilient networking.",
    ],
    facts: [
      "2–4 players over Socket.io",
      "Authoritative server owns the game state",
      "Opponents' cards hidden from unauthorized clients",
      "Request sanitization and rate limiting",
      "Automatic reconnection and disconnect handling",
      "Frontend + backend in one Railway service, about half the hosting cost",
    ],
    github: "https://github.com/SayantanXBTC/tiki-topple",
    live: "https://tikitopple.vercel.app/",
  },
];

export const achievements = [
  {
    title: "National Youth Festival 2025",
    short: "National Youth Festival",
    year: "2025",
    where: "Representing Tripura",
    role: "State Representative",
    badge: "National Recognition",
    detail:
      "Selected as the state representative from Tripura to present 'Tech for Viksit Bharat 2047' at the National Youth Festival. Presented a 12-minute talk outlining technology-driven education initiatives and prototype ideas for scalable learning platforms.",
    impact: "Presented to national leaders; selected among top delegates for a follow-up workshop.",
    images: [1, 2, 3, 4, 5].map((n) => photo(`NYF${n}`, `National Youth Festival 2025, photo ${n}`)),
  },
  {
    title: "National Space Day 2025",
    short: "National Space Day",
    year: "2025",
    where: "ISRO Sriharikota",
    role: "Quiz Winner",
    badge: "Top 100",
    detail:
      "Ranked among the top 100 participants in a national-level space quiz (65,000+ participants). Shortlisted and invited to the ISRO Sriharikota facility for a special outreach program.",
    impact: "Hands-on exposure to launch operations and research teams at ISRO.",
    images: [photo("SPACE", "Invitation to visit ISRO, National Space Day Quiz 2025")],
  },
  {
    title: "CPE Multi-Event Winner",
    short: "CPE Multi-Event",
    year: "College",
    where: "Debate · Quiz · Aptitude",
    role: "College level",
    badge: "Multi-Talented",
    detail:
      "Won multiple events across debates, quizzes, vocabulary & aptitude at the college level. Regular member of quiz teams and debate squads.",
    impact: "Overall holistic development.",
    images: [1, 2, 3, 4].map((n) => photo(`CPE${n}`, `CPE multi-event winner, photo ${n}`)),
  },
];

export const education = {
  university: {
    name: "Lovely Professional University",
    degree: "B.Tech — Computer Science & Engineering",
    years: "2023 — 2027",
    cgpa: "8.71",
    scale: "10",
    minor: "History",
    coursework: ["Data Structures", "Operating Systems", "DBMS", "Software Testing"],
    status: "Current",
  },
  schools: [
    {
      years: "2020 — 2022",
      title: "Intermediate",
      place: "Hindi Higher Secondary School, Agartala, Tripura",
      details: "93.6% · Focus: Physics & Maths",
    },
    {
      years: "2019 — 2020",
      title: "Matriculation",
      place: "Holy Cross School, Agartala, Tripura",
      details: "96%",
    },
  ],
};

// What I know -> what I build with -> what I keep exploring.
// Every item maps back to the existing skills, projects, certificates or About copy.
// `icon` is either a brand logo (si*) or a drawn concept icon (lucide), see Skills.jsx.
export const foundations = [
  {
    key: "engineering",
    title: "Engineering",
    line: "What I work in every day",
    items: [
      { name: "Java", icon: "Coffee", tint: "#E76F00" },
      { name: "JavaScript", icon: "siJavascript" },
      { name: "Python", icon: "siPython" },
      { name: "React", icon: "siReact" },
      { name: "Node.js", icon: "siNodedotjs" },
      { name: "Selenium", icon: "siSelenium" },
      { name: "TestNG", icon: "ListChecks", tint: "#E0533D" },
      { name: "JUnit", icon: "siJunit5" },
      { name: "REST Assured", icon: "ShieldCheck", tint: "#5BB974" },
      { name: "Postman", icon: "siPostman" },
    ],
  },
  {
    key: "systems",
    title: "Systems",
    line: "How the pieces hold together",
    items: [
      { name: "REST APIs", icon: "Network", tint: "#7FA7FF" },
      { name: "MongoDB", icon: "siMongodb" },
      { name: "MySQL", icon: "siMysql" },
      { name: "JDBC & concurrency", icon: "Workflow", tint: "#E9A23B" },
      { name: "Docker", icon: "siDocker" },
      { name: "Jenkins", icon: "siJenkins" },
      { name: "Maven", icon: "siApachemaven" },
      { name: "GitHub Actions", icon: "siGithubactions" },
    ],
  },
  {
    key: "exploration",
    title: "Exploration",
    line: "What I keep coming back to",
    items: [
      { name: "Particle physics", icon: "Atom", tint: "#8FD3FF" },
      { name: "History", icon: "ScrollText", tint: "#D9B77E" },
      { name: "Generative AI", icon: "BrainCircuit", tint: "#B794F6" },
      { name: "Virtual reality", icon: "Glasses", tint: "#6EE7B7" },
      { name: "WebGL & 3D", icon: "siThreedotjs" },
      { name: "Quizzing", icon: "Trophy", tint: "#F5C451" },
    ],
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
    image: asset("images/certs/foundation-sb.webp"),
    preview: asset("images/certs/foundation-sb-sm.webp"),
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
    image: asset("images/certs/chatgpt.webp"),
    preview: asset("images/certs/chatgpt-sm.webp"),
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
    image: asset("images/certs/master-sayantan.webp"),
    preview: asset("images/certs/master-sayantan-sm.webp"),
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
    image: asset("images/certs/buildgenainocode.webp"),
    preview: asset("images/certs/buildgenainocode-sm.webp"),
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
    image: asset("images/certs/microservices.webp"),
    preview: asset("images/certs/microservices-sm.webp"),
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
    image: asset("images/certs/soapui.webp"),
    preview: asset("images/certs/soapui-sm.webp"),
  },
];
