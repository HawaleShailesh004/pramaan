# Pramaan - Devpost submission (paste-ready)

Paste **Inspiration → What's next** into Devpost. Preview before submit.  
Images use GitHub raw URLs from [HawaleShailesh004/pramaan](https://github.com/HawaleShailesh004/pramaan).

**Internal note (do not paste):** Placement story is a **synthetic composite** - not a real student’s case. **Preview contract is live** (eligibility met). Local undeployed stack remains the judge demo path for live slider / `#demo` cast.

---

## Fields (not markdown)

**Project name:** Pramaan

**Tagline:**  
Prove the cutoff. Keep the marksheet.

**Description (≤200 characters):**  
Pramaan lets students prove they meet a recruiter’s CGPA bar on Midnight - without mailing marksheets. Policy-locked Compact proofs; the ledger learns pass/fail and the policy hash, never CGPA.

*(≈188 characters)*

**Built with:**

```
midnight compact midnight.js typescript react vite express docker nodejs zero-knowledge merkle-tree campus placements zk-proofs proof-server compact-runtime policy-hash
```

**Repo:** [https://github.com/HawaleShailesh004/pramaan](https://github.com/HawaleShailesh004/pramaan)

**Cover image:** [devpost-thumbnail.png](https://raw.githubusercontent.com/HawaleShailesh004/pramaan/main/docs/media/devpost-thumbnail.png) *(generate from `docs/media/THUMBNAIL-PROMPTS.md` if missing)*

---

## Inspiration

![Brand](https://raw.githubusercontent.com/HawaleShailesh004/pramaan/main/docs/media/brand-icon.svg)

Placement week smells like printouts and panic.

Forty companies. Forty “please attach your latest marksheet” emails. I watched friends compress entire semesters into PDFs - Operating Systems 31/100 next to a CGPA that was supposed to open one door - and hit send. The recruiter did not need the papers. They needed three facts: trusted issuer, CGPA at or above a bar, year in range.

DigiLocker, when it works, still **opens the file**. Photoshop still exists when NAD never ingested that year. Fake universities still print letterheads. Consent to share a **document** is not the same as proving a **predicate**.

I am not submitting anyone’s real transcript. The students in this demo - Meera 7.4, Kabir 6.2, Arya 8.1 - are **synthetic**. The feeling is the product requirement: *I needed to clear a bar without handing over a drawer of my life.*

When I found Brainwave’s Midnight Track, I finally had language for that need. [Midnight](https://docs.midnight.network/) is built for selective disclosure. So I asked one question, and I built Pramaan around the answer:

> How do I prove this issued academic leaf meets **this** recruiter policy - without revealing CGPA, roll, or papers - and without letting letterhead fake a root?

## What it does

I built Pramaan as a **placement-cell pilot product** - not a circuit toy. The **slider is the product**.

![Trust boundary](https://raw.githubusercontent.com/HawaleShailesh004/pramaan/main/docs/media/trust-boundary.svg)

| Platform rail | Cutoff checked? | Marksheet private? | Fake uni blocked? | Policy bait-and-switch stopped? |
| --- | --- | --- | --- | --- |
| Email PDF / DigiLocker | Manual | No - file opens | Letterhead only | Recruiter can ask more later |
| Public chain “hash the PDF” | Maybe | Reveal-or-nothing if you send the file | Weak | Hash ≠ question |
| **Pramaan (Midnight Compact)** | **Yes - circuit comparisons** | **Yes - witness never published** | **Yes - untrusted root fails** | **Yes - policy hash bound in proof** |

**Why not DigiLocker alone?** DigiLocker shares a document. We share a fact bound to the recruiter’s question.

When I act as the **USAR registrar**, I import a CSV of awards as hashed leaves. Names and marksheets never enter Compact. I can revoke a corrected leaf. I can rotate `awardEpoch` so a 2026 proof cannot replay forever.

When I act as **Meera**, I see my private 7.4 on device. Public rail shows only issuer root. I prove against the recruiter’s live policy hash.

When I act as the **recruiter**, I move a cutoff slider. Live gold **policy hash**. Meera at 7.0 → pass. Kabir → FailWell below cutoff. Same leaf, slider to **8.0** → Meera fails. Arya 8.1 passes. That is not a hack; that is the point.

When I act as **Commercial University Ltd.**, even 9.9 fails: letterhead is not a root.

The **public explorer** shows award counts, epoch, revoked count, and accepted policy hashes - accountability without harvesting CGPAs.

## How we built it

I shaped the product around placement week’s PDF drawer, then wired Midnight underneath.

![Architecture](https://raw.githubusercontent.com/HawaleShailesh004/pramaan/main/docs/media/architecture.svg)

- **Public Midnight deployment (eligibility):** Compact contract on **Midnight Preview** at `34448964df7df052fa142ce6b3b3635a7f5613d1831323e3aae50d19f4c3179d` (deployed 2026-08-26). Explorer: [explorer.preview.midnight.network](https://explorer.preview.midnight.network/) · deployer `mn_addr_preview1gzflnqjccr8tr6muekygdsa8tk5q6w5du0fd59jp5wlhl0qmu44shcwkw6`.
- **Judge demo path (local stack):** Same circuits on **undeployed** Docker node + indexer - real Compact proofs via **proof-server 8.1.0**. Reproduce: `npm run setup` → `npm run api` → `npm run web` → `#demo` or `#recruiter`.
- **Compact circuits:** `issueAward`, `revokeAward`, `setAwardEpoch`, `provePolicy` - depth-4 HistoricMerkleTree awards, integer CGPA basis points, policy hash disclosure on success.
- **Midnight.js 4.1.1** API + recruiter UI with FailWell (below cutoff, revoked, cohort expired, unissued).

```bash
git clone https://github.com/HawaleShailesh004/pramaan.git
cd pramaan
npm install && npm --prefix web install
npm run compile
npm run setup
npm run api && npm run web
```

Personas and versions: [`COMPAT.md`](https://github.com/HawaleShailesh004/pramaan/blob/main/COMPAT.md). Not affiliated with NAD/UGC - demo issuer.

## Challenges we ran into

I wanted the demo to feel like fairness, not like faucet theatre - and Midnight’s public stack fought me for it.

- **Wrong faucet / wrong address** burned time: PreProd faucet rejects `mn_addr_preview…` and contract hex is not a wallet. `print-address` now respects `--network`.
- **Deploy script hardcoded undeployed** once ignored `--network preview` - fixed so Preview deploy actually lands on Preview.
- Public **wallet sync** takes minutes on first Preview run; local undeployed stays the smooth video path while Preview satisfies eligibility.
- Windows **Compact compile** forced a Docker toolchain path so we could ship.

Shipping past them mattered - because a placement product that only works in a slide deck is another PDF drawer.

## Accomplishments that we're proud of

I am proud Pramaan shows the **whole corridor**: issuer CSV, private leaf, recruiter slider, Meera pass / Kabir fail, bar moved to 8.0, revoke, fake uni, explorer receipts.

I am proud the **slider is the product** - same leaf, different question - so judges feel policy-locked proofs in one breath.

I am proud we kept the trust boundary honest in the UI: what stays on the phone, what Midnight may learn, what never becomes DigiLocker-on-chain.

And I am proud we label personas **synthetic**. Real students deserve process we have not finished yet.

## What we learned

I learned that privacy tech only matters when someone is already attaching the fortieth marksheet.

I learned Midnight is not “ZK for fun.” It is for the moment a recruiter needs a **predicate**, not a **file**.

I learned leading with exact CGPA disclosure would make us a third depository. Lead with boolean L0. Keep the bar movable.

## What's next for Pramaan

Next, I want the next placement cell - the one still collecting PDF drawers - to publish a policy template, not a shared drive labeled `applications_aug`.

- Partner with one registrar for synthetic → limited cohort
- Recruiter org accounts + richer templates (“7.0 CSE 2026”)
- Optional L1 band disclosure; default stays L0
- NAD-shaped import at scale - hash awards, never become another vault
- PreProd twin when public sync is steadier (Preview already meets eligibility)

Pramaan is my answer to placement week’s PDF drawer. Prove the cutoff. Keep the marksheet.

![Cover](https://raw.githubusercontent.com/HawaleShailesh004/pramaan/main/docs/media/devpost-thumbnail.png)

---

## Gallery checklist (upload to Devpost, 3:2 preferred)

1. Hero / home (brand + file vs fact)
2. Trust boundary diagram
3. Issuer CSV / awards cohort
4. Recruiter slider at 7.0 + policy hash
5. Meera pass chip / Kabir FailWell
6. Slider at 8.0 - Meera fails (theatrical beat)
7. Fake university FailWell
8. Student private leaf (`#meera`)
9. Public explorer + receipts
10. Live demo cast complete
11. Architecture diagram
12. Thumbnail (`docs/media/devpost-thumbnail.png`)

---

## Video outline (90–150s)

1. Story beat (20s) - placement week, PDF drawer, DigiLocker opens the file
2. Comparison + Midnight one-liner (15s) - predicate, not document
3. Live product (60s) - import → slider 7.0 → 8.0 → fake → explorer
4. Preview contract address (15s)
5. What's next (15s) - registrar partner, templates, L0 default
