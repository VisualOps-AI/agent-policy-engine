# Threat Model

## Assets Protected

- File system (secrets, config, source code)
- Shell execution (destructive commands, exfiltration)
- External API access (unauthorized tool use)

## Threat Actors

| Actor | Capability | Motivation |
|-------|-----------|------------|
| Compromised agent | Full tool access within its scope | Data exfiltration, lateral movement |
| Prompt injection | Indirect control of agent actions | Execute attacker-chosen commands |
| Misconfigured agent | Overly broad permissions | Accidental destructive actions |

## Attack Vectors

### 1. Secret Exfiltration
Agent reads `.env`, credentials, or API keys and includes them in output.

**Mitigation**: Path pattern matching blocks access to sensitive files.

### 2. Destructive Commands
Agent executes `rm -rf`, `DROP TABLE`, or other irreversible operations.

**Mitigation**: Command substring matching blocks known destructive patterns.

### 3. Policy Bypass via Tool Aliasing
Agent calls a tool by an unexpected name to avoid pattern matching.

**Mitigation**: Policies should use glob patterns and cover tool name variants. Future: tool name normalization layer.

### 4. Metadata Omission
Agent submits a request without metadata fields to avoid path/command matching.

**Mitigation**: Rules with path/command criteria only match when metadata is present. Missing metadata means the rule does not match -- policy authors should include catch-all rules for tools that must always be gated.

### 5. Policy Tampering
Agent modifies the policy file before evaluation.

**Mitigation**: Policy files should be read-only to the agent process. Future: policy integrity verification via checksums.

## Assumptions

- The policy engine runs in a trusted environment (not controlled by the agent)
- Policy files are authored and deployed by operators, not agents
- The agent runtime correctly populates request metadata
- Network-level controls exist separately from this engine

## Residual Risks

- Novel destructive commands not covered by existing patterns
- Encoded/obfuscated commands that bypass substring matching
- Social engineering via prompt injection to convince operators to approve malicious actions

These are addressed in the roadmap via pattern learning and LLM-assisted command analysis.
