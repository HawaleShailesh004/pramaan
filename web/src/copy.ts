export const COPY = {
  home: {
    kicker: "Brainwave 2026 · Midnight Track · sibling of Silent Bell",
    title: "Pramaan",
    tagline:
      "Prove the cutoff. Keep the marksheet. A circuit proves an issued academic leaf meets a recruiter’s policy. The ledger learns pass/fail and the policy hash. It never learns CGPA.",
    fileVsFact:
      "DigiLocker shares the file. Photoshop still exists. We share a fact bound to the recruiter’s question.",
  },
  issuer: {
    title: "USAR awards",
    lead: "Meera 7.40 and Kabir 6.20 as integer basis points. Names never enter Compact.",
    success: "Leaves inserted. DigiLocker would have opened a file. We did not.",
  },
  meera: {
    title: "My leaf",
    lead: "Private CGPA on this device. Public rail shows only the issuer root.",
    prove: "Prove for this policy",
    noPolicy: "Set a cutoff on the recruiter screen first — the policy hash travels here.",
    success: (cutoff: string) =>
      `USAR attests you clear ${cutoff} B.Tech 2026. Your 7.4 stayed on the phone.`,
  },
  recruiter: {
    title: "Cutoff",
    empty: "Set a bar. Don’t collect a drawer of PDFs.",
    lead: "We asked a question. We did not ask for a file.",
    policyLabel: "Live policy hash",
    meeraPass: (cutoff: string) =>
      `USAR attests you clear ${cutoff} B.Tech 2026. Your 7.4 stayed on the phone.`,
    meeraFailHigh:
      "The leaf is real. The bar moved. That is not a hack; that is the point.",
  },
  fake: {
    title: "Commercial University Ltd.",
    lead: "A 9.9 CGPA from an untrusted issuer. The verifier allow-list is the USAR root. This leaf was never inserted.",
    cta: "Prove 9.9 against USAR",
  },
  demo: {
    title: "One-click cast",
    lead: "120 seconds for judges. Issue cohort → slider 7.0 → slider 8.0 → fake issuer.",
  },
} as const;
