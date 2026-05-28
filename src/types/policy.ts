import { z } from "zod";

export const Decision = z.enum(["allow", "deny", "sandbox", "approval_required"]);
export type Decision = z.infer<typeof Decision>;

export const Severity = z.enum(["low", "medium", "high", "critical"]);
export type Severity = z.infer<typeof Severity>;

export const DECISION_PRIORITY: Record<Decision, number> = {
  deny: 0,
  sandbox: 1,
  approval_required: 2,
  allow: 3,
};

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export const PolicyRuleSchema = z.object({
  id: z.string(),
  description: z.string(),
  decision: Decision,
  severity: Severity,
  match: z.object({
    tool: z.string().optional(),
    action: z.string().optional(),
    pathPatterns: z.array(z.string()).optional(),
    commandPatterns: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }),
});
export type PolicyRule = z.infer<typeof PolicyRuleSchema>;

export const PolicySchema = z.object({
  name: z.string(),
  version: z.string(),
  defaultDecision: Decision.default("allow"),
  defaultSeverity: Severity.default("low"),
  rules: z.array(PolicyRuleSchema),
});
export type Policy = z.infer<typeof PolicySchema>;

export const AgentRequestSchema = z.object({
  agentId: z.string(),
  sessionId: z.string(),
  tool: z.string(),
  action: z.string(),
  parameters: z.record(z.unknown()).optional(),
  metadata: z.object({
    filePath: z.string().optional(),
    command: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
});
export type AgentRequest = z.infer<typeof AgentRequestSchema>;

export interface PolicyDecision {
  decision: Decision;
  severity: Severity;
  matchedRule: string | null;
  reason: string;
  timestamp: string;
  agentId: string;
  sessionId: string;
  tool: string;
  action: string;
}
