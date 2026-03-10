# Mission Control - Stockbridge Coffee

AI agent definitions and workflows for running Stockbridge Coffee business operations via [Mission Control](http://192.168.4.74:4000).

## Server

- **Dashboard**: http://192.168.4.74:4000
- **Model**: `anthropic/claude-sonnet-4-6`
- **SSH**: `ssh root@192.168.4.74`

## Agents

| Agent | Role | Description |
|-------|------|-------------|
| Content Creator | builder | Blog posts, product descriptions, newsletters |
| Social Media Manager | builder | Instagram, Facebook, Twitter content |
| Marketing Analyst | builder | Competitor analysis, market research |
| Email Manager | builder | Inbox monitoring, customer responses |
| Calendar Manager | builder | Scheduling, recurring events |
| Ops Manager | architect (master) | Coordinates all agents, daily briefings |

## Quick Start

Load the full Stockbridge Coffee workflow onto a Mission Control instance:

```bash
./scripts/load-workflow.sh stockbridge-coffee http://192.168.4.74:4000 $MC_API_TOKEN
```

## Structure

```
mission-control/
  agents/           - Reusable agent JSON definitions
  workflows/        - Workflow templates (agents + initial tasks)
  scripts/          - Loader and automation scripts
```

## Also stored in

- Shared repo (all command centres): https://github.com/davidmarkgardiner/mission-control-shared
- Gitea: https://gitea.lab.danatlab.com/DavidGardiner/mission-control-shared
