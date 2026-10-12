// Single source of truth for every fact on the site.
// Sourced from Bipul's newest resumes + master resume + project READMEs.
// RULES: never add a number here that cannot be traced to a real source.
// Keep claims modest (no "led N engineers"), keep copy short, say "Nepal" not a city.

export const profile = {
  name: "Bipul Adhikari",
  handle: "bipuladk60",
  role: "Software Engineer",
  tagline: "Full-stack engineer who ships things people actually use.",
  origin: "Nepal",
  base: "Hattiesburg, Mississippi",
  status: "CS & Math senior · graduating May 2027 · open to new-grad SWE roles",
  email: "bipul.adhikari.2003@gmail.com",
  links: {
    github: "https://github.com/bipuladk60",
    linkedin: "https://www.linkedin.com/in/bipul-adhikari",
    warmer: "https://warmergames.com",
  },
  about: [
    "I grew up in Nepal and came to the University of Southern Mississippi to study Computer Science and Mathematics.",
    "I build full-stack web apps, presented ML research on forever chemicals and lung disease, and make games on the side, like Warmer, a daily geography game that teaches instead of just testing.",
  ],
};

export const stats = [
  { value: 4, suffix: "", label: "Hackathon wins" },
  { value: 6, suffix: "", label: "Hackathons competed" },
  { value: 400, suffix: "+", label: "Conference attendees served" },
  { value: 82, suffix: "%", label: "Best model accuracy (PFAS study)" },
];

export const education = [
  {
    school: "University of Southern Mississippi",
    degree: "B.S. Computer Science & Mathematics",
    when: "Expected May 2027",
    where: "Hattiesburg, MS",
    detail: "GPA 3.63 · Data Structures & Algorithms, Operating Systems, Databases, AI, Probability & Statistics",
  },
  {
    school: "Trinity International SS & College",
    degree: "Higher Secondary, Computer Science",
    when: "2022",
    where: "Nepal",
    detail: "",
  },
];

export type Experience = {
  id: string;
  company: string;
  role: string;
  when: string;
  where: string;
  summary: string;
  bullets: string[];
  stack: string[];
  /** true for the long-running role that continued alongside the others */
  concurrent?: boolean;
};

// Chronological, oldest first. Gulf South started first and continued
// alongside CadenceAI (internship) and then Illumibot.
export const experience: Experience[] = [
  {
    id: "gulfsouth",
    company: "Gulf South Center for Community Engaged Health Research",
    role: "Full Stack Developer",
    when: "Aug 2024 – Aug 2026",
    where: "Hattiesburg, MS",
    summary: "On-campus role that ran the whole way through: research websites, data tooling, and MHD Connect.",
    bullets: [
      "Proposed and built MHD Connect, a progressive web app for Mississippi Health Disparities 2026, the state's largest public health conference, used by 400+ attendees.",
      "Shipped the live agenda, speaker lists, profiles and announcements on Next.js and Firebase, with admin roles so staff could edit the agenda without a separate CMS.",
      "Wrote a Python script that pulls attendees from Firestore and prints name badges automatically.",
    ],
    stack: ["Next.js", "TypeScript", "Firebase", "Vercel", "Python", "Zod"],
    concurrent: true,
  },
  {
    id: "cadence",
    company: "CadenceAI",
    role: "Software Engineering Intern",
    when: "Mar 2025 – Aug 2025",
    where: "Remote",
    summary: "Internship on an AI product, working across the backend and the React frontend.",
    bullets: [
      "Worked on a backend microservice with FastAPI and RabbitMQ for asynchronous, event-driven processing.",
      "Built React/TypeScript screens from Figma designs, with Auth0 sign-in and Azure for messaging and storage.",
    ],
    stack: ["FastAPI", "RabbitMQ", "React", "TypeScript", "Auth0", "Azure"],
  },
  {
    id: "illumibot",
    company: "Illumibot / ArroyoDev",
    role: "Software Engineer Associate",
    when: "Sept 2025 – May 2026",
    where: "Remote",
    summary: "Worked on an internal shipping and inventory platform and the company's Flutter mobile app.",
    bullets: [
      "Helped build an internal shipping and inventory platform in TypeScript and Next.js that connects Shopify, Easyship, Square and Mailchimp for the operations team.",
      "Worked on the fulfillment flow: syncing shipments back to Shopify and Square, and order emails with SPF, DKIM and DMARC set up.",
      "Added schemas to a shared Zod package that keeps data types in sync between the web app, Firebase Cloud Functions and the Flutter app.",
    ],
    stack: ["TypeScript", "Next.js", "Node.js", "Flutter", "Firebase", "Zod"],
  },
];

