# Compatibility matrix

Pinned for Brainwave 2026 Midnight Track - **Pramaan** (standalone).

| Piece | Version |
| --- | --- |
| compact CLI | 0.5.2 |
| compactc | 0.31.1 |
| midnight-js | 4.1.1 |
| compact-runtime | 0.16.0 |
| wallet-sdk | 1.2.0 |
| proof-server image | 8.1.0 |
| Node | 22 |

`onchain-runtime-v3` must be a **single 3.0.0 copy**. `postinstall` removes nested copies.

## Networks / faucets

| Network | Faucet |
| --- | --- |
| undeployed | genesis wallet (local Docker) |
| preview | https://faucet.preview.midnight.network |
| preprod | https://faucet.preprod.midnight.network |

Fund the **unshielded** `mn_addr_…` address only — never a contract hex.

Local ports (offset from Silent Bell): **9945 / 8089 / 6301 / 8790 / 5175**.

## Demo personas (UI `#issuer` / `#recruiter` / `#fake`)

| Persona | CGPA | Role in demo |
| --- | --- | --- |
| Meera | 7.4 (740 bps) | Pass at 7.0; fail at 8.0 |
| Kabir | 6.2 (620 bps) | Below 7.0; revoke theatre |
| Arya | 8.1 (810 bps) | Pass at 8.0 when Meera cannot |
| Fake uni | 9.9 | Unissued leaf → membership fail |

Degree demo default: B.Tech (`1`), year `2026`.

## Preview deploy (eligibility — live)

| Field | Value |
| --- | --- |
| Network | Preview |
| Contract | `34448964df7df052fa142ce6b3b3635a7f5613d1831323e3aae50d19f4c3179d` |
| Deployer | `mn_addr_preview1gzflnqjccr8tr6muekygdsa8tk5q6w5du0fd59jp5wlhl0qmu44shcwkw6` |
| Explorer | https://explorer.preview.midnight.network/ |
| Faucet | https://faucet.preview.midnight.network |
| Deployed | 2026-08-26 |

Print address anytime: `npx tsx src/print-address.ts --network preview` (does not wait for full sync).

## Not in scope

NAD/UGC affiliation, Aadhaar, bank income, credit bureau, L2 exact CGPA as default.
