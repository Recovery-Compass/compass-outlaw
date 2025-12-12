# Epic/Issue Workflow Documentation

**Version:** 1.0  
**Last Updated:** December 12, 2025  
**Framework:** Strategic Singularity V5.0  

---

## Overview

This document establishes the **Epic/Issue workflow** for the Recovery Compass project, providing a hierarchical structure for organizing work using **Epics** (major initiatives) containing multiple **Issues** (individual tasks).

```
Epic (Major Initiative)
├── Issue 1 (Task)
├── Issue 2 (Task)
├── Issue 3 (Task)
└── Issue N (5-15 tasks per Epic)
```

---

## 1. Hierarchical Work Structure

### Epic
A **major initiative** or feature set that represents a significant body of work, typically spanning multiple weeks or months.

**Characteristics:**
- Contains 5-15 related Issues
- Aligns with one or more PFV Gates
- Has clear success criteria
- Tracked with `epic` label

### Issue
An **individual task** or unit of work that contributes to an Epic's completion.

**Characteristics:**
- References parent Epic (e.g., "Refers to Epic #1")
- Completable in 1-5 days
- Has specific acceptance criteria
- Uses standard labels (enhancement, bug, documentation, infrastructure)

---

## 2. Epic Creation Guidelines

### When to Create an Epic

Create an Epic when:
- The initiative requires **5+ related tasks**
- Work spans **multiple weeks**
- Multiple team members are involved
- The work aligns with strategic objectives

### Epic Template

Use `.github/ISSUE_TEMPLATE/epic.yml` to create new Epics with the following structure:

```markdown
## Objective
[High-level goal of this Epic]

## Scope
**In Scope:**
- Feature A
- Feature B

**Out of Scope:**
- Feature C (moved to Epic #X)

## Success Criteria
- [ ] All Issues are closed
- [ ] Documentation is updated
- [ ] Tests pass
- [ ] PFV Gate verification complete

## PFV Gate Alignment
Gate X: [Gate Name]

## Priority
[Critical/High/Medium/Low]

## Related Issues
- #2
- #3
- #4

## Dependencies
[External dependencies or blockers]

## Milestones
- [ ] Phase 1: Planning (Week 1)
- [ ] Phase 2: Implementation (Weeks 2-4)
- [ ] Phase 3: Testing (Week 5)

## Owner
@username
```

---

## 3. Issue Creation Guidelines

### Best Practices

1. **Always Reference Parent Epic**
   - Add "Refers to Epic #X" in issue description
   - Maintains traceability

2. **Keep Issues Focused**
   - One clear objective per Issue
   - Completable in 1-5 days
   - Use task lists for sub-tasks

3. **Define Acceptance Criteria**
   ```markdown
   ## Acceptance Criteria
   - [ ] Feature implemented
   - [ ] Tests written and passing
   - [ ] Documentation updated
   - [ ] Code reviewed
   ```

4. **Use Appropriate Labels**
   - `enhancement` - New features
   - `bug` - Bug fixes
   - `documentation` - Documentation updates
   - `infrastructure` - Infrastructure changes

### Issue Template

Use `.github/ISSUE_TEMPLATE/feature_request.yml` or `bug_report.yml`:

```markdown
## Related Epic
Refers to Epic #1

## Description
[Clear description of the task]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Priority
[Critical/High/Medium/Low]
```

---

## 4. Workflow States & Labels

### Issue States

| State | Description |
|-------|-------------|
| **Open** | Active work, not yet complete |
| **Closed** | Completed and merged |

### Standard Labels

| Label | Usage |
|-------|-------|
| `epic` | Marks an issue as an Epic |
| `priority:critical` | Must be done immediately |
| `priority:high` | Important, do soon |
| `priority:medium` | Normal priority |
| `priority:low` | Nice to have |
| `enhancement` | New feature or improvement |
| `bug` | Something isn't working |
| `documentation` | Documentation only changes |
| `infrastructure` | Infrastructure/tooling changes |

---

## 5. PFV Gate Alignment

Each Epic should align with one or more **Progress Verification Framework (PFV) Gates**:

