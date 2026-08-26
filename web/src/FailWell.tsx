import { type PramaanFail } from "./fail";

export function PramaanFailWell({ kind }: { kind: PramaanFail | null }) {
  if (!kind) return null;
  const copy = {
    cutoff: {
      title: "Below cutoff",
      body: "The leaf is real. The bar is higher. That is not a hack; that is the point.",
    },
    degree: {
      title: "Degree does not match",
      body: "This policy asked for a different programme. The marksheet never left the phone.",
    },
    year: {
      title: "Year out of range",
      body: "The award year does not satisfy this policy.",
    },
    unissued: {
      title: "Letterhead is not a root",
      body: "Commercial University Ltd. cannot write the USAR tree. Fancy CGPA does not open this issuer.",
    },
    revoked: {
      title: "Award revoked",
      body: "USAR corrected this leaf. Membership alone is not enough — the revocation set blocks it.",
    },
    cohort: {
      title: "Cohort expired",
      body: "The registrar rotated awardEpoch. A 2026 proof cannot replay in the 2027 placement season.",
    },
    network: {
      title: "Pramaan API unreachable",
      body: "Deploy the contract, then start the API on 8790.",
    },
    other: {
      title: "Proof did not land",
      body: "The circuit refused. We did not mint a fake gold chip.",
    },
  }[kind];
  return (
    <aside className={`failwell ${kind === "cutoff" ? "duplicate" : ""}`}>
      <h3>{copy.title}</h3>
      <p>{copy.body}</p>
    </aside>
  );
}
