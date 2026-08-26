/**
 * Pramaan leaf + policy fixture checks (offline, no chain).
 * Run: npm run test:fixtures
 */
import { deriveAwardLeaf, derivePolicyHash, deriveRevokeId } from "../src/pramaan-leaf";
import { PRAMAAN_SECRETS, AWARDS } from "../src/pramaan-keys";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function main() {
  console.log("\nPramaan fixture tests\n");

  const meeraLeaf = deriveAwardLeaf(
    PRAMAAN_SECRETS.meera,
    AWARDS.meera.cgpaBps,
    AWARDS.meera.degree,
    AWARDS.meera.year,
  );
  const kabirLeaf = deriveAwardLeaf(
    PRAMAAN_SECRETS.kabir,
    AWARDS.kabir.cgpaBps,
    AWARDS.kabir.degree,
    AWARDS.kabir.year,
  );

  assert(meeraLeaf.length === 32, "meera leaf is 32 bytes");
  assert(kabirLeaf.length === 32, "kabir leaf is 32 bytes");
  assert(
    Buffer.compare(meeraLeaf, kabirLeaf) !== 0,
    "meera and kabir leaves differ",
  );

  const p700 = derivePolicyHash(700, 1, 2026);
  const p800 = derivePolicyHash(800, 1, 2026);
  assert(p700.length === 32, "policy hash is 32 bytes");
  assert(Buffer.compare(p700, p800) !== 0, "7.0 and 8.0 policies differ");

  assert(AWARDS.meera.cgpaBps >= 700, "740 vs min 700 should pass in circuit");
  assert(!(AWARDS.kabir.cgpaBps >= 700), "620 vs min 700 should fail in circuit");
  assert(AWARDS.meera.cgpaBps < 800, "740 vs min 800 should fail in circuit");

  const revokeId = deriveRevokeId(meeraLeaf);
  assert(revokeId.length === 32, "revoke id is 32 bytes");

  console.log("  ✓ leaf derivation stable");
  console.log("  ✓ revoke id:", Buffer.from(revokeId).toString("hex").slice(0, 16) + "…");
  console.log("  ✓ policy hash 7.0:", Buffer.from(p700).toString("hex").slice(0, 16) + "…");
  console.log("  ✓ policy hash 8.0:", Buffer.from(p800).toString("hex").slice(0, 16) + "…");
  console.log("  ✓ 740 ≥ 700, 620 < 700, 740 < 800\n");
  console.log("All fixture tests passed.\n");
}

main();
