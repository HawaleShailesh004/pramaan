/**
 * Print wallet address for the active / flagged network (for faucet funding).
 * Usage: npx tsx src/print-address.ts [--network preview|preprod]
 */
import { WebSocket } from "ws";
import { resolveNetwork, getOrCreateWallet, setActiveNetwork, parseNetworkFlag } from "./network";
import { createWallet } from "./wallet";

// @ts-expect-error Required for wallet SDK
globalThis.WebSocket = WebSocket;

async function main() {
  const flag = parseNetworkFlag(process.argv);
  if (flag) setActiveNetwork(flag);
  const { network, config: networkConfig } = resolveNetwork();
  if (network === "undeployed") {
    console.error("Local undeployed needs no faucet. Use --network preview or preprod.");
    process.exit(1);
  }

  const WALLET = getOrCreateWallet(network);
  const walletCtx = await createWallet({
    network,
    networkConfig,
    seed: WALLET.seed,
    restore: false,
  });
  const address = walletCtx.unshieldedKeystore.getBech32Address().toString();
  console.log(`\n${network} wallet address (paste into faucet):\n`);
  console.log(`  ${address}\n`);
  console.log(`Faucet: ${networkConfig.faucet}`);
  console.log(`After funding: npx tsx src/pramaan-deploy.ts --network ${network}\n`);
  if (WALLET.mnemonic) {
    console.log("(Recovery phrase saved in .midnight-state.json — gitignored.)\n");
  }
  if (WALLET.created && WALLET.mnemonic) {
    console.log(`New wallet mnemonic:\n  ${WALLET.mnemonic}\n`);
  }
  await walletCtx.wallet.stop();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
