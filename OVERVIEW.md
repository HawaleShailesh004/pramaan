# Pramaan - Simple Overview

**One line:** A recruiter can learn that a student clears a CGPA bar - without ever opening the marksheet.

**Hackathon:** Brainwave 2026 · Midnight Track  
**Tagline:** _Prove the cutoff. Keep the marksheet._  
**Sanskrit beat:** _pramāṇa_ - a valid means of knowledge. Not a document. A proof.

---

## 1. What’s the problem?

Campus placement week. Students mail PDFs. Recruiters collect drawers of marksheets.

| What recruiters need | What they get today |
| --- | --- |
| Trusted issuer | Letterhead / DigiLocker file |
| CGPA ≥ cutoff | Whole transcript |
| Degree + year in range | Photoshop risk · NAD holes |

So the real problem is:

> How do we prove **“this leaf clears this policy”** without revealing **CGPA, roll, or papers** - and without letting a fake university print its way in?

---

## 2. Why are we solving this? (for the hackathon)

Brainwave’s Midnight Track wants **real products** that use privacy tech - not DeFi demos.

Pramaan is a **placement-cell pilot product**:

- Solves a pain judges understand (hiring season, marksheet spam)
- Uses Midnight’s strength (prove a predicate without publishing private data)
- Shows a full workflow: issuer → student → recruiter slider → fake fail → explorer

We’re not building “a DID wallet.” We’re building **the cutoff as an instrument** - the slider is the product.

Sibling of [Silent Bell](https://github.com/HawaleShailesh004/silentbell): same LEAF Merkle muscle, different door - enrolment vs cutoff.

---

## 3. What is Midnight?

**Midnight** is a blockchain network built for **privacy**.

Most blockchains put almost everything on a public ledger. Midnight lets apps use **zero-knowledge proofs** (ZK):

- You can **prove** a fact is true
- Without **showing** the private data that made it true

**Compact** is Midnight’s language for writing those proof circuits.

**Simple analogy:**  
You show a recruiter a gold chip that says “meets policy `0xA1…`.” They learn the bar was cleared. They do **not** learn your 7.4 or your Operating Systems score.

---

## 4. How are we using Midnight to solve this?

### On the ledger (public)

- Award Merkle root (issuer published hashed leaves)
- Issuer id (verifier allow-list)
- **Policy hash** bound in a successful proof
- Revocation set + awardEpoch (cohort rotation)
- Tx success = meets policy; failed proof = fail

### Never on the ledger

- Exact CGPA
- Roll number / papers / marksheet PDF
- Student name

### How the proof works (simple)

1. University publishes **hashed awards** (Merkle leaves) - CGPA as integer basis points (`740` = 7.40).
2. Recruiter sets a slider → commits `policyHash`.
3. Student proves: “My issued leaf satisfies this policy” - membership + comparisons.
4. Below cutoff / wrong degree / revoked / fake root / expired cohort → **circuit fails**.

Circuits: `issueAward`, `revokeAward`, `setAwardEpoch`, `provePolicy`.

---

## 5. How are we solving it? (product design)

| Role | Product surface |
| --- | --- |
| **Issuer (USAR)** | CSV import → hashed leaves; revoke on correction |
| **Student (Meera)** | Private leaf on device; prove for recruiter policy |
| **Recruiter** | **Cutoff slider** + live policy hash + pass/fail chips |
| **Fake university** | Fancy CGPA, untrusted root → FailWell |
| **Public** | Explorer: counts + receipt policy hashes - never CGPAs |

**Theatrical beat:** same leaf, slider 7.0 → pass; slider 8.0 → fail. You did not fake a score. You changed the question.

---

## 6. What we are not building

- Exact CGPA disclosure as the default (that’s DigiLocker-on-chain)
- Bank income / Aadhaar / credit bureau
- Affiliation with NAD or UGC - demo issuer only

---

## 7. Docs map

| Doc | Purpose |
| --- | --- |
| [README.md](README.md) | Engineer quick start |
| [docs/DEVPOST.md](docs/DEVPOST.md) | Paste-ready Devpost |
| [docs/DEMO-SCRIPT.md](docs/DEMO-SCRIPT.md) | What to show / say |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Components + circuits |
| [COMPAT.md](COMPAT.md) | Versions + personas + Preview address |
| [SUBMISSION.md](SUBMISSION.md) | Finalize checklist |
| [docs/media/](docs/media/) | Brand, diagrams, thumbnail prompts |
