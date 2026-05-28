# Roadmap

## v0.1 (Current)
- [x] YAML/JSON policy loading with Zod validation
- [x] Rule matching: tool, action, path, command, tags
- [x] Decision priority and severity ranking
- [x] CLI evaluation with pretty output
- [x] Audit logging to JSONL
- [x] Unit test suite

## v0.2 - Approval Workflow
- [ ] Webhook callback for `approval_required` decisions
- [ ] Configurable approval timeout with auto-deny
- [ ] Slack/email notification integration

## v0.3 - Identity and Sessions
- [ ] Agent identity verification (JWT/API key validation)
- [ ] Session-scoped policies (different rules per session type)
- [ ] Rate limiting per agent/session

## v0.4 - Hot Reload and Observability
- [ ] File watcher for policy hot-reload without restart
- [ ] Prometheus metrics endpoint (decisions/sec, deny rate)
- [ ] Structured logging with correlation IDs

## v0.5 - Advanced Matching
- [ ] Regex support in match criteria
- [ ] Negation rules (match everything except)
- [ ] Composite rules (OR groups within AND logic)
- [ ] LLM-assisted command risk analysis for unknown patterns

## v1.0 - Aegis Integration
- [ ] Aegis middleware adapter (Express/Fastify)
- [ ] Witness audit trail integration
- [ ] Policy versioning and rollback
- [ ] Admin UI for policy management
- [ ] Multi-tenant policy isolation
