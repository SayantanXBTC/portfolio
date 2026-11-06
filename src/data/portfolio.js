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
  { id: "certifications", label: "Certificates" },
  { id: "contact", label: "Contact" },
];
// Numbered chapters (everything between the hero and the closing frame).
export const chapters = sections.filter((s) => s.id !== "home" && s.id !== "contact");
export const chapterIndex = (id) => {
  const i = chapters.findIndex((c) => c.id === id);
  return `${String(i + 1).padStart(2, "0")} / ${String(chapters.length).padStart(2, "0")}`;
};

export const about = {
  statement:
    "I'm a Computer Science engineer focused on software engineering, testing and automation.",
  paragraphs: [
    "I'm a B.Tech Computer Science student at Lovely Professional University, specializing in automation engineering and software quality assurance. I started by solving automation problems, which led me to designing testing frameworks and reliable software systems.",
    "Outside engineering, quizzing is what I keep coming back to. I'm a regular on my college's quiz teams, and in 2025 I ranked in the top 100 of more than 65,000 participants in the National Space Day quiz, which earned an invitation to ISRO's Sriharikota facility.",
    "I also debate, lead the ConverseE+ Club as President, and represented Tripura at the National Youth Festival 2025 with a talk on Tech for Viksit Bharat 2047. Along the way I've won debate, quiz, vocabulary and aptitude events at college level. Thinking on my feet and explaining things clearly carry straight into how I test and build software.",
  ],
  // `group` is the Skills group each tool jumps to; `skill` names its tile there, when it has one
  snapshot: [
    {
      label: "Primary",
      items: [
        { name: "Java", icon: "Coffee", tint: "#E76F00", group: "languages", skill: "Java" },
        { name: "Selenium", icon: "siSelenium", group: "testing", skill: "Selenium" },
        { name: "TestNG", icon: "ListChecks", tint: "#E0533D", group: "testing", skill: "TestNG" },
        { name: "REST API testing", icon: "ShieldCheck", tint: "#5BB974", group: "testing", skill: "REST Assured" },
      ],
    },
    {
      label: "Frontend",
      items: [
        { name: "React", icon: "siReact", group: "frontend", skill: "React" },
        { name: "TailwindCSS", icon: "siTailwindcss", group: "frontend" },
        { name: "Vite", icon: "siVite", group: "frontend", skill: "Vite" },
        { name: "Framer Motion", icon: "siFramer", group: "frontend" },
      ],
    },
    {
      label: "Data & DevOps",
      items: [
        { name: "Docker", icon: "siDocker", group: "devops", skill: "Docker" },
        { name: "Git", icon: "siGit", group: "devops" },
        { name: "GitHub Actions", icon: "siGithubactions", group: "devops", skill: "GitHub Actions" },
      ],
    },
    {
      label: "Tools",
      items: [
        { name: "Postman", icon: "siPostman", group: "testing", skill: "Postman" },
        { name: "Maven", icon: "siApachemaven", group: "devops", skill: "Maven" },
        { name: "Jenkins", icon: "siJenkins", group: "devops", skill: "Jenkins" },
        { name: "Allure Reporting", icon: "FileBarChart", tint: "#F2A93B", group: "testing" },
      ],
    },
  ],
  // phrases in the paragraphs that open a small card with the proof behind them
  proofs: [
    {
      phrase: "Lovely Professional University",
      image: asset("images/lpu.webp"),
      title: "Lovely Professional University",
      meta: "B.Tech CSE · CGPA 8.71 · 2023 — 2027",
      to: "education",
      cta: "Open the yearbook",
    },
    {
      phrase: "top 100 of more than 65,000 participants",
      image: asset("images/SPACE.webp"),
      title: "National Space Day Quiz 2025",
      meta: "Top 100 · invited to ISRO Sriharikota",
      to: "achievements",
      cta: "See it in Recognition",
    },
    {
      phrase: "ConverseE+ Club as President",
      image: asset("images/PRES1.webp"),
      title: "ConverseE+ Club",
      meta: "President · 15+ workshops, hackathons and mentoring sessions",
      to: "experience",
      cta: "See it in Experience",
    },
    {
      phrase: "National Youth Festival 2025",
      image: asset("images/NYF4.webp"),
      title: "National Youth Festival 2025",
      meta: "State representative · Tech for Viksit Bharat 2047",
      to: "achievements",
      cta: "See it in Recognition",
    },
  ],
};

