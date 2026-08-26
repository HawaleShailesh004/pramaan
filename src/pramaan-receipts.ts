import * as fs from "node:fs";
import * as path from "node:path";

const FILE = ".pramaan-receipts.json";

export type ProofReceipt = {
  txId: string;
  policyHash: string;
  minCgpaBps: number;
  degree: number;
  maxYear: number;
  persona: string;
  at: string;
};

type ReceiptStore = { receipts: ProofReceipt[] };

function pathFor(cwd: string) {
  return path.join(cwd, FILE);
}

function load(cwd = process.cwd()): ReceiptStore {
  const p = pathFor(cwd);
  if (!fs.existsSync(p)) return { receipts: [] };
  return JSON.parse(fs.readFileSync(p, "utf8")) as ReceiptStore;
}

function save(store: ReceiptStore, cwd = process.cwd()) {
  fs.writeFileSync(pathFor(cwd), `${JSON.stringify(store, null, 2)}\n`);
}

export function appendReceipt(receipt: Omit<ProofReceipt, "at">, cwd = process.cwd()) {
  const store = load(cwd);
  store.receipts.unshift({ ...receipt, at: new Date().toISOString() });
  store.receipts = store.receipts.slice(0, 200);
  save(store, cwd);
  return store.receipts[0];
}

export function listReceipts(cwd = process.cwd()): ProofReceipt[] {
  return load(cwd).receipts;
}

export function verifyReceipt(
  txId: string,
  policyHash: string,
  minCgpaBps: number,
  degree: number,
  maxYear: number,
  cwd = process.cwd(),
): { ok: boolean; receipt?: ProofReceipt; reason?: string } {
  const hit = load(cwd).receipts.find(
    (r) =>
      r.txId === txId &&
      r.policyHash.toLowerCase() === policyHash.toLowerCase() &&
      r.minCgpaBps === minCgpaBps &&
      r.degree === degree &&
      r.maxYear === maxYear,
  );
  if (!hit) {
    return {
      ok: false,
      reason: "No matching receipt — proof may have failed or policy hash mismatch",
    };
  }
  return { ok: true, receipt: hit };
}
