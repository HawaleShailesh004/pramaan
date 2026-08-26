import {
  connectPramaan,
  issueAward,
  provePolicy,
  readPramaan,
  revokeAward,
  setAwardEpoch,
} from "./pramaan-client";
import { deriveRevokeId, deriveAwardLeaf } from "./pramaan-leaf";
import { PRAMAAN_SECRETS, AWARDS } from "./pramaan-keys";

async function expectFail(label: string, fn: () => Promise<unknown>) {
  try {
    await fn();
    throw new Error(`${label}: expected failure`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("expected failure")) throw err;
    console.log(`  FAIL as expected (${label}): ${msg.split("\n")[0]}`);
  }
}

async function main() {
  console.log("\nPramaan demo flow\n");
  const handle = await connectPramaan();
  console.log(`  Contract: ${handle.address}\n`);

  console.log("1. Issue Meera 7.4 + Kabir 6.2 + Arya 8.1");
  console.log("  ", (await issueAward(handle, "meera")).txId);
  console.log("  ", (await issueAward(handle, "kabir")).txId);
  console.log("  ", (await issueAward(handle, "arya")).txId);

  console.log("\n2. Slider 7.0 - Meera passes, Kabir fails");
  const pass = await provePolicy(handle, "meera", 700);
  console.log(
    `  Meera ok policy ${pass.policyHash.slice(0, 16)}… tx ${pass.txId}`,
  );
  await expectFail("kabir 7.0", () => provePolicy(handle, "kabir", 700));

  console.log("\n3. Slider 8.0 - Meera fails, Arya passes");
  await expectFail("meera 8.0", () => provePolicy(handle, "meera", 800));
  const arya80 = await provePolicy(handle, "arya", 800);
  console.log(`  Arya ok tx ${arya80.txId.slice(0, 16)}…`);

  console.log("\n4. Revoke Kabir leaf - even at 6.0 cannot prove");
  await revokeAward(handle, "kabir");
  await expectFail("kabir revoked", () => provePolicy(handle, "kabir", 600));

  console.log("\n5. Fake university 9.9 - cannot open USAR root");
  await expectFail("fake", () => provePolicy(handle, "fake", 600));

  console.log("\n6. Cohort rotation - awardEpoch 2027 blocks 2026 leaves");
  await setAwardEpoch(handle, 2027);
  await expectFail("meera cohort expired", () => provePolicy(handle, "meera", 700));

  const kabirLeaf = deriveAwardLeaf(
    PRAMAAN_SECRETS.kabir,
    AWARDS.kabir.cgpaBps,
    AWARDS.kabir.degree,
    AWARDS.kabir.year,
  );
  const revokeId = deriveRevokeId(kabirLeaf);
  console.log("\nLedger:", await readPramaan(handle));
  console.log("Kabir revoke id:", Buffer.from(revokeId).toString("hex").slice(0, 16) + "…");

  await handle.walletCtx.wallet.stop();
  console.log("\nPramaan flow complete.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
