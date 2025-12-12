# WARP Rules

**Version:** 1.0  
**Last Updated:** December 12, 2025  
**Framework:** Workflow Automation & Routing Protocol

---

## Overview

WARP (Workflow Automation & Routing Protocol) defines the rules and standards for agent routing, task delegation, and workflow automation in the Recovery Compass project.

## Core Principles

1. **Proof-First Verification (PFV)**
   - All changes require verification before merge
   - Evidence-based decision making
   - Gate-based progress tracking

2. **Agent Routing**
   - Route tasks to appropriate AI agents
   - Maintain context across agent interactions
   - Track delegation chains

3. **Workflow Automation**
   - Automate repetitive tasks
   - Standardize common operations
   - Minimize manual intervention

## Routing Rules

### Agent Selection Criteria

| Task Type | Primary Agent | Fallback Agent |
|-----------|---------------|----------------|
| Code Generation | Claude Code | Copilot |
| Documentation | Gemini | Claude Code |
| Strategic Planning | Gemini | Human Review |
| Bug Fixes | Copilot | Claude Code |

### Context Preservation

- All agent interactions must maintain Epic/Issue references
- Document key decisions in Issue comments
- Update Epic progress in weekly summaries

## Automation Standards

### CI/CD Integration

- All PRs trigger automated tests
- Security scanning on code changes
- Documentation build verification

### Issue Management

- Auto-label based on file paths
- Auto-assign based on expertise
- Auto-close on PR merge (when linked)

## Related Documentation

- [Epic/Issue Workflow](../docs/epic-issue-workflow.md)
- [Agent Context](../docs/AGENT_CONTEXT.yaml)
- [PFV V16 Protocol](../PFV_V16_PROTOCOL.md)

---

**Document Owner:** Recovery Compass Team  
**Review Cadence:** Monthly
