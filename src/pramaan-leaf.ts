import { persistentHash, CompactTypeBytes, CompactTypeVector, convertFieldToBytes } from "@midnight-ntwrk/compact-runtime";
import { pad32 } from "./leaf";

const Bytes32 = new CompactTypeBytes(32);
const Vec2 = new CompactTypeVector(2, Bytes32);
const Vec4 = new CompactTypeVector(4, Bytes32);
const Vec5 = new CompactTypeVector(5, Bytes32);

function field32(n: number | bigint): Uint8Array {
  return convertFieldToBytes(32, BigInt(n), "pramaan-leaf");
}

export const USAR_ISSUER_ID = pad32("usar:ggsipu:v1");
export const DEGREE_BTECH = 1;

export function deriveIssuerPk(sk: Uint8Array): Uint8Array {
  return persistentHash(Vec2, [pad32("pramaan:pk:"), sk]);
}

export function deriveAwardLeaf(sk: Uint8Array, cgpaBps: number, degree: number, year: number): Uint8Array {
  return persistentHash(Vec5, [
    pad32("pramaan:award:v1"),
    sk,
    field32(cgpaBps),
    field32(degree),
    field32(year),
  ]);
}

export function derivePolicyHash(minCgpaBps: number, degree: number, maxYear: number): Uint8Array {
  return persistentHash(Vec4, [
    pad32("pramaan:policy:v1"),
    field32(minCgpaBps),
    field32(degree),
    field32(maxYear),
  ]);
}

export function deriveRevokeId(leaf: Uint8Array): Uint8Array {
  return persistentHash(Vec2, [pad32("pramaan:revoke:"), leaf]);
}

export { pad32 };
