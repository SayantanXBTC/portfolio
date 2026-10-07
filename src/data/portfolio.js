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
  physsverse: [1600, 740],
  humanityos: [1600, 743],
  druganalysis: [1600, 785],
  redcross: [1600, 747],
  bankmanagement: [1600, 906],
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
  { id: "projects", label: "Work" },
  { id: "skills", label: "Skills" },
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
    w: 1600,
    h: 740,
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
    w: 1600,
    h: 743,
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
    w: 1600,
    h: 785,
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
    w: 1600,
    h: 747,
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
    w: 1600,
    h: 906,
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
