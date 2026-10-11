// Single source of truth for every fact on the site.
// Sourced from Bipul's newest resumes + master resume + project READMEs.
// RULE: never add a number here that cannot be traced to a real source.

export const profile = {
  name: "Bipul Adhikari",
  handle: "bipuladk60",
  role: "Software Engineer",
  tagline: "Full-stack engineer who ships things people actually use.",
  origin: "Kathmandu, Nepal",
  base: "Hattiesburg, Mississippi",
  status: "CS & Math senior · graduating May 2027 · open to new-grad SWE roles",
  email: "bipul.adhikari.2003@gmail.com",
  links: {
    github: "https://github.com/bipuladk60",
    linkedin: "https://www.linkedin.com/in/bipul-adhikari",
    warmer: "https://warmergames.com",
  },
  about: [
    "I grew up in Kathmandu and came to the University of Southern Mississippi to study Computer Science and Mathematics.",
    "Since then I've led a four-engineer team on a shipping platform, replaced a ~$20K conference tool with an app I proposed and built, presented ML research on forever chemicals and lung disease, and won four hackathon and pitch awards.",
    "On weekends I build games: a Ludo board drawn entirely in code under a Nepali peepal tree, and a daily geography game that teaches instead of just testing.",
  ],
};

export const stats = [
  { value: 4, suffix: "", label: "Hackathon & pitch wins" },
  { value: 6, suffix: "", label: "Hackathons competed" },
  { value: 400, suffix: "+", label: "Conference attendees served" },
  { value: 4, suffix: "", label: "Engineers led" },
  { value: 82, suffix: "%", label: "Best model accuracy (PFAS study)" },
  { value: 11, suffix: " KB", label: "Whole indie game, gzipped" },
];

