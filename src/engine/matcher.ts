import type { PolicyRule, AgentRequest } from "../types/policy.js";

function matchesGlob(pattern: string, value: string): boolean {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp(`^${escaped}$`, "i").test(value);
}

function matchesTool(rule: PolicyRule, request: AgentRequest): boolean {
  if (!rule.match.tool) return true;
  return matchesGlob(rule.match.tool, request.tool);
}

function matchesAction(rule: PolicyRule, request: AgentRequest): boolean {
  if (!rule.match.action) return true;
  return matchesGlob(rule.match.action, request.action);
}

function matchesPath(rule: PolicyRule, request: AgentRequest): boolean {
  if (!rule.match.pathPatterns) return true;
  const filePath = request.metadata?.filePath;
  if (!filePath) return false;
  return rule.match.pathPatterns.some((p) => matchesGlob(p, filePath));
}

function matchesCommand(rule: PolicyRule, request: AgentRequest): boolean {
  if (!rule.match.commandPatterns) return true;
  const command = request.metadata?.command;
  if (!command) return false;
  return rule.match.commandPatterns.some((pattern) =>
    command.toLowerCase().includes(pattern.toLowerCase())
  );
}

function matchesTags(rule: PolicyRule, request: AgentRequest): boolean {
  if (!rule.match.tags) return true;
  const requestTags = request.metadata?.tags;
  if (!requestTags) return false;
  return rule.match.tags.some((tag) => requestTags.includes(tag));
}

export function matchRule(rule: PolicyRule, request: AgentRequest): boolean {
  return (
    matchesTool(rule, request) &&
    matchesAction(rule, request) &&
    matchesPath(rule, request) &&
    matchesCommand(rule, request) &&
    matchesTags(rule, request)
  );
}
