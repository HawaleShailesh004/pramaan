import { Buffer } from "node:buffer";
import express from "express";
import cors from "cors";
import {
  connectPramaan,
  issueAward,
  provePolicy,
  readPramaan,
  revokeAward,
  setAwardEpoch,
  type PramaanHandle,
} from "./pramaan-client";
import { derivePolicyHash } from "./pramaan-leaf";
import { AWARDS, type AwardPersona } from "./pramaan-keys";
import { parseAwardCsv, csvPersonas } from "./pramaan-import";
import { listReceipts, verifyReceipt } from "./pramaan-receipts";

const port = Number(process.env.PRAMAAN_PORT || 8790);
let handle: PramaanHandle | null = null;

async function chain() {
  if (!handle) handle = await connectPramaan();
  return handle;
}

const ISSUABLE = new Set<AwardPersona>(["meera", "kabir", "arya"]);

const app = express();
app.use(cors());
app.use(express.json({ limit: "256kb" }));

app.get("/health", async (_req, res) => {
  try {
    const h = await chain();
    res.json({ ok: true, network: h.network, address: h.address });
  } catch (err) {
    res.status(503).json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

app.get("/v1/ledger", async (_req, res) => {
  try {
    res.json(await readPramaan(await chain()));
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.get("/v1/receipts", (_req, res) => {
  res.json({ receipts: listReceipts() });
});

app.get("/v1/policy", (req, res) => {
  const minCgpaBps = Number(req.query.minCgpaBps ?? 700);
  const degree = Number(req.query.degree ?? 1);
  const maxYear = Number(req.query.maxYear ?? 2026);
  const hash = Buffer.from(derivePolicyHash(minCgpaBps, degree, maxYear)).toString("hex");
  res.json({ minCgpaBps, degree, maxYear, policyHash: hash });
});

app.post("/v1/issue", async (req, res) => {
  try {
    const persona = req.body?.persona as AwardPersona;
    if (!ISSUABLE.has(persona)) {
      res.status(400).json({ ok: false, error: "issue meera, kabir, or arya" });
      return;
    }
    const result = await issueAward(await chain(), persona);
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
});

app.post("/v1/import", async (req, res) => {
  try {
    const csv = String(req.body?.csv ?? "");
    const rows = parseAwardCsv(csv);
    const personas = csvPersonas(rows);
    const h = await chain();
    const issued: string[] = [];
    for (const p of personas) {
      await issueAward(h, p);
      issued.push(p);
    }
    res.json({ ok: true, issued, count: issued.length });
  } catch (err) {
    res.status(400).json({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
});

app.post("/v1/revoke", async (req, res) => {
  try {
    const persona = req.body?.persona as AwardPersona;
    if (!ISSUABLE.has(persona)) {
      res.status(400).json({ ok: false, error: "revoke meera, kabir, or arya" });
      return;
    }
    const result = await revokeAward(await chain(), persona);
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
});

app.post("/v1/epoch", async (req, res) => {
  try {
    const epoch = Number(req.body?.epoch ?? 2027);
    const result = await setAwardEpoch(await chain(), epoch);
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
});

app.post("/v1/prove", async (req, res) => {
  try {
    const persona = req.body?.persona as AwardPersona;
    const minCgpaBps = Number(req.body?.minCgpaBps ?? 700);
    const degree = Number(req.body?.degree ?? 1);
    const maxYear = Number(req.body?.maxYear ?? 2026);
    if (persona !== "meera" && persona !== "kabir" && persona !== "arya" && persona !== "fake") {
      res.status(400).json({ ok: false, error: "persona meera|kabir|arya|fake" });
      return;
    }
    const result = await provePolicy(await chain(), persona, minCgpaBps, degree, maxYear);
    res.json({ ok: true, meets: true, ...result });
  } catch (err) {
    res.status(400).json({
      ok: false,
      meets: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

/** Production-shaped verify: bind txId to policy hash + recruiter bar. */
app.post("/v1/verify", (req, res) => {
  const txId = String(req.body?.txId ?? "");
  const policyHash = String(req.body?.policyHash ?? "");
  const minCgpaBps = Number(req.body?.minCgpaBps ?? 700);
  const degree = Number(req.body?.degree ?? 1);
  const maxYear = Number(req.body?.maxYear ?? 2026);
  const expected = Buffer.from(derivePolicyHash(minCgpaBps, degree, maxYear)).toString("hex");
  if (expected.toLowerCase() !== policyHash.toLowerCase()) {
    res.status(400).json({
      ok: false,
      error: "policyHash does not match minCgpa/degree/maxYear",
      expectedPolicyHash: expected,
    });
    return;
  }
  const v = verifyReceipt(txId, policyHash, minCgpaBps, degree, maxYear);
  if (!v.ok) {
    res.status(404).json({ ok: false, error: v.reason });
    return;
  }
  res.json({
    ok: true,
    meets: true,
    receipt: v.receipt,
    label: `Meets policy 0x${policyHash.slice(0, 8)}…`,
  });
});

app.get("/v1/personas", (_req, res) => {
  res.json({
    personas: Object.entries(AWARDS).map(([id, a]) => ({
      id,
      ...a,
      cgpa: a.cgpaBps / 100,
    })),
  });
});

app.listen(port, () => {
  console.log(`Pramaan API on http://127.0.0.1:${port}`);
});