export const education = [
  {
    school: "University of Southern Mississippi",
    degree: "B.S. Computer Science & Mathematics",
    when: "Expected May 2027",
    where: "Hattiesburg, MS",
    detail: "GPA 3.63 · Coursework: Data Structures & Algorithms, Operating Systems, Database Systems, Artificial Intelligence, Secure Software Development, Computer Networking, Probability & Mathematical Statistics",
  },
  {
    school: "Trinity International SS & College",
    degree: "Higher Secondary, Computer Science",
    when: "2022",
    where: "Kathmandu, Nepal",
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
};

export const experience: Experience[] = [
  {
    id: "illumibot",
    company: "Illumibot / ArroyoDev",
    role: "Software Engineer Associate",
    when: "Sept 2025 – May 2026",
    where: "Remote",
    summary: "Led a 4-engineer team inside a 10-engineer org building an internal shipping & inventory platform, plus the company's Flutter mobile app.",
    bullets: [
      "Led a team of 4 engineers to build an internal shipping and inventory platform in TypeScript, Next.js and Node.js connecting Shopify, Easyship, Square and Mailchimp for ops staff.",
      "Automated the fulfillment workflow: a sync API that pushes shipments back to Shopify and Square, rules that auto-apply Easyship shipping options, and SMTP order emails with SPF, DKIM and DMARC configured.",
      "Built sandbox test endpoints for shipments, emails and Square orders so engineers could test integrations without touching live orders; removed broken deploy workflows from GitHub Actions CI.",
      "Added schemas to the shared Zod package that generates TypeScript and Dart SDKs, keeping data types in sync across the web app, Firebase Cloud Functions and the Flutter mobile app.",
      "Built the Illumibot mobile app in Flutter/Dart for iOS and Android from one shared codebase, along with the main company website.",
    ],
    stack: ["TypeScript", "Next.js", "Node.js", "Flutter", "Dart", "Firebase", "Zod", "Shopify API", "Easyship", "Square", "GitHub Actions"],
  },
  {
    id: "gulfsouth",
    company: "Gulf South Center for Community Engaged Health Research",
    role: "Full Stack Developer",
    when: "Aug 2024 – Aug 2026",
    where: "Hattiesburg, MS",
    summary: "Proposed and shipped MHD Connect, the app for Mississippi's largest public health conference, plus research sites and data tooling.",
    bullets: [
      "Proposed and built MHD Connect, a progressive web app that replaced a ~$20K conference management tool for Mississippi Health Disparities 2026, the state's largest public health conference.",
      "Took over the main development work partway through the build and delivered live agenda, speaker lists, profiles and announcements to 400+ attendees.",
      "Ran the production deployment on Firebase and Vercel: DNS, TLS for Service Worker registration, and performance monitoring.",
      "Built a Python daemon that pulls attendees from Firestore and auto-prints name badges in batches for participants and speakers.",
      "Implemented Firebase custom-claim admin roles so staff edit the live agenda and manage attendees without a separate CMS.",
      "Designed Zod schemas to enforce type-safe contracts against the Firebase backend, catching mismatched fields at build time.",
      "Built research websites with custom forms and content workflows for non-technical research staff.",
    ],
    stack: ["Next.js", "React", "TypeScript", "Firebase", "Vercel", "Python", "Zod", "WordPress"],
  },
  {
    id: "cadence",
    company: "CadenceAI",
    role: "Software Engineering Intern",
    when: "Mar 2025 – Aug 2025",
    where: "Remote",
    summary: "Backend microservice and React frontend work on an AI product.",
    bullets: [
      "Engineered a backend microservice with FastAPI and RabbitMQ for asynchronous, event-driven processing.",
      "Built a React/TypeScript frontend from Figma designs, secured with Auth0.",
      "Used Azure Communication Services for messaging and Azure Blob Storage for file storage; managed data fetching with TanStack Query and Zod.",
    ],
    stack: ["FastAPI", "RabbitMQ", "React", "TypeScript", "Auth0", "Azure", "TanStack Query"],
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
    award: "1st Place · Tech for Social Impact · $2.5K · 50+ teams",
    project: "CleanLabel",
    pitch: "Point your phone at a food label, find out what's harmful in it.",
    bullets: [
      "SwiftUI iOS scanner that reads ingredient lists with Apple's Vision OCR.",
      "Express.js + PostgreSQL backend that flags harmful ingredients.",
      "React + Tailwind landing page deployed on Azure.",
    ],
    stack: ["SwiftUI", "Vision", "Express.js", "PostgreSQL", "React", "Azure"],
  },
  {
    id: "goldeneagle24",
    event: "Golden Eagle Idea Pitch 2024",
    host: "University of Southern Mississippi",
    when: "2024",
    result: "win",
    award: "3rd Place · Pitch Competition",
    project: "CleanLabel",
    pitch: "Took CleanLabel from hackathon prototype to a business pitch.",
    bullets: [
      "Pitched market, users and roadmap for CleanLabel to a panel of judges.",
    ],
    stack: ["Pitching", "Product"],
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
      "Financial-literacy platform linking price moves to the headlines behind them.",
      "Built the UI and the dynamic, hover-driven market chart.",
      "In-app crypto purchase flow through Coinbase OnChainKit.",
    ],
    stack: ["React", "OnChainKit", "Charts", "LlamaIndex"],
    links: [{ label: "GitHub", href: "https://github.com/bipuladk60/chama" }],
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
      "Came up with the idea and led the coding, working from DrugBank's 300K+ drug-pair dataset.",
      "Built the interaction pipeline in Python/Flask and sped up searches with MongoDB Atlas indexing; deployed on AWS EC2.",
      "Turned SMILES strings into 3D molecules with RDKit and narrated videos with Manim, cached in Cloudflare R2 so repeat searches load instantly.",
    ],
    stack: ["Python", "Flask", "MongoDB Atlas", "AWS EC2", "RDKit", "Manim", "Cloudflare R2", "OpenAI"],
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
      "Proof of concept with the Mississippi Department of Health through the Mississippi AI Innovation Hub; team named on its.ms.gov.",
      "Wrote 107 of the 4-person team's 116 commits.",
      "All AWS infrastructure as code with CDK: DynamoDB, S3, Cognito, KMS, EventBridge, SES; CI lints, type-checks and builds every push.",
      "E-signature with a SHA-256 hash per signing event, plus reminders 90, 30 and 7 days before expiry.",
      "LLM assistant on GPT-4o and Gemini streaming answers grounded in live agreement, vendor and audit-log data.",
    ],
    stack: ["Next.js", "TypeScript", "AWS CDK", "DynamoDB", "Cognito", "KMS", "SES", "GPT-4o", "Gemini"],
    links: [{ label: "MS ITS feature", href: "https://www.its.ms.gov/services/ai-innovation-student-teams" }],
  },
  {
    id: "shellhacks26",
    event: "ShellHacks 2026",
    host: "Florida International University",
    when: "Sept 2026",
    result: "participant",
    award: "Competed · Sperry Tech GridLock Challenge",
    project: "MrGridy",
    pitch: "See where two power companies' work collides, before they build and before the storm hits.",
    bullets: [
      "Plan mode maps both utilities' public construction plans and ranks coordination opportunities.",
      "Response mode replays real hurricanes (Helene 2024 featured) with simulated transmission damage and shared staging yards.",
      "Led the full UI redesign: dark dock, map-first layout, KPI tiles, on-map legends.",
    ],
    stack: ["Next.js", "MapLibre", "deck.gl", "Python", "TypeScript"],
  },
];

