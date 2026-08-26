# Pramaan — Devpost submission (paste-ready)

**Project name:** Pramaan  
**Tagline:** Prove the cutoff. Keep the marksheet.

**Description (≤200 characters):**  
Pramaan lets students prove they meet a recruiter’s CGPA bar on Midnight — without mailing marksheets. Policy-locked Compact proofs; the ledger learns pass/fail and the policy hash, never CGPA.

**Built with:**

```
midnight compact midnight.js typescript react vite express docker merkle-tree zero-knowledge campus placements proof-server policy-hash
```

**Repo:** [https://github.com/HawaleShailesh004/pramaan](https://github.com/HawaleShailesh004/pramaan)

**Contract (Midnight Preview):**  
`34448964df7df052fa142ce6b3b3635a7f5613d1831323e3aae50d19f4c3179d`

---

## Inspiration

Placement week. Forty companies. Forty marksheet attachments — or one predicate per policy.

DigiLocker, when it works, still **opens the file**. NAD has coverage holes. Fake universities still print letterheads. Recruiters do not need “Operating Systems: 31/100.” They need: trusted issuer, CGPA ≥ 7.0, B.Tech, year ≤ 2026.

Pramaan is the **predicate API** on top of issuer truth — not another PDF vault. Sibling of [Silent Bell](https://github.com/HawaleShailesh004/silentbell): one campus privacy OS, two doors — enrolment and cutoff.

## What it does

| Role | Action |
| --- | --- |
| **USAR Registrar** | Publishes hashed award leaves (Meera 7.4, Kabir 6.2, Arya 8.1) — not PDFs |
| **Student** | Holds private CGPA; proves against recruiter policy |
| **Recruiter** | Sets cutoff slider → live **policy hash**; sees pass/fail chip |
| **Fake university** | 9.9 CGPA from untrusted root → fails membership |

**The theatrical beat:** same student, same leaf, slider moved from 7.0 to 8.0 — proof **fails**. You did not fake a score. You changed the question.

Also ships: revocation on correction, cohort `awardEpoch` rotation, CSV hash import, recruiter audit receipts, `#explorer`.

## How we built it

- **Midnight Compact** — `issueAward`, `revokeAward`, `setAwardEpoch`, `provePolicy`
- **LEAF kit** (shared pattern with Silent Bell) — Merkle membership; CGPA stays witness-only
- **Integer CGPA** — basis points (740 = 7.40), no floats in Compact
- **Policy-locked proofs** — recruiter slider commits `policyHash`; circuit binds to that question
- **React + Vite** — slider as the product surface; FailWell for below-cutoff / fake / revoked
- **Express API** — issue, import, prove, verify, receipts

## Private vs public

| Witness (phone) | Ledger |
| --- | --- |
| CGPA, degree, year | Award root, revoke set, awardEpoch |
| Student secret | Policy hash (on successful proof) |
| | Tx success = pass; failed proof = fail |

## Challenges

Public-network wallet sync is slow on first run; we used `print-address` + Preview faucet, then deployed while demoing on local undeployed for reliable video. Local and Preview share the same Compact circuits.

## Accomplishments

- End-to-end Compact proofs: pass at 7.0, fail at 8.0, fake issuer, revoke, cohort rotate
- Recruiter UI where the **slider is the product**
- Public Preview contract for judges
- Separate sibling product from Silent Bell (same LEAF muscle, different job)

## What we learned

Consent to share a **document** is not the same as proving a **predicate**. Leading with exact CGPA disclosure would make this DigiLocker-on-chain — so we lead with boolean L0.

## What's next

- Partner with one registrar for a synthetic-then-real cohort
- Recruiter org accounts + richer policy templates
- Optional L1 band disclosure; default stays L0
- NAD-shaped import at scale — hash awards, never become another depository

Not affiliated with NAD, UGC, or GGSIPU — demo issuer for hackathon.

## Try it

```bash
git clone https://github.com/HawaleShailesh004/pramaan
cd pramaan && npm install && npm --prefix web install
npm run compile && npm run setup
npm run api    # :8790
npm run web    # :5175
```

Open `#demo` for one-click cast, or `#recruiter` for the slider.
