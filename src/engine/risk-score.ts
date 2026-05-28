import {
  DECISION_PRIORITY,
  SEVERITY_WEIGHT,
  type PolicyRule,
} from "../types/policy.js";

export function compareRules(a: PolicyRule, b: PolicyRule): number {
  const decisionDiff = DECISION_PRIORITY[a.decision] - DECISION_PRIORITY[b.decision];
  if (decisionDiff !== 0) return decisionDiff;
  return SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity];
}
