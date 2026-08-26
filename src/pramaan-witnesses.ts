import type { Ledger } from "../contracts/managed/pramaan/contract/index.js";

export type PramaanPrivateState = {
  secret: Uint8Array;
  cgpaBps: number;
  degree: number;
  year: number;
};

export const emptyPramaanState = (
  secret: Uint8Array,
  award: { cgpaBps?: number; degree?: number; year?: number } = {},
): PramaanPrivateState => ({
  secret,
  cgpaBps: award.cgpaBps ?? 0,
  degree: award.degree ?? 0,
  year: award.year ?? 0,
});

export const pramaanWitnesses = {
  local_secret_key({ privateState }: { privateState: PramaanPrivateState }): [PramaanPrivateState, Uint8Array] {
    return [privateState, privateState.secret];
  },
  getAwardPath(
    { privateState, ledger }: { privateState: PramaanPrivateState; ledger: Ledger },
    leaf: Uint8Array,
  ) {
    const path = ledger.awards.findPathForLeaf(leaf);
    if (!path) throw new Error("Award not issued by this issuer");
    return [privateState, path] as const;
  },
  awardCgpaBps({ privateState }: { privateState: PramaanPrivateState }): [PramaanPrivateState, bigint] {
    return [privateState, BigInt(privateState.cgpaBps)];
  },
  awardDegree({ privateState }: { privateState: PramaanPrivateState }): [PramaanPrivateState, bigint] {
    return [privateState, BigInt(privateState.degree)];
  },
  awardYear({ privateState }: { privateState: PramaanPrivateState }): [PramaanPrivateState, bigint] {
    return [privateState, BigInt(privateState.year)];
  },
};
