import { Buffer } from "node:buffer";

import * as path from "node:path";

import { fileURLToPath, pathToFileURL } from "node:url";

import { WebSocket } from "ws";

import { findDeployedContract } from "@midnight-ntwrk/midnight-js-contracts";

import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";

import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";

import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";

import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";

import { CompiledContract } from "@midnight-ntwrk/midnight-js-protocol/compact-js";

import { resolveNetwork, getOrCreateWallet } from "./network";

import { createWallet, persistWalletState, type WalletContext } from "./wallet";

import { emptyPramaanState, pramaanWitnesses, type PramaanPrivateState } from "./pramaan-witnesses";

import { AWARDS, PRAMAAN_SECRETS, type AwardPersona } from "./pramaan-keys";

import { deriveAwardLeaf, derivePolicyHash } from "./pramaan-leaf";

import { getPramaanDeployment } from "./pramaan-state";

import { appendReceipt } from "./pramaan-receipts";



// @ts-expect-error Required for wallet sync

globalThis.WebSocket = WebSocket;



const PRIVATE_STATE_ID = "pramaanPrivateState";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const zkConfigPath = path.resolve(__dirname, "..", "contracts", "managed", "pramaan");

const Pramaan = await import(pathToFileURL(path.join(zkConfigPath, "contract", "index.js")).href);



const compiledContractFactory: any = CompiledContract.make("pramaan", Pramaan.Contract);

const compiledContract = compiledContractFactory.pipe(

  CompiledContract.withWitnesses(pramaanWitnesses as any) as any,

  CompiledContract.withCompiledFileAssets(zkConfigPath) as any,

);



function undeployedArgv(): string[] {

  return ["node", "pramaan", "--network", "undeployed"];

}



export type PramaanHandle = {

  walletCtx: WalletContext;

  providers: any;

  deployed: any;

  network: string;

  address: string;

};



async function createProviders(walletCtx: WalletContext, networkConfig: { indexer: string; indexerWS: string; proofServer: string }) {

  const privateStatePassword =

    process.env.PRIVATE_STATE_PASSWORD?.trim() || "Local-Devnet-Development-Placeholder-1";

  const walletProvider = {

    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,

    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,

    async balanceTx(tx: any, ttl?: Date) {

      const recipe = await walletCtx.wallet.balanceUnboundTransaction(

        tx,

        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },

        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },

      );

      return walletCtx.wallet.finalizeRecipe(recipe);

    },

    submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx) as any,

  };

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);

  const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();

  return {

    privateStateProvider: levelPrivateStateProvider({

      privateStateStoreName: "pramaan-state",

      accountId,

      privateStoragePasswordProvider: () => privateStatePassword,

    }),

    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),

    zkConfigProvider,

    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),

    walletProvider,

    midnightProvider: walletProvider,

  };

}



function awardState(persona: AwardPersona | "usar"): PramaanPrivateState {

  if (persona === "usar") return emptyPramaanState(PRAMAAN_SECRETS.usar);

  const a = AWARDS[persona];

  return emptyPramaanState(PRAMAAN_SECRETS[persona], a);

}



export async function connectPramaan(): Promise<PramaanHandle> {

  const { network, config } = resolveNetwork({ argv: undeployedArgv() });

  const deployment = getPramaanDeployment();

  if (!deployment) throw new Error("Pramaan not deployed. Run npm run setup");

  const WALLET = getOrCreateWallet(network);

  const walletCtx = await createWallet({ network, networkConfig: config, seed: WALLET.seed });

  await walletCtx.wallet.waitForSyncedState();

  await persistWalletState(network, walletCtx);

  const providers = await createProviders(walletCtx, config);

  providers.privateStateProvider.setContractAddress(deployment.address);

  await providers.privateStateProvider.set(PRIVATE_STATE_ID, awardState("usar"));

  const deployed = await findDeployedContract(providers, {

    compiledContract: compiledContract as any,

    contractAddress: deployment.address,

    privateStateId: PRIVATE_STATE_ID,

    initialPrivateState: awardState("usar"),

  });

  return { walletCtx, providers, deployed, network, address: deployment.address };

}



async function asPersona(handle: PramaanHandle, persona: AwardPersona | "usar") {

  handle.providers.privateStateProvider.setContractAddress(handle.address);

  await handle.providers.privateStateProvider.set(PRIVATE_STATE_ID, awardState(persona));

  return handle.deployed;

}



export async function issueAward(handle: PramaanHandle, persona: AwardPersona) {

  if (persona === "fake") throw new Error("Fake issuer cannot write the USAR root");

  const admin = await asPersona(handle, "usar");

  const a = AWARDS[persona];

  const leaf = deriveAwardLeaf(PRAMAAN_SECRETS[persona], a.cgpaBps, a.degree, a.year);

  const tx = await admin.callTx.issueAward(leaf);

  return { txId: tx.public.txId, leafHex: Buffer.from(leaf).toString("hex") };

}



export async function revokeAward(handle: PramaanHandle, persona: AwardPersona) {

  if (persona === "fake") throw new Error("Cannot revoke unissued leaf");

  const admin = await asPersona(handle, "usar");

  const a = AWARDS[persona];

  const leaf = deriveAwardLeaf(PRAMAAN_SECRETS[persona], a.cgpaBps, a.degree, a.year);

  const tx = await admin.callTx.revokeAward(leaf);

  return { txId: tx.public.txId, leafHex: Buffer.from(leaf).toString("hex") };

}



export async function setAwardEpoch(handle: PramaanHandle, epoch: number) {

  const admin = await asPersona(handle, "usar");

  const tx = await admin.callTx.setAwardEpoch(BigInt(epoch));

  return { txId: tx.public.txId, epoch };

}



export async function provePolicy(

  handle: PramaanHandle,

  persona: AwardPersona,

  minCgpaBps: number,

  degree = 1,

  maxYear = 2026,

) {

  const student = await asPersona(handle, persona);

  const tx = await student.callTx.provePolicy(BigInt(minCgpaBps), BigInt(degree), BigInt(maxYear));

  const policy = derivePolicyHash(minCgpaBps, degree, maxYear);

  const policyHash = Buffer.from(policy).toString("hex");

  const txId = tx.public.txId;

  appendReceipt({

    txId,

    policyHash,

    minCgpaBps,

    degree,

    maxYear,

    persona,

  });

  return {

    txId,

    policyHash,

    result: tx.private?.result ? Buffer.from(tx.private.result).toString("hex") : undefined,

  };

}



export async function readPramaan(handle: PramaanHandle) {

  const contractState = await handle.providers.publicDataProvider.queryContractState(handle.address);

  if (!contractState) return { address: handle.address, network: handle.network, issuerId: "" };

  const ledger = Pramaan.ledger(contractState.data);

  return {

    address: handle.address,

    network: handle.network,

    issuerId: Buffer.from(ledger.issuerId).toString("hex"),

    awardEpoch: Number(ledger.awardEpoch),

    awardsIssued: Number(ledger.awards.firstFree()),

    revokedCount: Number(ledger.revokedAwards.size()),

  };

}



export { AWARDS };


