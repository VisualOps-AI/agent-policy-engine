import { readFileSync } from "node:fs";
import { extname } from "node:path";
import yaml from "js-yaml";
import {
  PolicySchema,
  AgentRequestSchema,
  type Policy,
  type AgentRequest,
} from "../types/policy.js";

export function loadPolicy(filePath: string): Policy {
  const raw = readFileSync(filePath, "utf-8");
  const ext = extname(filePath).toLowerCase();

  let parsed: unknown;
  if (ext === ".yaml" || ext === ".yml") {
    parsed = yaml.load(raw);
  } else if (ext === ".json") {
    parsed = JSON.parse(raw);
  } else {
    throw new Error(`Unsupported policy file format: ${ext}`);
  }

  return PolicySchema.parse(parsed);
}

export function loadRequest(filePath: string): AgentRequest {
  const raw = readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw);
  return AgentRequestSchema.parse(parsed);
}
