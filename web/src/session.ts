import { POLICY_DEFAULT } from "./personas";

const KEY = "pramaan:policy";

export type StoredPolicy = {
  minCgpa: number;
  minCgpaBps: number;
  degree: number;
  maxYear: number;
  policyHash: string;
};

export function loadPolicy(): StoredPolicy | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredPolicy;
  } catch {
    return null;
  }
}

export function savePolicy(p: StoredPolicy): void {
  sessionStorage.setItem(KEY, JSON.stringify(p));
}

export function defaultPolicy(): StoredPolicy {
  return {
    ...POLICY_DEFAULT,
    policyHash: "",
  };
}