export type Hackathon = {
  id: string;
  event: string;
  host: string;
  when: string;
  result: "win" | "participant";
  award: string;
  project: string;
  pitch: string;
  bullets: string[];
  stack: string[];
  links?: { label: string; href: string }[];
};

export const hackathons: Hackathon[] = [
  {
    id: "hatch23",
    event: "Hatchathon 2023",
    host: "University of Southern Mississippi",
    when: "Nov 2023",
    result: "win",
    award: "1st Place · Tech for Social Impact · $2.5K",
    project: "CleanLabel",
    pitch: "Point your phone at a food label, find out what's harmful in it.",
    bullets: [
      "SwiftUI iOS scanner reading ingredient lists with Apple's Vision OCR.",
      "Express.js + PostgreSQL backend that flags harmful ingredients.",
    ],
    stack: ["SwiftUI", "Vision", "Express.js", "PostgreSQL"],
  },
  {
    id: "hackprinceton24",
    event: "HackPrinceton Fall 2024",
    host: "Princeton University",
    when: "Nov 2024",
    result: "win",
    award: "Best Use of OnChainKit (Coinbase)",
    project: "chama",
    pitch: "Hover a spike on a market chart and see the news that caused it.",
    bullets: [
      "Financial-literacy app linking price moves to the headlines behind them.",
      "Built the UI and the hover-driven market chart.",
    ],
    stack: ["React", "OnChainKit", "Charts"],
    links: [{ label: "GitHub", href: "https://github.com/bipuladk60/chama" }],
  },
  {
    id: "hacknyu25",
    event: "HackNYU 2025",
    host: "New York University",
    when: "Feb 2025",
    result: "participant",
    award: "Competed",
    project: "SwipedIn",
    pitch: "Hiring as a swipe: job seekers and recruiters match when both swipe right, then an AI agent runs the first screen.",
    bullets: [
      "Built the login flow and the profile and settings pages.",
      "React Native app on a Node.js/Express backend with MongoDB Atlas and the Gemini API.",
    ],
    stack: ["React Native", "Node.js", "Express", "MongoDB Atlas", "Gemini"],
    links: [
      { label: "GitHub", href: "https://github.com/rupaut98/swipedin" },
      { label: "swipedin.co", href: "https://www.swipedin.co" },
    ],
  },
  {
    id: "hacklytics25",
    event: "Hacklytics 2025",
    host: "Georgia Tech",
    when: "Feb 2025",
    result: "participant",
    award: "Competed",
    project: "DrugLytics",
    pitch: "Check drug interaction and allergy risk, then watch a narrated 3D video explaining why.",
    bullets: [
      "Came up with the idea and worked on the interaction pipeline over DrugBank's 300K+ drug-pair dataset.",
      "Generated 3D molecule videos with RDKit and Manim, cached in Cloudflare R2.",
    ],
    stack: ["Python", "Flask", "MongoDB Atlas", "AWS EC2", "RDKit", "Manim"],
    links: [{ label: "Devpost", href: "https://devpost.com/software/druglytics" }],
  },
  {
    id: "hatch25",
    event: "Hatchathon 2025",
    host: "University of Southern Mississippi",
    when: "Nov 2025",
    result: "win",
    award: "1st Place · AI for Workforce Automation",
    project: "HIPAApotamus",
    pitch: "HIPAA Business Associate Agreements, generated, e-signed, tracked and defended.",
    bullets: [
      "Proof of concept with the Mississippi Department of Health through the Mississippi AI Innovation Hub; the team is named on its.ms.gov.",
      "AWS infrastructure as code with CDK, e-signatures with a SHA-256 hash per signing event, and expiry reminders.",
      "An LLM assistant on GPT-4o and Gemini grounded in live agreement and audit data.",
    ],
    stack: ["Next.js", "TypeScript", "AWS CDK", "DynamoDB", "GPT-4o"],
    links: [{ label: "MS ITS feature", href: "https://www.its.ms.gov/services/ai-innovation-student-teams" }],
  },
  {
    id: "shellhacks26",
    event: "ShellHacks 2026",
    host: "Florida International University",
    when: "Sept 2026",
    result: "win",
    award: "3rd Place · Sperry Tech GridLock Challenge",
    project: "MrGridy",
    pitch: "See where two power companies' work collides, before they build and before the storm hits.",
    bullets: [
      "Map of both utilities' construction plans plus a hurricane replay mode.",
      "Worked on the UI redesign: map-first layout, side dock, on-map legends.",
    ],
    stack: ["Next.js", "MapLibre", "deck.gl", "Python"],
  },
];

