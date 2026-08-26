import * as fs from "node:fs";
import * as path from "node:path";

const FILE = ".pramaan-state.json";

export function getPramaanDeployment(cwd = process.cwd()): { address: string; network: string } | null {
  const p = path.join(cwd, FILE);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export function savePramaanDeployment(network: string, address: string, cwd = process.cwd()): void {
  const p = path.join(cwd, FILE);
  fs.writeFileSync(p, `${JSON.stringify({ network, address, deployedAt: new Date().toISOString() }, null, 2)}\n`);
}
