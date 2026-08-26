/**
 * Print PreProd wallet address for the faucet (no full sync wait).
 */
import { WebSocket } from "ws";
import { resolveNetwork, getOrCreateWallet, setActiveNetwork } from "./network";
import { createWallet } from "./wallet";

// @ts-expect-error Required for wallet SDK
globalThis.WebSocket = WebSocket;

async function main() {
  setActiveNetwork("preprod");
  const { network, config: networkConfig } = resolveNetwork({
    argv: ["node", "print-address", "--network", "preprod"],
  });
  const WALLET = getOrCreateWallet(network);
  const walletCtx = await createWallet({
    network,
    networkConfig,
    seed: WALLET.seed,
    restore: false,
  });
  const address = walletCtx.unshieldedKeystore.getBech32Address().toString();
  console.log("\nPreProd wallet address (paste into faucet):\n");
  console.log(`  ${address}\n`);
  console.log(`Faucet: ${networkConfig.faucet}`);
  console.log("After funding: npx tsx src/pramaan-deploy.ts --network preprod\n");
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
