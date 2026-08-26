import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { resolveNetwork, setActiveNetwork, parseNetworkFlag } from "./network";

function run(cmd: string, args: string[]): void {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: true });
  if (r.status !== 0) {
    process.stderr.write(`\nCommand failed: ${cmd} ${args.join(" ")}\n`);
    process.exit(r.status ?? 1);
  }
}

async function main(): Promise<void> {
  const argv = process.argv;
  const flag = parseNetworkFlag(argv);
  if (flag) setActiveNetwork(flag);
  const { network, config } = resolveNetwork({ argv });

  process.stdout.write(`\n→ Setting up Pramaan on network: ${network}\n\n`);

  run("docker", ["compose", "up", "-d", "--wait", ...config.composeServices]);

  const managed = path.join("contracts", "managed", "pramaan", "contract", "index.js");
  const skipCompile =
    process.env.SKIP_COMPILE === "1" || fs.existsSync(managed);
  if (skipCompile) {
    process.stdout.write("→ Skipping compile (artifacts present or SKIP_COMPILE=1)\n");
  } else {
    run("npm", ["run", "compile"]);
  }

  const deployArgs = network === "undeployed" ? [] : ["--", "--network", network];
  run("npm", ["run", "deploy", ...deployArgs]);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