| Gate | Focus Area | Epic Alignment |
|------|------------|----------------|
| **Gate 1** | Foundation | Core architecture, setup |
| **Gate 2** | Integration | API integration, data flow |
| **Gate 3** | Security | Authentication, authorization |
| **Gate 4** | Financial Prudence | Cost optimization, budgets |
| **Gate 5** | Testing | Test coverage, quality |
| **Gate 6** | Performance | Speed, scalability |
| **Gate 7** | Documentation | User guides, API docs |
| **Gate 8** | Deployment | CI/CD, environments |
| **Gate 9** | Monitoring | Logging, alerts |
| **Gate 10** | Compliance | Legal, regulatory |
| **Gate 11** | Optimization | Code quality, refactoring |
| **Gate 12** | Sustainability | Maintenance, longevity |

### Example Mapping

```markdown
Epic #1: ARF Agent Infrastructure
├── PFV Gate: Gate 1 (Foundation)
├── PFV Gate: Gate 2 (Integration)
└── PFV Gate: Gate 8 (Deployment)
```

---

## 6. Strategic Singularity V5.0 Framework

### Current Initiative Structure

#### Epic #1: ARF Agent Infrastructure (CURRENT)
**Status:** In Progress  
**PFV Gates:** 1, 2, 8  
**Issues:** #2, #3, #4, #5, #6

**Objective:**  
Establish core agent routing infrastructure for LiteLLM proxy with ARF integration.

**Key Issues:**
- ARF-compliant LiteLLM proxy deployment
- Supabase Edge Function optimization
- Agent routing configuration
- Monitoring and logging setup
- Documentation

#### Epic #2: Edge Function Optimization (PLANNED)
**Status:** Planned  
**PFV Gates:** 6, 11  

**Objective:**  
Optimize Supabase Edge Functions for performance and cost efficiency.

#### Epic #3: Security Hardening (PLANNED)
**Status:** Planned  
**PFV Gates:** 3, 10  

**Objective:**  
Implement comprehensive security measures across the platform.

---

## 7. Workflow Examples

### Example 1: Creating an Epic

1. Go to Issues → New Issue
2. Select "Epic" template
3. Fill in all required fields
4. Set priority and PFV Gate alignment
5. Create the Epic (e.g., Epic #1)

### Example 2: Creating an Issue for an Epic

1. Go to Issues → New Issue
2. Select "Feature Request" template
3. Add "Refers to Epic #1" in the Epic reference field
4. Define acceptance criteria
5. Apply appropriate labels
6. Create the Issue (e.g., #2)

### Example 3: Closing an Epic

Before closing an Epic, verify:
- [ ] All related Issues are closed
- [ ] Success criteria met
- [ ] PFV Gate verification complete
- [ ] Documentation updated
- [ ] Post-mortem conducted (if applicable)

---

## 8. Related Documentation

- [LiteLLM Setup Guide](./litellm-setup.md)
- [WARP Rules](../rules/WARP_RULES.md)
- [Agent Context](./AGENT_CONTEXT.yaml)
- [PFV V16 Protocol](../PFV_V16_PROTOCOL.md)

---

## 9. Governance

### Epic Approval
- Epics must be reviewed by project maintainers before work begins
- Strategic alignment verified
- Resources allocated

### Issue Assignment
- Issues can be self-assigned or assigned by maintainers
- Work should not begin until Issue is assigned
- Updates provided via comments

### Progress Tracking
- Weekly Epic status updates
- Daily Issue progress (if actively worked)
- Blockers raised immediately

---

## 10. Templates Quick Reference

| Template | Location | Use Case |
|----------|----------|----------|
| Epic | `.github/ISSUE_TEMPLATE/epic.yml` | Major initiatives |
| Feature Request | `.github/ISSUE_TEMPLATE/feature_request.yml` | New features |
| Bug Report | `.github/ISSUE_TEMPLATE/bug_report.yml` | Bug fixes |

---

**Document Owner:** Recovery Compass Team  
**Review Cadence:** Quarterly  
**Next Review:** March 2026
