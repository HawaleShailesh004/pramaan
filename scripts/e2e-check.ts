/**
 * End-to-end smoke check for Pramaan.
 * Reconnects to the deployed contract and reads ledger state.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { WebSocket } from "ws";
import { findDeployedContract } from "@midnight-ntwrk/midnight-js-contracts";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { CompiledContract } from "@midnight-ntwrk/midnight-js-protocol/compact-js";
import { resolveNetwork, getOrCreateWallet } from "../src/network";
import { createWallet, persistWalletState } from "../src/wallet";
import { emptyPramaanState, pramaanWitnesses } from "../src/pramaan-witnesses";
import { PRAMAAN_SECRETS } from "../src/pramaan-keys";
import { getPramaanDeployment } from "../src/pramaan-state";

// @ts-expect-error wallet sync requires WebSocket
globalThis.WebSocket = WebSocket;

const PRIVATE_STATE_ID = "pramaanPrivateState";

const { network, config: networkConfig } = resolveNetwork({
  argv: ["node", "e2e-check", "--network", "undeployed"],
});
const WALLET = getOrCreateWallet(network);
const SEED = WALLET.seed;

function fail(msg: string): never {
  console.error(`❌ e2e-check failed: ${msg}`);
  process.exit(1);
}

function isHexAddress(s: unknown): s is string {
  return typeof s === "string" && /^[0-9a-fA-F]+$/.test(s) && s.length >= 32;
}

async function main() {
  const deployment = getPramaanDeployment();
  if (!deployment) fail("No .pramaan-state.json — run npm run setup");
  if (!isHexAddress(deployment.address)) {
    fail(`Invalid deployment address: ${deployment.address}`);
  }

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const zkConfigPath = path.resolve(__dirname, "..", "contracts", "managed", "pramaan");
  const contractPath = path.join(zkConfigPath, "contract", "index.js");
  if (!fs.existsSync(contractPath)) fail("Compiled contract missing — run npm run compile");

  const Pramaan = await import(pathToFileURL(contractPath).href);
  const compiledContractFactory: any = CompiledContract.make("pramaan", Pramaan.Contract);
  const compiledContract = compiledContractFactory.pipe(
    CompiledContract.withWitnesses(pramaanWitnesses as any) as any,
    CompiledContract.withCompiledFileAssets(zkConfigPath) as any,
  );

  const walletCtx = await createWallet({ network, networkConfig, seed: SEED });
  await walletCtx.wallet.waitForSyncedState();
  await persistWalletState(network, walletCtx);

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const walletProvider = {
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx() {
      throw new Error("e2e-check is read-only");
    },
    submitTx() {
      throw new Error("e2e-check is read-only");
    },
  } as any;

  const providers = {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: "pramaan-state",
      accountId: walletCtx.unshieldedKeystore.getBech32Address().toString(),
      privateStoragePasswordProvider: () => "Local-Devnet-Development-Placeholder-1",
    }),
    publicDataProvider: indexerPublicDataProvider(
      networkConfig.indexer,
      networkConfig.indexerWS,
    ),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };

  try {
    await findDeployedContract(providers, {
      contractAddress: deployment.address,
      compiledContract: compiledContract as any,
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: emptyPramaanState(PRAMAAN_SECRETS.usar),
    });
  } catch (err: any) {
    await walletCtx.wallet.stop();
    fail(`findDeployedContract: ${err?.message ?? err}`);
  }

  const onChainState = await providers.publicDataProvider.queryContractState(
    deployment.address,
  );
  if (!onChainState) {
    await walletCtx.wallet.stop();
    fail(`queryContractState returned null for ${deployment.address}`);
  }

  const ledger = Pramaan.ledger(onChainState.data);
  console.log("✅ e2e-check passed");
  console.log(`   contractAddress: ${deployment.address}`);
  console.log(`   network:         ${network}`);
  console.log(`   awards inserted: ${Number(ledger.awards.firstFree())}`);
  console.log(`   award epoch:     ${Number(ledger.awardEpoch)}`);
  console.log(`   revoked:         ${Number(ledger.revokedAwards.size())}`);

  await walletCtx.wallet.stop();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
