import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { PolicyDecision } from "../types/policy.js";

const DEFAULT_LOG_PATH = "./logs/audit.jsonl";

export function logDecision(
  decision: PolicyDecision,
  logPath: string = process.env.AUDIT_LOG_PATH ?? DEFAULT_LOG_PATH
): void {
  const dir = dirname(logPath);
  mkdirSync(dir, { recursive: true });
  appendFileSync(logPath, JSON.stringify(decision) + "\n");
}
