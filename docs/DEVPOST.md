# Pramaan — Devpost submission (paste-ready)

**Project name:** Pramaan  
**Tagline:** Prove the cutoff. Keep the marksheet.

**Description (≤200 characters):**  
Pramaan lets students prove they meet a recruiter’s CGPA bar on Midnight — without mailing marksheets. Policy-locked Compact proofs; the ledger learns pass/fail and the policy hash, never CGPA.

**Built with:** midnight compact midnight.js typescript react vite express docker merkle-tree zero-knowledge campus placements proof-server

**Repo:** [https://github.com/HawaleShailesh004/pramaan](https://github.com/HawaleShailesh004/pramaan)

---

## Inspiration

Placement week. Forty companies. Forty marksheet attachments — or one predicate per policy.

DigiLocker, when it works, still **opens the file**. NAD has coverage holes. Fake universities still print letterheads. Recruiters do not need “Operating Systems: 31/100.” They need: trusted issuer, CGPA ≥ 7.0, B.Tech, year ≤ 2026.

Pramaan is the **predicate API** on top of issuer truth — not another PDF vault.

## What it does

| Role | Action |
| --- | --- |
| **USAR Registrar** | Publishes hashed award leaves (Meera 7.4, Kabir 6.2) — not PDFs |
| **Student** | Holds private CGPA; proves against recruiter policy |
| **Recruiter** | Sets cutoff slider → live **policy hash**; sees pass/fail chip |
| **Fake university** | 9.9 CGPA from untrusted root → fails membership |

**The theatrical beat:** same student, same leaf, slider moved from 7.0 to 8.0 — proof **fails**. You did not fake a score. You changed the question.

## How we built it

- **Midnight Compact** — `provePolicy` circuit: Merkle membership + comparisons + policy hash disclosure
- **LEAF kit** (shared pattern with Silent Bell) — off-chain Merkle tree, on-chain root
- **Integer CGPA** — basis points (740 = 7.40), no floats in Compact
- **React + Vite** — recruiter slider as the product surface
- **Express API** — issue, prove, policy hash endpoints

## Private vs public

| Witness (phone) | Ledger |
| --- | --- |
| CGPA, degree, year | Award root |
| Student secret | Policy hash |
| | Tx success = pass |

## Try it

```bash
npm run setup && npm run api && npm run web
```

Open `#recruiter` — move the slider. Run `#demo` for one-click judge cast.

**Contract (Midnight Preview):**  
`34448964df7df052fa142ce6b3b3635a7f5613d1831323e3aae50d19f4c3179d`

## What's next

- Revocation set for corrected awards
- Recruiter org accounts + policy templates (“7.0 CSE 2026”)
- L1 band disclosure (optional); default stays boolean L0
- NAD-shaped import: hash awards, never become another depository

Not affiliated with NAD, UGC, or GGSIPU — demo issuer for hackathon.
