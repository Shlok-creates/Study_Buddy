export interface StreamCategory {
  category: string;
  options: string[];
  streams: string[];
}

export const STREAM_CATEGORIES: StreamCategory[] = [
  {
    category: "School (Foundation)",
    options: [
      "Class 6 (Foundation)",
      "Class 7 (Foundation)",
      "Class 8 (Foundation)",
      "Class 9 (Foundation)",
      "Class 10 (Board Prep)",
    ],
    streams: [
      "Class 6 (Foundation)",
      "Class 7 (Foundation)",
      "Class 8 (Foundation)",
      "Class 9 (Foundation)",
      "Class 10 (Board Prep)",
    ],
  },
  {
    category: "Senior Secondary (Class 11 - 12)",
    options: [
      "Class 11-12 Science (PCM/JEE)",
      "Class 11-12 Science (PCB/NEET)",
      "Class 11-12 Commerce",
      "Class 11-12 Arts/Humanities",
    ],
    streams: [
      "Class 11-12 Science (PCM/JEE)",
      "Class 11-12 Science (PCB/NEET)",
      "Class 11-12 Commerce",
      "Class 11-12 Arts/Humanities",
    ],
  },
  {
    category: "Undergrad Tech & Engineering",
    options: [
      "UG B.Tech/BE (CSE, AI/ML, ECE, Mechanical)",
    ],
    streams: [
      "UG B.Tech/BE (CSE, AI/ML, ECE, Mechanical)",
    ],
  },
  {
    category: "Undergrad Medical & Healthcare",
    options: [
      "UG MBBS, BDS, Pharmacy, Nursing, Biotechnology",
    ],
    streams: [
      "UG MBBS, BDS, Pharmacy, Nursing, Biotechnology",
    ],
  },
  {
    category: "Undergrad Management & Commerce",
    options: [
      "UG BBA, BMS, B.Com (Hons), IPMAT (IIM)",
    ],
    streams: [
      "UG BBA, BMS, B.Com (Hons), IPMAT (IIM)",
    ],
  },
  {
    category: "Undergrad Arts, Law & Design",
    options: [
      "BA, Design, BALLB",
    ],
    streams: [
      "BA, Design, BALLB",
    ],
  },
];

export const ALL_STREAMS: string[] = STREAM_CATEGORIES.flatMap((c) => c.options);
export const DEFAULT_STREAM = "Class 11-12 Science (PCM/JEE)";
