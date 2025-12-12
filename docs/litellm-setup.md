# LiteLLM Setup Guide

**Version:** 1.0  
**Last Updated:** December 12, 2025  

---

## Overview

This guide covers the setup and configuration of LiteLLM proxy for agent routing in the Recovery Compass project.

## Prerequisites

- Supabase project configured
- API keys for target LLM providers
- Edge Functions deployed

## Configuration

### Environment Variables

```bash
# LiteLLM Configuration
LITELLM_MASTER_KEY=${YOUR_MASTER_KEY}
LITELLM_PROXY_URL=${YOUR_PROXY_URL}

# Provider Keys
OPENAI_API_KEY=${YOUR_OPENAI_KEY}
ANTHROPIC_API_KEY=${YOUR_ANTHROPIC_KEY}
GOOGLE_API_KEY=${YOUR_GOOGLE_KEY}
```

### Proxy Configuration

See [Agent Routing Documentation](./agent-routing.md) for detailed proxy setup.

## Related Documentation

- [Epic/Issue Workflow](./epic-issue-workflow.md)
- [Agent Context](./AGENT_CONTEXT.yaml)

---

**Note:** This is a placeholder document. Detailed setup instructions will be added as part of Epic #1.
