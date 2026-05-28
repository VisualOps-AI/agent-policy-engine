import { describe, it, expect } from "vitest";
import { evaluate } from "../src/engine/policy-engine.js";
import type { Policy, AgentRequest } from "../src/types/policy.js";

const policy: Policy = {
  name: "test-policy",
  version: "1.0",
  defaultDecision: "allow",
  defaultSeverity: "low",
  rules: [
    {
      id: "deny-env-access",
      description: "Block access to .env files",
      decision: "deny",
      severity: "critical",
      match: {
        tool: "file_*",
        pathPatterns: ["*.env", "*.env.*"],
      },
    },
    {
      id: "deny-destructive-commands",
      description: "Block destructive shell commands",
      decision: "deny",
      severity: "critical",
      match: {
        tool: "shell",
        commandPatterns: ["rm -rf", "drop table"],
      },
    },
    {
      id: "sandbox-file-write",
      description: "Route file writes to sandbox",
      decision: "sandbox",
      severity: "medium",
      match: {
        tool: "file_write",
        action: "write",
      },
    },
    {
      id: "approve-shell-commands",
      description: "Require approval for shell execution",
      decision: "approval_required",
      severity: "high",
      match: {
        tool: "shell",
        action: "execute",
      },
    },
  ],
};

function makeRequest(overrides: Partial<AgentRequest>): AgentRequest {
  return {
    agentId: "test-agent",
    sessionId: "test-session",
    tool: "file_read",
    action: "read",
    ...overrides,
  };
}

describe("PolicyEngine.evaluate", () => {
  it("allows safe actions when no deny rule matches", () => {
    const request = makeRequest({
      tool: "file_read",
      action: "read",
      metadata: { filePath: "src/index.ts" },
    });

    const result = evaluate(policy, request);
    expect(result.decision).toBe("allow");
    expect(result.matchedRule).toBeNull();
    expect(result.reason).toContain("default");
  });

  it("denies .env file access", () => {
    const request = makeRequest({
      tool: "file_read",
      action: "read",
      metadata: { filePath: ".env" },
    });

    const result = evaluate(policy, request);
    expect(result.decision).toBe("deny");
    expect(result.severity).toBe("critical");
    expect(result.matchedRule).toBe("deny-env-access");
  });

  it("denies destructive shell commands", () => {
    const request = makeRequest({
      tool: "shell",
      action: "execute",
      metadata: { command: "rm -rf /var/data" },
    });

    const result = evaluate(policy, request);
    expect(result.decision).toBe("deny");
    expect(result.severity).toBe("critical");
    expect(result.matchedRule).toBe("deny-destructive-commands");
  });

  it("requires approval for non-destructive shell commands", () => {
    const request = makeRequest({
      tool: "shell",
      action: "execute",
      metadata: { command: "ls -la /tmp" },
    });

    const result = evaluate(policy, request);
    expect(result.decision).toBe("approval_required");
    expect(result.matchedRule).toBe("approve-shell-commands");
  });

  it("routes file writes to sandbox", () => {
    const request = makeRequest({
      tool: "file_write",
      action: "write",
      metadata: { filePath: "output/report.txt" },
    });

    const result = evaluate(policy, request);
    expect(result.decision).toBe("sandbox");
    expect(result.severity).toBe("medium");
    expect(result.matchedRule).toBe("sandbox-file-write");
  });

  it("includes required fields in decision output", () => {
    const request = makeRequest({
      tool: "file_read",
      action: "read",
      metadata: { filePath: "readme.md" },
    });

    const result = evaluate(policy, request);
    expect(result).toHaveProperty("decision");
    expect(result).toHaveProperty("severity");
    expect(result).toHaveProperty("matchedRule");
    expect(result).toHaveProperty("reason");
    expect(result).toHaveProperty("timestamp");
    expect(result).toHaveProperty("agentId", "test-agent");
    expect(result).toHaveProperty("sessionId", "test-session");
    expect(result).toHaveProperty("tool", "file_read");
    expect(result).toHaveProperty("action", "read");
  });

  it("highest severity deny wins when multiple rules match", () => {
    const request = makeRequest({
      tool: "shell",
      action: "execute",
      metadata: { command: "rm -rf /var/data" },
    });

    const result = evaluate(policy, request);
    // Both deny-destructive-commands and approve-shell-commands match.
    // Deny (priority 0) beats approval_required (priority 2).
    expect(result.decision).toBe("deny");
    expect(result.matchedRule).toBe("deny-destructive-commands");
  });
});
