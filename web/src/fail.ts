export type PramaanFail =
  | "cutoff"
  | "degree"
  | "year"
  | "unissued"
  | "revoked"
  | "cohort"
  | "network"
  | "other";

export function classifyPramaan(message: string): PramaanFail {
  const m = message.toLowerCase();
  if (m.includes("below cutoff")) return "cutoff";
  if (m.includes("degree")) return "degree";
  if (m.includes("year") && m.includes("range")) return "year";
  if (m.includes("cohort expired")) return "cohort";
  if (m.includes("revoked")) return "revoked";
  if (m.includes("not issued") || m.includes("fake") || m.includes("award not issued"))
    return "unissued";
  if (m.includes("failed to fetch") || m.includes("not deployed")) return "network";
  return "other";
}
