# Compatibility matrix

Pinned for Brainwave 2026 Midnight Track - **Pramaan** (standalone).

| Piece              | Version |
| ------------------ | ------- |
| compact CLI        | 0.5.2   |
| compactc           | 0.31.1  |
| midnight-js        | 4.1.1   |
| compact-runtime    | 0.16.0  |
| wallet-sdk         | 1.2.0   |
| proof-server image | 8.1.0   |
| Node               | 22      |

`onchain-runtime-v3` must be a **single 3.0.0 copy**. `postinstall` removes nested copies.

Local stack uses host ports **9945 / 8089 / 6301** so it does not collide with Silent Bell.