export const research = {
  title: "Predicting COPD Risk from PFAS Exposure Using Machine Learning",
  venue: "Undergraduate Symposium for Research & Creative Activity · USM",
  when: "Apr 2025",
  award: "2nd Place · Best Biomedical Research Presentation",
  question: "Do \"forever chemicals\" (PFAS) in the blood raise the risk of chronic obstructive pulmonary disease, and can ML predict who is at risk?",
  context: "COPD was the 4th leading cause of death worldwide in 2021. PFAS persist in cookware, packaging, firefighting foam and the human body.",
  data: "NHANES survey cycles 2007–2018, adults 20+. Compounds: PFOA, PFOS, PFNA, PFHxS. Covariates: smoking, BMI, age, serum albumin, medical history, socioeconomic factors, gender.",
  pipeline: [
    { step: "Combine", detail: "Merged six NHANES cycles, filtered to adults 20+, handled missing values." },
    { step: "Transform", detail: "Log-transformed skewed PFAS levels, normalized covariates." },
    { step: "Balance", detail: "SMOTE to a balanced set: 3,000 COPD vs 3,000 non-COPD." },
    { step: "Infer", detail: "Logistic regression, point-biserial correlation, mediation analysis." },
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
    detail: "Leak-proof scikit-learn pipeline (ColumnTransformer + GridSearchCV) on the Cleveland dataset. Tuned Logistic Regression beat Random Forest and Gradient Boosting.",
    metrics: [
      { label: "ROC-AUC (test)", value: "0.961" },
      { label: "Recall", value: "0.929" },
      { label: "CV ROC-AUC", value: "0.911" },
    ],
    stack: ["Python", "scikit-learn", "pandas"],
  },
  {
    title: "RNN Music Generation",
    when: "Jul 2024",
    detail: "LSTM sequence model in TensorFlow/Keras that composes music in ABC notation, with Comet.ml experiment tracking.",
    metrics: [],
    stack: ["TensorFlow", "Keras", "Comet.ml"],
  },
  {
    title: "Backpropagation, Explained",
    when: "2026",
    detail: "A built-from-scratch slide deck walking through the chain rule and gradient flow, with programmatically generated figures.",
    metrics: [],
    stack: ["Python", "Node.js"],
  },
];

export const indieGame = {
  title: "Chautari Ludo",
  tagline: "Ludo at dusk, under a peepal tree, with chiya and a pot of rupees on the line.",
  repo: "https://github.com/bipuladk60/Chautari-Ludo",
  story: "A chautari is the brick platform under a peepal tree where villagers in Nepal rest in the evening. This game puts you on one, seated at the board, with three neighbours betting on the match.",
  facts: [
    { label: "Size", value: "~11 KB gzipped" },
    { label: "Images used", value: "0" },
    { label: "Seats", value: "4 · bots fill gaps" },
    { label: "Online", value: "4-letter room codes" },
  ],
  features: [
    "Every pixel drawn with Canvas 2D: canopy, dusk sky, hills, a looping bus, villagers who react.",
    "Seated first-person camera: the board turns a quarter per seat so every player sits facing their own home column.",
    "Chiya ra paisa economy: a betting pot, a tea shop, sip-to-re-throw, goodwill.",
    "Synthesised sound, bubbles, screen shake and falling petals; no audio files.",
    "Authoritative Node + WebSocket server rolls every die and validates every move against the same pure rule engine the client uses.",
  ],
  stack: ["TypeScript", "Canvas 2D", "Vite", "Node.js", "WebSocket"],
};

