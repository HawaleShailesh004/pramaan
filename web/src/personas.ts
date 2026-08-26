export const DEGREES = [{ code: 1, label: "B.Tech" }] as const;

export const POLICY_TEMPLATES = [
  { id: "std", label: "7.0 B.Tech 2026", minCgpa: 7, degree: 1, maxYear: 2026 },
  { id: "high", label: "8.0 B.Tech 2026", minCgpa: 8, degree: 1, maxYear: 2026 },
  { id: "prev", label: "7.5 B.Tech 2025", minCgpa: 7.5, degree: 1, maxYear: 2025 },
] as const;

export const DEMO_CSV = `alias,degree,cgpaBps,year
meera,1,740,2026
kabir,1,620,2026
arya,1,810,2026
`;

export const STUDENTS = {
  meera: {
    id: "meera" as const,
    name: "Meera",
    cgpa: 7.4,
    cgpaBps: 740,
    degree: 1,
    degreeLabel: "B.Tech",
    year: 2026,
    blurb: "Pass at 7.0. Fail at 8.0. Same leaf, different question.",
  },
  kabir: {
    id: "kabir" as const,
    name: "Kabir",
    cgpa: 6.2,
    cgpaBps: 620,
    degree: 1,
    degreeLabel: "B.Tech",
    year: 2026,
    blurb: "Real leaf. Below a 7.0 bar. Revocable on correction.",
  },
  arya: {
    id: "arya" as const,
    name: "Arya",
    cgpa: 8.1,
    cgpaBps: 810,
    degree: 1,
    degreeLabel: "B.Tech",
    year: 2026,
    blurb: "Clears 8.0 when Meera cannot.",
  },
  fake: {
    id: "fake" as const,
    name: "Commercial University Ltd.",
    cgpa: 9.9,
    cgpaBps: 990,
    degree: 1,
    degreeLabel: "B.Tech",
    year: 2026,
    blurb: "Letterhead is not a root.",
  },
} as const;

export type StudentId = keyof typeof STUDENTS;

export const POLICY_DEFAULT = {
  minCgpa: 7,
  minCgpaBps: 700,
  degree: 1,
  maxYear: 2026,
} as const;

export const NAD_CONTRAST = [
  { job: "Share eligibility", nad: "Whole document", pramaan: "Predicate" },
  { job: "Trust issuer", nad: "Logo, letterhead", pramaan: "Root in allow-list" },
  { job: "Stop bait-and-switch", nad: "Recruiter asks more after PDF", pramaan: "Policy hash in proof" },
  { job: "Revoke on correction", nad: "Hard", pramaan: "Revocation set on chain" },
] as const;
