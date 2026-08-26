# Pramaan - live presentation script (~2–3 min)

**Goal:** Judges feel a _product_, not a circuit tour. PDF drawer → Midnight fit → live slider → eligibility address.

---

## Setup (before you speak)

```bash
npm run setup
npm run api
npm run web
```

Open `http://localhost:5175/`. Hard refresh. Optional: run **#demo** once so proofs are warm.

**Have ready:** personas in `COMPAT.md`.  
**Eligibility line (say once near the end):** Preview contract `34448964df7df052fa142ce6b3b3635a7f5613d1831323e3aae50d19f4c3179d` on [explorer.preview.midnight.network](https://explorer.preview.midnight.network/).

---

## Script

### 0. Open (15s) - brand on screen

_[Home visible]_

> “This is **Pramaan**. Tagline: _prove the cutoff; keep the marksheet._  
> Placement week. Forty companies. Forty marksheet PDFs. DigiLocker opens the **file**. We prove a **fact**.”

### 1. The trap (20s)

_[File vs fact table]_

> “Recruiters need three facts: trusted issuer, CGPA above a bar, year in range.  
> They get a drawer of PDFs. Photoshop still exists. Fake universities still print letterheads.  
> Consent to share a document is not consent to prove a predicate.”

### 2. Why Midnight (20s)

_[Boundary split / trust boundary]_

> “That’s Midnight’s job: **selective disclosure**. Compact proves the leaf meets **this** policy. The ledger never learns the CGPA. Policy hash stops bait-and-switch.”

### 3. Live product (60–90s) - do not narrate every button

**Path A - one-click**  
`#demo` → Run full demo cast.

> “Real local Compact proofs. Watch: import cohort, Meera clears 7.0, Kabir fails, bar to 8.0, revoke, fake uni, cohort rotate.”

**Path B - theatrical (preferred on camera)**

1. `#issuer` → Import & publish  
2. `#recruiter` → slider **7.0** → Prove Meera (gold) → Prove Kabir (FailWell)  
3. Slider **8.0** → Prove Meera fails  

> “Same leaf. Different question. That is not a hack; that is the point.”

4. `#fake` → Prove 9.9  

> “Letterhead is not a root.”

5. `#explorer` → counts + policy hashes  

> “Accountability without harvesting CGPAs.”

### 4. Close (20s)

> “Pramaan is a **placement-cell pilot** for Brainwave’s Midnight Track - sibling of Silent Bell.  
> Compact is live on **Midnight Preview** - contract `34448964…f4c3179d`.  
> The cast runs on local proofs so latency stays demo-friendly.  
> Next: one registrar partner, richer templates, L0 default forever.  
> Today: prove the cutoff. Keep the marksheet.”

---

## Don’t say

- “It’s just a demo.”
- Long ZK theory.
- “We replace NAD.”
- Wallet sync drama unless asked - then: Preview deploy succeeded; local cast is the smooth judge path.

## Do say if asked “Would companies use this?”

> “Not as a crypto app. As a predicate API on top of issuer truth: university publishes leaves, placement cell publishes policy, student proves. That’s the path from pilot to product.”
