# Architecture

## Overview

The Agent Policy Engine is a synchronous, deterministic evaluation pipeline. It takes a policy file and an agent request, and returns a structured decision. No network calls, no state, no side effects beyond optional audit logging.

## Components

### Schema Validation (`src/types/policy.ts`)
Zod schemas enforce structure on both policy files and agent requests at load time. Invalid input fails fast with descriptive errors before reaching the engine.

### Rule Matcher (`src/engine/matcher.ts`)
Each rule defines match criteria. All criteria in a rule must match for the rule to apply (AND logic). Omitted criteria are treated as wildcards.

- **Tool/Action**: Glob matching (`file_*` matches `file_read`, `file_write`)
- **Path patterns**: Glob matching against `metadata.filePath`
- **Command patterns**: Case-insensitive substring matching against `metadata.command`
- **Tags**: Any-of matching against `metadata.tags`

### Risk Scoring (`src/engine/risk-score.ts`)
When multiple rules match, the engine selects the winner by:

1. Decision priority: deny (0) > sandbox (1) > approval_required (2) > allow (3)
2. Severity weight: critical (4) > high (3) > medium (2) > low (1)

This is a stable sort -- given the same input, the output is always the same.

### Policy Engine (`src/engine/policy-engine.ts`)
Orchestrates the pipeline: filter matching rules, sort by priority, return the winning decision with full audit metadata.

### CLI (`src/cli.ts`)
Commander.js interface for standalone evaluation. Reads files, runs the engine, prints results.

## Data Flow

```
Policy File (YAML/JSON) ─┐
                          ├──> evaluate() ──> PolicyDecision
Agent Request (JSON) ─────┘
```

## Design Decisions

- **No runtime state**: The engine is a pure function. No caching, no sessions, no database.
- **Fail-closed option**: Default decision is configurable per policy. Production policies should default to `deny`.
- **Deterministic**: Same input always produces same output. No randomness, no time-dependent logic (timestamp is metadata only).
- **Library-first**: The CLI is a thin wrapper. The engine is designed to be imported as a module.