export const research = {
  title: "Predicting COPD Risk from PFAS Exposure Using Machine Learning",
  venue: "Undergraduate Symposium for Research & Creative Activity · USM",
  when: "Apr 2025",
  award: "2nd Place · Best Biomedical Research Presentation",
  question: "Do \"forever chemicals\" (PFAS) in the blood raise the risk of COPD, and can ML predict who is at risk?",
  context: "COPD was the 4th leading cause of death worldwide in 2021. PFAS persist in cookware, packaging, firefighting foam and the human body.",
  data: "NHANES survey cycles 2007–2018, adults 20+. Compounds: PFOA, PFOS, PFNA, PFHxS. Covariates: smoking, BMI, age, serum albumin, medical history, socioeconomic factors, gender.",
  pipeline: [
    { step: "Combine", detail: "Merged NHANES cycles 2007–2018, adults 20+, handled missing values." },
    { step: "Transform", detail: "Log-transformed skewed PFAS levels, normalized covariates." },
    { step: "Balance", detail: "SMOTE to a balanced set: 3,000 COPD vs 3,000 non-COPD." },
    { step: "Infer", detail: "Logistic regression, correlation and mediation analysis." },
    { step: "Predict", detail: "Gradient Boosting vs Logistic Regression vs Random Forest." },
  ],
  findings: [
    { label: "Higher COPD odds with PFOA & PFOS", value: "7–23%" },
    { label: "Protective mediation by serum albumin", value: "8–23%" },
  ],
  models: [
    { name: "Gradient Boosting", accuracy: 82.0 },
    { name: "Logistic Regression", accuracy: 73.8 },
    { name: "Random Forest", accuracy: 70.2 },
  ],
  thanks: "Mentored by Dr. Felix Twum, Dr. Jennifer Lemacks and Ms. Sermin Aras. Supported by Mississippi INBRE (NIGMS, NIH grant P20GM103476).",
};

export const mlWork = [
  {
    title: "Heart Disease Prediction",
    when: "2026",
    detail: "scikit-learn pipeline on the Cleveland dataset; a tuned Logistic Regression beat Random Forest and Gradient Boosting.",
    metrics: [
      { label: "ROC-AUC (test)", value: "0.961" },
      { label: "Recall", value: "0.929" },
    ],
    stack: ["Python", "scikit-learn", "pandas"],
  },
  {
    title: "RNN Music Generation",
    when: "Jul 2024",
    detail: "LSTM model in TensorFlow/Keras that composes music in ABC notation.",
    metrics: [],
    stack: ["TensorFlow", "Keras"],
  },
];

