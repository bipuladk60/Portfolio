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
  // 400+ MHD Connect attendees + 2,224 Warmer visitors (last 30 days only, so a floor, not a total).
  { value: 2600, suffix: "+", label: "Users · MHD Connect + Warmer" },
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
    summary: "Full-stack and IT role supporting the center's web platforms, research data and community programs.",
    bullets: [
      "Maintained the center's two WordPress sites and provided day-to-day IT support for staff.",
      "Cleaned and sanitized census datasets for the center's research team.",
      "Contributed to the center's PFAS research study and presented the findings.",
      "Proposed and built MHD Connect, the conference app for Mississippi Health Disparities 2026, used by 400+ attendees.",
      "Represented the center at community outreach events.",
    ],
    stack: ["Next.js", "TypeScript", "Firebase", "WordPress", "Python", "pandas"],
    concurrent: true,
  },
  {
    id: "cadence",
    company: "CadenceAI",
    role: "Software Engineering Intern",
    when: "Mar 2025 – Aug 2025",
    where: "Remote",
    summary: "Contributed to an AI product across backend services and the React frontend.",
    bullets: [
      "Developed a backend microservice with FastAPI and RabbitMQ for asynchronous, event-driven processing.",
      "Built React and TypeScript interfaces from Figma designs, integrating Auth0 authentication and Azure messaging and storage.",
    ],
    stack: ["FastAPI", "RabbitMQ", "React", "TypeScript", "Auth0", "Azure"],
  },
  {
    id: "illumibot",
    company: "Illumibot / ArroyoDev",
    role: "Software Engineer Associate",
    when: "Sept 2025 – May 2026",
    where: "Remote",
    summary: "Engineer on the company's Flutter mobile app and internal shipping and inventory platform.",
    bullets: [
      "Developed features for the Flutter mobile app and a Next.js shipping and inventory platform integrating Shopify, Easyship and Square.",
      "Gathered customer feedback, translated it into scoped tickets and shipped the fixes.",
      "Reported progress and blockers in weekly team stand-ups.",
      "Shipped all work through code review with senior engineers and peers, and reviewed teammates' pull requests.",
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
    links: [{ label: "GitHub", href: "https://github.com/rupaut98/swipedin" }],
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
  // Done while working at Gulf South; owner calls it his own project there.
  where: "Gulf South Center for Community Engaged Health Research",
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

// Stochastic, agent-based toy model. Source: github.com/bipuladk60/infectious-disease-simulation (simulation.ipynb).
// The parameters below are copied from the notebook; the site re-runs the model live in the browser.
export const diseaseSim = {
  title: "Stochastic Disease Transmission",
  when: "Apr 2024",
  href: "https://github.com/bipuladk60/infectious-disease-simulation",
  pitch: "An agent-based toy model of how an infection moves through a crowd: each dot has its own immunity, viral load and luck.",
  bullets: [
    "Recovery time drawn from a Beta(2, 5) distribution scaled to 14–28 days, so immunity varies person to person.",
    "Viral load follows a discrete curve that peaks around days 6–7.",
    "Transmission is a weighted coin flip: probability exp(−distance / viral load), so close contact with a high load spreads fastest.",
    "Recovered people can be reinfected; anyone still sick after day 21 dies.",
  ],
  params: {
    population: 100,
    initialInfected: 5,
    size: 250,
    betaAlpha: 2,
    betaBeta: 5,
    recoveryMin: 14,
    recoveryMax: 28,
    deathAfterDay: 21,
    viralLoad: [1, 3, 4, 5, 7, 9, 9, 8, 8, 7, 6, 5, 5, 4, 3, 3, 3, 3, 3, 2, 2],
  },
  stack: ["Python", "NumPy", "SciPy", "Matplotlib"],
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
    href: "https://github.com/bipuladk60/RNN_Music_Generator",
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
      "Handled SEO and distribution myself: 300 visitors in the first week, 2,224 in the last 30 days, and an average Google position of 6.2.",
    ],
    // Vercel Analytics, production, last 30 days (Sep 12 – Oct 11, 2026), screenshot from the owner.
    analytics: {
      period: "Last 30 days",
      source: "Vercel Analytics",
      visitors: 2224,
      visitorsGrowth: "+140%",
      pageViews: 4693,
      pageViewsGrowth: "+122%",
      peak: { day: "Oct 8", visitors: 136 },
      // Daily visitors Sep 12 → Oct 11, traced by eye from the analytics chart (approximate, for the sparkline only).
      daily: [34, 33, 51, 59, 100, 72, 64, 49, 39, 86, 70, 77, 68, 77, 59, 63, 63, 83, 80, 83, 89, 62, 80, 102, 109, 95, 136, 80, 87, 92],
      dailyStart: "Sep 12",
      dailyEnd: "Oct 11",
    },
    // Google Search Console, web search, homepage only, since launch (Jul 21 – Oct 9, 2026), screenshot from the owner.
    search: {
      source: "Google Search Console",
      period: "Since launch · Jul 21 – Oct 9, 2026",
      scope: "Homepage, web search",
      clicks: "1.1K",
      impressions: "15.5K",
      ctr: "7.1%",
      avgPosition: "6.2",
      trend: "Clicks grew from near zero at launch to roughly 30–40 a day by October.",
    },
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