export const experience = [
  {
    kind: "Leadership",
    year: "Student leadership",
    role: "President",
    org: "ConverseE+ Club",
    summary:
      "Led a student-run engineering and entrepreneurship club where I organized 15+ workshops, hackathons and mentoring sessions. I built partnerships with local startups, helped students ship 8 small projects, grew the club's membership and raised sponsorships for our events.",
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
// `mobile` is the same live site filmed at an iPhone 17 viewport (402 x 874 pt).
const film = (slug) => ({
  slug,
  video: asset(`videos/${slug}.mp4`),
  poster: asset(`videos/${slug}.webp`),
  posterTiny: asset(`videos/${slug}-tiny.webp`),
  w: 1440,
  h: 788,
  mobile: {
    video: asset(`videos/${slug}-mobile.mp4`),
    poster: asset(`videos/${slug}-mobile.webp`),
    w: 604,
    h: 1312,
  },
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
      "AI Bug Hunter is an autonomous web testing and bug-intelligence platform designed to reduce the repetitive manual work of finding and organizing software defects. A tester doesn't have to explore an application and write test cases by hand: the platform discovers a public web application, uses Claude Sonnet 4.6 to generate Playwright tests, runs them against the application, and analyzes the failures.",
      "A major part of the system is its bug intelligence layer. Many automated tests can fail for the same underlying reason, so the platform clusters failures into deduplicated bug reports. Developers and QA engineers get a short set of actionable issues instead of a noisy list of independent failures.",
      "It is also a multi-user application, not a standalone testing script. Multi-tenant isolation is enforced at both the database and API layers, so one customer can't see another customer's test runs or bug reports. It has Google authentication, role-based permissions, and 329 automated tests. It is deployed on Vercel, Render, and Neon Postgres, with a React frontend and an Express backend.",
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
    core: "Automated visual QA that shows what changed and explains why it matters.",
    stats: [
      { value: "10", label: "pages crawled per run, at most" },
      { value: "Severity", label: "on every change, from Claude vision" },
      { value: "PDF", label: "comparison reports via PDFKit" },
    ],
    tech: ["React", "Vite", "Node.js", "Express", "Playwright", "Resemble.js", "Claude API", "Supabase", "PostgreSQL", "PDFKit", "Docker", "Railway", "Vercel"],
    story: [
      "VisuGuard detects and explains visual changes between versions or deployments of a web application. An application can still work correctly after a deployment that unintentionally changed how it looks. Instead of relying entirely on manual inspection, VisuGuard captures screenshots, compares them against approved baselines, finds the visual differences, and presents them in a readable report.",
      "The system uses Playwright for browser automation and Resemble.js for image comparison. A baseline version of a website can be captured first, after which a new deployment can be tested against that baseline. The platform can crawl up to ten pages, capture their rendered states, calculate visual differences, and preserve individual comparison reports, so every deployment gets the same repeatable check.",
      "On top of the pixel diff, Claude vision explains each detected change in plain English and assigns it a severity level. The platform also includes Edith, a streaming in-app AI assistant, and supports exporting detailed comparison reports as PDFs using PDFKit. Authentication and security are handled through Supabase JWT authentication, Google OAuth, PostgreSQL Row-Level Security, and per-route rate limiting. The system is containerized with Docker and deployed across Railway and Vercel.",
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
      "RecallPal helps people with dementia recognize and remember the people around them. The application combines real-time facial recognition with personalized memory information. When it recognizes a person, RecallPal retrieves that person's memory information and reads it aloud as a spoken memory card.",
      "The recognition system uses InsightFace together with a vector-based retrieval architecture. Face embeddings are stored and searched using PostgreSQL with pgvector and HNSW indexing, allowing the application to efficiently locate the closest matching identity. The architecture is designed around 512-dimensional face embeddings and the project reports sub-200ms recognition latency at scale. Computer vision, vector search, backend APIs, and the user-facing application run as one real-time workflow.",
      "RecallPal also includes EDITH, a Claude-powered voice assistant designed for caregivers. On the engineering side, the platform includes a GDPR-oriented consent and audit pipeline spanning 28 REST endpoints, while container optimization reduced Docker image size by 40% and RAM usage by 6×. The application combines a Next.js frontend with a Python/Flask backend and InsightFace-based recognition services.",
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
      "PhysVerse is an interactive physics platform created for people who want to explore physics through visualization, experimentation, and simulation rather than only reading static explanations. The platform brings together educational content about physics, famous physicists, formulas, challenges, user profiles, and interactive simulations into a single experience.",
      "The project includes a simulation-driven architecture that allows different physics systems to be explored through interactive visual experiences. The simulation catalogue includes concepts such as solar systems, waves, pendulums, fluid systems, Lorenz attractors, quantum systems, black holes, and electromagnetic phenomena. In each one, users can change parameters and watch how the system responds.",
      "Users can also explore information about famous physicists, browse formulas, complete physics challenges, compare performance through a leaderboard, and maintain a physics-focused profile. The application runs on a React frontend with a backend/API layer and persistent data.",
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
      "Tiki Topple is a real-time multiplayer digital board game built to explore networking, synchronization, game-state management, and secure client-server architecture. The game supports 2–4 players and uses a React frontend with a Node.js backend and Socket.io to maintain real-time communication between connected players. It uses an authoritative server, so the backend, not the browser, controls important game state.",
      "A multiplayer game cannot simply send every player's private information to every connected browser. Tiki Topple therefore keeps sensitive information, such as opponents' cards, hidden from unauthorized clients while synchronizing the public game state in real time. The server also incorporates request sanitization and rate limiting to protect the multiplayer API from abusive or malformed requests.",
      "The project also focuses on reliability during real-world network conditions. Automatic player reconnection and disconnect handling allow players to recover from temporary connection problems instead of immediately losing the game state. The frontend and backend were consolidated into a single Railway service, reducing infrastructure complexity and cutting hosting costs by approximately half.",
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
    role: "Shortlisted Participant",
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
      "Won multiple events across debates, quizzes, vocabulary & aptitude at the college level.",
    impact: "Regular member of quiz teams and debate squads.",
    images: [1, 2, 3, 4].map((n) => photo(`CPE${n}`, `CPE multi-event winner, photo ${n}`)),
  },
];

export const education = {
  university: {
    name: "Lovely Professional University",
    short: "LPU",
    degree: "B.Tech — Computer Science & Engineering",
    years: "2023 — 2027",
    cgpa: "8.71",
    scale: "10",
    minor: "Software Testing & Quality Assurance",
    openMinor: "History",
    coursework: ["Data Structures", "Operating Systems", "DBMS", "Software Testing"],
    status: "Current",
    image: asset("images/lpu.webp"),
    photo: asset("images/lpu-photo.webp"),
  },
  schools: [
    {
      years: "2020 — 2022",
      title: "Senior Secondary",
      place: "Hindi Higher Secondary School, Agartala, Tripura",
      score: "93.6",
      image: asset("images/hhss.webp"),
      photo: asset("images/hhss-photo.webp"),
    },
    {
      years: "2019 — 2020",
      title: "Matriculation",
      place: "Holy Cross School, Agartala, Tripura",
      score: "96",
      image: asset("images/hcs.webp"),
      photo: asset("images/hcs-photo.webp"),
    },
  ],
};

// Skills, grouped by what they are for. Every item maps back to the existing
// skills, certificates or About copy, or to the stack of a project in `projects`.
// `icon` is either a brand logo (si*) or a drawn concept icon (lucide), see Skills.jsx;
// `tint` overrides the plate colour (brand colours that are near-black or missing).
export const foundations = [
  {
    key: "languages",
    title: "Languages",
    line: "What I write in",
    items: [
      { name: "Java", icon: "Coffee", tint: "#E76F00", note: { text: "My first language. Concurrency, collections and JDBC modules in my internship at Techvanto Academy.", to: "experience", cta: "See the internship" } },
      { name: "JavaScript", icon: "siJavascript" },
      { name: "TypeScript", icon: "siTypescript" },
      { name: "Python", icon: "siPython" },
    ],
  },
  {
    key: "frontend",
    title: "Frontend",
    line: "What people see and touch",
    items: [
      { name: "React", icon: "siReact" },
      { name: "Next.js", icon: "siNextdotjs", tint: "#EDEDED" },
      { name: "Vite", icon: "siVite" },
      { name: "WebGL & 3D", icon: "siThreedotjs", note: { text: "3D rendering pipelines from the Foundations of Virtual Reality course (IIT Madras), and the 3D scenes across this portfolio.", to: "certifications", cta: "See the certificate" } },
    ],
  },
  {
    key: "backend",
    title: "Backend",
    line: "What runs on the server",
    items: [
      { name: "Node.js", icon: "siNodedotjs" },
      { name: "Express", icon: "siExpress", tint: "#B9B9B9" },
      { name: "Flask", icon: "siFlask" },
      { name: "REST APIs", icon: "Network", tint: "#7FA7FF" },
      { name: "Socket.io", icon: "siSocketdotio", tint: "#F2F2F2" },
    ],
  },
  {
    key: "data",
    title: "Databases",
    line: "Where the data lives",
    items: [
      { name: "MySQL", icon: "siMysql", note: { text: "A strong foundation from my DBMS coursework, applied to SQL queries and tuning in my internship.", to: "education", cta: "See the coursework" } },
      { name: "PostgreSQL", icon: "siPostgresql" },
      { name: "MongoDB", icon: "siMongodb" },
      { name: "JDBC & concurrency", icon: "Workflow", tint: "#E9A23B", note: { text: "Multithreaded components and JDBC connection pooling, built in my Java internship.", to: "experience", cta: "See the internship" } },
    ],
  },
  {
    key: "testing",
    title: "Testing & QA",
    line: "How I prove it works",
    items: [
      { name: "Selenium", icon: "siSelenium", note: { text: "The core of my test automation practice, alongside my minor in Software Testing & Quality Assurance.", to: "education", cta: "See the minor" } },
      { name: "Playwright", icon: "Drama", tint: "#2EAD33" },
      { name: "TestNG", icon: "ListChecks", tint: "#E0533D", note: { text: "Automated test suites for core modules in my internship, and paired with REST Assured in the Test Tribe course.", to: "experience", cta: "See the internship" } },
      { name: "JUnit", icon: "siJunit5", note: { text: "Unit and integration tests for the Java modules I built in my internship.", to: "experience", cta: "See the internship" } },
      { name: "REST Assured", icon: "ShieldCheck", tint: "#5BB974", note: { text: "REST API automation, certified through the Test Tribe REST Assured course.", to: "certifications", cta: "See the certificate" } },
      { name: "Postman", icon: "siPostman", note: { text: "My everyday tool for exploring and testing APIs, alongside my API testing certificates.", to: "certifications", cta: "See the certificates" } },
    ],
  },
  {
    key: "devops",
    title: "DevOps & tools",
    line: "How it gets built and shipped",
    items: [
      { name: "Docker", icon: "siDocker" },
      { name: "Jenkins", icon: "siJenkins", note: { text: "CI pipelines for running test suites, studied as part of my Software Testing & Quality Assurance minor.", to: "education", cta: "See the minor" } },
      { name: "Maven", icon: "siApachemaven", note: { text: "Builds Java test projects; used with TestNG for CI/CD in the Test Tribe REST Assured course.", to: "certifications", cta: "See the certificate" } },
      { name: "GitHub Actions", icon: "siGithubactions", note: { text: "Builds and deploys this very portfolio on every push.", to: null, cta: null } },
    ],
  },
  {
    key: "ai",
    title: "AI",
    line: "Models put to work",
    items: [
      { name: "Generative AI", icon: "BrainCircuit", tint: "#B794F6" },
      { name: "Claude API", icon: "siClaude" },
      { name: "Computer vision", icon: "ScanFace", tint: "#5EC8E5" },
    ],
  },
  {
    key: "beyond",
    title: "Beyond code",
    line: "What I keep coming back to",
    items: [
      { name: "Quizzing", icon: "Trophy", tint: "#F5C451", note: { text: "Top 100 of 65,000+ in the National Space Day quiz, and college quiz wins.", to: "achievements", cta: "See it in Recognition" } },
      { name: "History", icon: "ScrollText", tint: "#D9B77E", note: { text: "My open minor at Lovely Professional University.", to: "education", cta: "See Education" } },
      { name: "Virtual reality", icon: "Glasses", tint: "#6EE7B7", note: { text: "Foundations of Virtual Reality, IIT Madras (NPTEL), November 2025.", to: "certifications", cta: "See the certificate" } },
    ],
  },
];

export const certificates = [
  {
    title: "Foundations of Virtual Reality",
    topic: "Virtual reality",
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
    topic: "Generative AI",
    org: "Infosys Springboard",
    date: "August 2025",
    points: [
      "Prompt engineering for ChatGPT-4",
      "Generative AI and large language model (LLM) fundamentals",
    ],
    link: asset("docs/chatgpt.pdf"),
    image: asset("images/certs/chatgpt.webp"),
    preview: asset("images/certs/chatgpt-sm.webp"),
  },
  {
    title: "Master Generative AI & Tools",
    topic: "Generative AI",
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
    topic: "Generative AI",
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
    topic: "API testing",
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
    topic: "API testing",
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
