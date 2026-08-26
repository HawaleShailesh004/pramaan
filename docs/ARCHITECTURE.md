# Pramaan - architecture

## One diagram in words

```
USAR CSV ──issueAward──► Compact awards (Merkle leaves)
                              │
Student secret + CGPA ──provePolicy──► Midnight ledger
                              │              (root, policy hash,
                              │               revoke set, epoch)
                              │
Recruiter slider ──policyHash──► bound in successful proof
```

## Components

| Layer | What | Port / note |
| --- | --- | --- |
| Web UI | React + Vite product shell | 5175 |
| Pramaan API | Issue / prove / import / revoke / receipts | 8790 |
| Proof server | ZK proving | 6301 (Docker; Preview uses 6300 often) |
| Node + indexer | Local Midnight stack | Docker Compose |
| Compact | `pramaan.compact` | managed under `contracts/` |

## Circuits

| Circuit | Who | Effect |
| --- | --- | --- |
| `issueAward` | Issuer | Insert award leaf hash |
| `revokeAward` | Issuer | Add revoke id to set |
| `setAwardEpoch` | Issuer | Cohort year floor |
| `provePolicy` | Student | Membership + comparisons; disclose policy hash |

## Trust boundary

| Private (device) | Public (ledger) |
| --- | --- |
| CGPA bps, degree, year, secret | Award root / membership |
| Marksheet plaintext | Policy hash on success |
| | Revoke set, awardEpoch |

## Diagrams

- [architecture.svg](media/architecture.svg)
- [trust-boundary.svg](media/trust-boundary.svg)

## Threat model (pilot)

See root [README.md](../README.md#threat-model-pilot) and [COMPAT.md](../COMPAT.md).
