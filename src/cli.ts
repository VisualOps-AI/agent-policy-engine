#!/usr/bin/env node
import { Command } from "commander";
import { loadPolicy, loadRequest } from "./utils/load-policy.js";
import { evaluate } from "./engine/policy-engine.js";
import { logDecision } from "./utils/audit-log.js";

const program = new Command();

program
  .name("agent-policy")
  .description("Policy engine for AI agent tool-use governance")
  .version("0.1.0");

program
  .command("evaluate")
  .description("Evaluate an agent action request against a policy file")
  .requiredOption("-p, --policy <path>", "Path to policy file (YAML or JSON)")
  .requiredOption("-r, --request <path>", "Path to request file (JSON)")
  .option("--pretty", "Pretty-print the output for human readability")
  .option("--audit", "Write decision to audit log")
  .action((opts) => {
    try {
      const policy = loadPolicy(opts.policy);
      const request = loadRequest(opts.request);
      const decision = evaluate(policy, request);

      if (opts.audit) {
        logDecision(decision);
      }

      if (opts.pretty) {
        printPretty(decision);
      } else {
        console.log(JSON.stringify(decision, null, 2));
      }

      if (decision.decision === "deny") {
        process.exitCode = 1;
      }
    } catch (err) {
      console.error("Error:", err instanceof Error ? err.message : err);
      process.exitCode = 2;
    }
  });

function printPretty(d: {
  decision: string;
  severity: unknown;
  tool: unknown;
  action: unknown;
  agentId: unknown;
  sessionId: unknown;
  matchedRule: unknown;
  reason: unknown;
  timestamp: unknown;
}): void {
  const colors: Record<string, string> = {
    deny: "\x1b[31m",
    sandbox: "\x1b[33m",
    approval_required: "\x1b[35m",
    allow: "\x1b[32m",
  };
  const reset = "\x1b[0m";
  const bold = "\x1b[1m";
  const dim = "\x1b[2m";
  const color = colors[d.decision as string] ?? "";

  console.log(`\n${bold}Agent Policy Engine${reset}`);
  console.log(`${"─".repeat(40)}`);
  console.log(`  Decision:     ${color}${bold}${(d.decision as string).toUpperCase()}${reset}`);
  console.log(`  Severity:     ${d.severity}`);
  console.log(`  Tool:         ${d.tool}`);
  console.log(`  Action:       ${d.action}`);
  console.log(`  Agent:        ${d.agentId}`);
  console.log(`  Session:      ${d.sessionId}`);
  console.log(`  Matched Rule: ${d.matchedRule ?? "none"}`);
  console.log(`  Reason:       ${d.reason}`);
  console.log(`  ${dim}${d.timestamp}${reset}`);
  console.log();
}

program.parse();