export const games = [
  {
    title: "Warmer",
    tagline: "A daily geography game that teaches, not just tests.",
    href: "https://warmergames.com",
    bullets: [
      "Guess a country; every guess glows warmer or colder on a draggable d3-geo globe.",
      "Daily puzzle with streaks and shareable emoji grids, plus unlimited practice.",
      "Real-time multiplayer races for up to 8 players over Supabase Realtime.",
      "A 'learn about this country' card after every solve; handled SEO and distribution myself and reached 300 visitors in week one.",
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
      "Array-indexed price levels with an occupancy bitmap and pooled order arena; O(1) cancel.",
      "2.07x faster than a std::map baseline at p50 in a ±1024-tick band; per-op costs of 15–35 ns.",
      "Differential-tested on 40,000 randomized operations against a reference book, comparing the full depth ladder after every op.",
      "Purpose-built batch-timing harness because the machine's clock tick is coarser than the operations being measured.",
    ],
    stack: ["C++20", "CMake", "GoogleTest", "CI"],
    href: "https://github.com/bipuladk60/openbook",
    accent: "systems",
  },
  {
    id: "clipfinder",
    title: "clipfinder",
    kind: "Python · Computer Vision",
    tagline: "Shazam for video: find which video a clip came from, and where.",
    bullets: [
      "Visual-only by design, so a trending song pasted over a scene can't cause a false match.",
      "Handles crops, 9:16 blur-fill, mirroring, captions and speed changes.",
      "Indexing four crop variants instead of guessing one took real-corpus accuracy from 32% to 77%.",
    ],
    stack: ["Python", "ffmpeg", "NumPy", "pHash"],
    accent: "ml",
  },
  {
    id: "mhd",
    title: "MHD Connect",
    kind: "PWA · Production",
    tagline: "The conference app for Mississippi Health Disparities 2026.",
    bullets: [
      "Live agenda, speakers, attendee profiles, announcements for 400+ attendees.",
      "Replaced a ~$20K conference management tool.",
      "Python badge-printing daemon fed from Firestore.",
    ],
    stack: ["Next.js", "Firebase", "Vercel", "Python"],
    accent: "web",
  },
  {
    id: "jobradar",
    title: "jobradar",
    kind: "Python · Automation",
    tagline: "Polls ~636 company job boards directly and emails me what's worth applying to.",
    bullets: [
      "Queries Greenhouse, Lever, Ashby, SmartRecruiters and Workday APIs directly, not aggregators.",
      "Scores postings against my resume and drops anything requiring citizenship or clearance.",
      "Score threshold of 80 picked from measuring 42K live postings, not guessed.",
    ],
    stack: ["Python", "REST APIs", "SMTP"],
    accent: "tool",
  },
  {
    id: "partysync",
    title: "PartySync",
    kind: "Node.js · Real-time",
    tagline: "Turn a room full of phones into one speaker system.",
    bullets: [
      "NTP-style clock sync over fast ping exchanges, keeping only the lowest-latency samples.",
      "Schedules playback for the same instant on every phone with the Web Audio API.",
      "Corrects drift twice a second by nudging playback rate.",
    ],
    stack: ["Node.js", "WebSocket", "Web Audio API"],
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
      "Interactive CLI with full CRUD for live dictionary management.",
    ],
    stack: ["C++"],
    accent: "systems",
  },
];

export const skills = [
  { group: "Languages", items: ["TypeScript", "JavaScript", "Python", "C++", "SQL", "Dart", "Java", "C#", "Swift"] },
  { group: "Frontend", items: ["React", "Next.js", "Flutter", "Tailwind CSS", "Vue"] },
  { group: "Backend", items: ["Node.js", "Flask", "Django", "FastAPI", "Express", "REST APIs", "WebSocket", "Zod"] },
  { group: "Cloud & Data", items: ["AWS CDK", "DynamoDB", "S3", "Cognito", "KMS", "EventBridge", "SES", "EC2", "Firebase", "PostgreSQL", "MongoDB", "Supabase", "Docker"] },
  { group: "ML & AI", items: ["scikit-learn", "pandas", "NumPy", "TensorFlow", "Keras", "GPT-4o", "Gemini", "RAG"] },
  { group: "Tools", items: ["Git", "GitHub Actions", "Claude Code", "Cursor", "Figma", "Vercel"] },
];

export const honors = [
  { title: "Student Employee of the Year · Professionalism & Work Ethic", org: "University of Southern Mississippi", when: "Apr 2025" },
  { title: "2nd Place · Best Biomedical Research Presentation", org: "USM Undergraduate Symposium", when: "Apr 2025" },
  { title: "An Introduction to Python for Data Science", org: "National Institutes of Health (SCHARE)", when: "2025" },
  { title: "Responsive Web Design · JavaScript Algorithms & Data Structures", org: "freeCodeCamp", when: "Oct 2023" },
];