// Featured game: Warmer is live; it is the one to lead with.
export const games = [
  {
    title: "Warmer",
    status: "Live",
    tagline: "A daily geography game that teaches, not just tests.",
    href: "https://warmergames.com",
    howItWorks: "Guess a country. Every guess glows warmer or colder depending on how close it is to the hidden answer, on a globe you can spin.",
    bullets: [
      "Daily puzzle with streaks and a shareable result grid, plus unlimited practice.",
      "Real-time multiplayer races for up to 8 players over Supabase Realtime.",
      "A 'learn about this country' card after every solve, so each game teaches something.",
      "Handled SEO and distribution myself and reached 300 visitors in the first week.",
    ],
    stack: ["Next.js", "TypeScript", "d3-geo", "Supabase", "Vercel"],
  },
];

export type Project = {
  id: string;
  title: string;
  kind: string;
  tagline: string;
  bullets: string[];
  stack: string[];
  href?: string;
  accent: "systems" | "ml" | "web" | "tool";
};

export const projects: Project[] = [
  {
    id: "openbook",
    title: "openbook",
    kind: "C++20 · Systems",
    tagline: "A limit order book and matching engine, benchmarked against std::map.",
    bullets: [
      "Array-indexed price levels with an occupancy bitmap; O(1) cancel.",
      "About 2x faster than a std::map baseline at p50 in a wide price band.",
      "Differential-tested on 40,000 randomized operations against a reference book.",
    ],
    stack: ["C++20", "CMake", "GoogleTest"],
    href: "https://github.com/bipuladk60/openbook",
    accent: "systems",
  },
  {
    id: "mhd",
    title: "MHD Connect",
    kind: "PWA · Production",
    tagline: "The conference app for Mississippi Health Disparities 2026.",
    bullets: [
      "Live agenda, speakers, attendee profiles and announcements for 400+ attendees.",
      "Admin roles so staff edit the agenda live, plus automatic badge printing from Firestore.",
    ],
    stack: ["Next.js", "Firebase", "Vercel", "Python"],
    accent: "web",
  },
  {
    id: "typetrie",
    title: "TypeTrie",
    kind: "C++ · Data Structures",
    tagline: "Popularity-aware autocomplete engine.",
    bullets: [
      "Trie with O(L) prefix search and insertion.",
      "Frequency tracking with hash maps to rank suggestions by popularity.",
    ],
    stack: ["C++"],
    accent: "systems",
  },
];

export const skills = [
  { group: "Languages", items: ["TypeScript", "JavaScript", "Python", "C++", "SQL", "Dart", "Java", "C#", "Swift"] },
  { group: "Frontend", items: ["React", "Next.js", "Flutter", "Tailwind CSS"] },
  { group: "Backend", items: ["Node.js", "Flask", "Django", "FastAPI", "Express", "REST APIs", "Zod"] },
  { group: "Cloud & Data", items: ["AWS", "Firebase", "PostgreSQL", "MongoDB", "Supabase", "Docker"] },
  { group: "ML & AI", items: ["scikit-learn", "pandas", "NumPy", "TensorFlow", "GPT-4o", "Gemini"] },
  { group: "Tools", items: ["Git", "GitHub Actions", "Claude Code", "Cursor", "Figma", "Vercel"] },
];

export const honors = [
  { title: "3rd Place · Golden Eagle Idea Pitch (CleanLabel)", org: "University of Southern Mississippi", when: "2024" },
  { title: "Student Employee of the Year · Professionalism & Work Ethic", org: "University of Southern Mississippi", when: "Apr 2025" },
  { title: "2nd Place · Best Biomedical Research Presentation", org: "USM Undergraduate Symposium", when: "Apr 2025" },
  { title: "An Introduction to Python for Data Science", org: "National Institutes of Health (SCHARE)", when: "2025" },
];
