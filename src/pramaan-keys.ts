function labelSecret(label: string): Uint8Array {
  const out = new Uint8Array(32);
  const encoded = new TextEncoder().encode(label);
  out.set(encoded.subarray(0, 32));
  return out;
}

export const PRAMAAN_SECRETS = {
  usar: labelSecret("pramaan:usar:v1"),
  meera: labelSecret("pramaan:meera:v1"),
  kabir: labelSecret("pramaan:kabir:v1"),
  arya: labelSecret("pramaan:arya:v1"),
  fake: labelSecret("pramaan:fake:v1"),
} as const;

export type AwardPersona = "meera" | "kabir" | "arya" | "fake";

export const AWARDS: Record<AwardPersona, { cgpaBps: number; degree: number; year: number; label: string }> = {
  meera: { cgpaBps: 740, degree: 1, year: 2026, label: "Meera · 7.4 B.Tech 2026" },
  kabir: { cgpaBps: 620, degree: 1, year: 2026, label: "Kabir · 6.2 B.Tech 2026" },
  arya: { cgpaBps: 810, degree: 1, year: 2026, label: "Arya · 8.1 B.Tech 2026" },
  fake: { cgpaBps: 990, degree: 1, year: 2026, label: "Commercial University Ltd. · 9.9 (unissued)" },
};

/** Demo CSV cohort — alias maps to fixed persona secrets (no PDF storage). */
export const DEMO_CSV = `alias,degree,cgpaBps,year
meera,1,740,2026
kabir,1,620,2026
arya,1,810,2026
`;
