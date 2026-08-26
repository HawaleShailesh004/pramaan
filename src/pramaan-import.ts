import { AWARDS, DEMO_CSV, PRAMAAN_SECRETS, type AwardPersona } from "./pramaan-keys";

export type CsvRow = { alias: string; degree: number; cgpaBps: number; year: number };

export function parseAwardCsv(text: string): CsvRow[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const aliasIdx = header.indexOf("alias");
  const degreeIdx = header.indexOf("degree");
  const cgpaIdx = header.findIndex((h) => h === "cgpabps" || h === "cgpa_bps");
  const yearIdx = header.indexOf("year");
  if (aliasIdx < 0 || degreeIdx < 0 || cgpaIdx < 0 || yearIdx < 0) {
    throw new Error("CSV needs alias,degree,cgpaBps,year");
  }
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    return {
      alias: cols[aliasIdx].toLowerCase(),
      degree: Number(cols[degreeIdx]),
      cgpaBps: Number(cols[cgpaIdx]),
      year: Number(cols[yearIdx]),
    };
  });
}

export function csvPersonas(rows: CsvRow[]): AwardPersona[] {
  const out: AwardPersona[] = [];
  for (const row of rows) {
    const p = row.alias as AwardPersona;
    if (!(p in AWARDS)) {
      throw new Error(`Unknown alias ${row.alias} — demo cohort is meera,kabir,arya`);
    }
    const expected = AWARDS[p];
    if (
      expected.cgpaBps !== row.cgpaBps ||
      expected.degree !== row.degree ||
      expected.year !== row.year
    ) {
      throw new Error(`Row ${row.alias} does not match demo fixture`);
    }
    if (!out.includes(p)) out.push(p);
  }
  return out;
}

export { DEMO_CSV, AWARDS, PRAMAAN_SECRETS };
