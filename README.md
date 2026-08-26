# Pramaan

**Prove the cutoff. Keep the marksheet.**

Standalone Midnight Compact dApp for Brainwave 2026 Midnight Track. Sibling of [Silent Bell](https://github.com/HawaleShailesh004/silentbell) — same LEAF Merkle kit, different story: recruiters ask predicates, not PDFs.

> A circuit proves an issued academic leaf meets a recruiter’s policy. The ledger learns pass/fail and the policy hash. It never learns CGPA, roll, or papers.

## Problem

Campus placement week. A student mails a marksheet. The recruiter needed three facts — trusted issuer, CGPA ≥ cutoff, graduation year in range — not a PDF drawer. DigiLocker opens the file. Photoshop still exists. Pramaan issues **leaves**, not documents.

| NAD / PDF | Pramaan |
| --- | --- |
| Whole document | Predicate |
| Logo, letterhead | Root in verifier allow-list |
| Recruiter asks more after PDF | Policy hash bound in proof |

## Ports (offset from Silent Bell)

| Service | Port |
| --- | --- |
| Node | 9945 |
| Indexer | 8089 |
| Proof server | 6301 |
| API | 8790 |
| UI | 5175 |

## Phase 2 (complete pilot)

- **Revocation set** — registrar revokes corrected awards; `provePolicy` checks `revokedAwards`
- **Cohort rotation** — `awardEpoch` blocks replay across placement seasons
- **Third student (Arya 8.1)** — passes 8.0 when Meera cannot
- **NAD-shaped CSV import** — hash rows, never store PDF
- **Policy templates** — recruiter presets (“7.0 B.Tech 2026”)
- **Explorer + audit log** — `#explorer` ledger counts + receipt policy hashes
- **POST /v1/verify** — bind txId to policy hash (production-shaped)

## Run locally

```bash
cd pramaan
npm install
npm --prefix web install
npm run compile          # once — Docker + ../tools compact + zk-params
npm run setup            # docker compose + deploy to undeployed
npm run test:fixtures    # offline leaf/policy checks
npm run demo:flow        # CLI 120s script
npm run api              # :8790
npm run web              # :5175 → #recruiter for the slider
```

## Demo script (judges)

1. **Awards** — publish Meera 7.4 + Kabir 6.2 (`#issuer`)
2. **Cutoff** — slider **7.0** → Meera gold, Kabir fails (`#recruiter`)
3. Move slider to **8.0** → Meera fails (same leaf, different question)
4. **Fake university** — 9.9 CGPA, wrong root (`#fake`)
5. **One-click** — `#demo` runs the full cast

Or: `npm run demo:flow` from the terminal.

## Screens

| Route | Role |
| --- | --- |
| `/` | Story: file vs fact |
| `#issuer` | Publish demo cohort |
| `#meera` | Private leaf + prove for recruiter policy |
| `#recruiter` | Slider + policy hash + two results |
| `#fake` | Untrusted issuer fail |
| `#explorer` | Ledger + recruiter audit log |
| `#demo` | One-click judge cast |

## Architecture

- **Contract:** `contracts/pramaan.compact` — `issueAward`, `provePolicy`
- **Leaves:** CGPA as integer basis points (740 = 7.40)
- **Policy:** public inputs hashed; proof binds to recruiter’s bar
- **Failure:** failed proof = fail (no `meets=false` on chain)

## Public network (Preview)

**Contract address (Preview):**  
`34448964df7df052fa142ce6b3b3635a7f5613d1831323e3aae50d19f4c3179d`

```bash
npm run network preview
npx tsx src/pramaan-deploy.ts --network preview   # after faucet funds wallet
```

Redeploy address lands in `.pramaan-state.json` (gitignored).

## Not in scope (hackathon)

- Exact CGPA disclosure (L2) — lead with boolean pass/fail
- Bank income, Aadhaar, credit bureau
- Affiliation with NAD/UGC — demo issuer only

## Private vs public

| Stays on device | On ledger |
| --- | --- |
| CGPA, papers, roll | Issuer root, award Merkle tree |
| Student secret | Policy hash (from recruiter slider) |
| | Proof success/failure (tx outcome) |
