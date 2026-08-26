# Pramaan architecture

## Trust boundary

```
┌─────────────┐     witness      ┌──────────────────┐
│   Student   │ ─ CGPA, secret ─▶│  provePolicy     │
│   device    │                  │  (Compact)       │
└─────────────┘                  └────────┬─────────┘
                                        │ policy hash
┌─────────────┐     admin tx     ┌──────▼─────────┐
│ USAR Issuer │ ─ issue/revoke ─▶│  Midnight      │
└─────────────┘                  │  ledger        │
                                 │  · award tree  │
┌─────────────┐     slider       │  · revoke set  │
│  Recruiter  │ ─ policy hash ─▶ │  · awardEpoch  │
└─────────────┘                  └────────────────┘
```

## Circuits

| Circuit | Role | Discloses |
| --- | --- | --- |
| `issueAward` | Registrar | Leaf insert (hash only) |
| `revokeAward` | Registrar | Revocation id in set |
| `setAwardEpoch` | Registrar | Cohort year floor |
| `provePolicy` | Student | Policy hash on success |

## `provePolicy` checks

1. Merkle path opens current `awards` root
2. `cgpaBps >= minCgpaBps`
3. `degree == policy.degree`
4. `year <= maxYear`
5. `year >= awardEpoch` (cohort rotation)
6. Leaf not in `revokedAwards`
7. Return `policyHash(minCgpa, degree, maxYear)`

Failed proof = failed tx. No `meets=false` on success path.

## Off-chain

| Component | Purpose |
| --- | --- |
| Express API | Issue, prove, import CSV, verify receipts |
| `.pramaan-receipts.json` | Recruiter audit log (demo) |
| Web UI | Slider, templates, explorer |

## Data model

- **CGPA:** integer basis points (`740` = 7.40)
- **Policy hash:** `persistentHash("pramaan:policy:v1", minCgpa, degree, maxYear)`
- **Revoke id:** `persistentHash("pramaan:revoke:", awardLeaf)`

## Ports (vs Silent Bell)

| Service | Pramaan | Silent Bell |
| --- | --- | --- |
| Node | 9945 | 9944 |
| Indexer | 8089 | 8088 |
| Proof | 6301 | 6300 |
| API | 8790 | 8789 |
| UI | 5175 | 5174 |
