import type { Policy, AgentRequest, PolicyDecision } from "../types/policy.js";
import { matchRule } from "./matcher.js";
import { compareRules } from "./risk-score.js";

export function evaluate(policy: Policy, request: AgentRequest): PolicyDecision {
  const matched = policy.rules.filter((rule) => matchRule(rule, request));

  if (matched.length === 0) {
    return {
      decision: policy.defaultDecision,
      severity: policy.defaultSeverity,
      matchedRule: null,
      reason: "No matching rule found. Applying default policy.",
      timestamp: new Date().toISOString(),
      agentId: request.agentId,
      sessionId: request.sessionId,
      tool: request.tool,
      action: request.action,
    };
  }

  matched.sort(compareRules);
  const winner = matched[0];

  return {
    decision: winner.decision,
    severity: winner.severity,
    matchedRule: winner.id,
    reason: winner.description,
    timestamp: new Date().toISOString(),
    agentId: request.agentId,
    sessionId: request.sessionId,
    tool: request.tool,
    action: request.action,
  };
}
