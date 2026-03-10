#!/bin/bash
# Load a workflow from the shared repo into a Mission Control instance
# Usage: ./load-workflow.sh <workflow-name> <mc-url> <mc-api-token>
set -e

WORKFLOW=$1
MC_URL=${2:-"http://localhost:4000"}
MC_TOKEN=$3
REPO_BASE=$(cd "$(dirname "$0")/.." && pwd)

if [ -z "$WORKFLOW" ] || [ -z "$MC_TOKEN" ]; then
  echo "Usage: $0 <workflow-name> <mc-url> <mc-api-token>"
  echo "Example: $0 stockbridge-coffee http://192.168.4.74:4000 your-token-here"
  exit 1
fi

API="$MC_URL/api"
AUTH="Authorization: Bearer $MC_TOKEN"
CT="Content-Type: application/json"
WF_FILE="$REPO_BASE/workflows/$WORKFLOW.json"

if [ ! -f "$WF_FILE" ]; then
  echo "Workflow not found: $WF_FILE"
  exit 1
fi

echo "=== Loading workflow: $WORKFLOW ==="
echo "Target: $MC_URL"
echo ""

# Parse workflow
WF=$(cat "$WF_FILE")
AGENT_COUNT=$(echo "$WF" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['agents']))")
TASK_COUNT=$(echo "$WF" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['initial_tasks']))")
echo "Agents: $AGENT_COUNT, Tasks: $TASK_COUNT"

# Create agents
echo ""
echo "[1] Creating agents..."
declare -A AGENT_IDS

echo "$WF" | python3 -c "
import sys, json, os

wf = json.load(sys.stdin)
repo_base = '$REPO_BASE'

for agent_def in wf['agents']:
    # Load base agent from file
    agent_file = os.path.join(repo_base, agent_def['file'])
    with open(agent_file) as f:
        agent = json.load(f)

    # Apply overrides
    if 'overrides' in agent_def:
        agent.update(agent_def['overrides'])

    # Output as JSON line
    print(json.dumps(agent))
" | while IFS= read -r AGENT_JSON; do
  NAME=$(echo "$AGENT_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['name'])")
  RESULT=$(curl -s -X POST "$API/agents" -H "$AUTH" -H "$CT" -d "$AGENT_JSON")
  AID=$(echo "$RESULT" | python3 -c "import sys,json; print(json.loads(sys.stdin.read(), strict=False).get('id','error'))" 2>/dev/null)
  echo "  $NAME: $AID"
done

# Create and dispatch tasks
echo ""
echo "[2] Creating and dispatching tasks..."

# Get agent name->id mapping
AGENTS_MAP=$(curl -s "$API/agents" -H "$AUTH" | python3 -c "
import sys,json
agents = json.loads(sys.stdin.read(), strict=False)
for a in agents:
    print(f\"{a['name']}={a['id']}\")
")

echo "$WF" | python3 -c "
import sys, json
wf = json.load(sys.stdin)
for task in wf['initial_tasks']:
    print(json.dumps(task))
" | while IFS= read -r TASK_JSON; do
  TITLE=$(echo "$TASK_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['title'])")
  AGENT_NAME=$(echo "$TASK_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('agent',''))")
  PRIORITY=$(echo "$TASK_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('priority','normal'))")
  DESC=$(echo "$TASK_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('description',''))")

  # Find agent ID
  AGENT_ID=$(echo "$AGENTS_MAP" | grep "^$AGENT_NAME=" | head -1 | cut -d= -f2)

  if [ -z "$AGENT_ID" ]; then
    echo "  WARNING: Agent '$AGENT_NAME' not found, creating task unassigned"
    TASK_BODY=$(python3 -c "import json; print(json.dumps({'title': '''$TITLE''', 'description': '''$DESC''', 'priority': '$PRIORITY', 'status': 'inbox'}))")
  else
    TASK_BODY=$(python3 -c "import json; print(json.dumps({'title': '''$TITLE''', 'description': '''$DESC''', 'priority': '$PRIORITY', 'assigned_agent_id': '$AGENT_ID', 'status': 'assigned'}))")
  fi

  RESULT=$(curl -s -X POST "$API/tasks" -H "$AUTH" -H "$CT" -d "$TASK_BODY")
  TID=$(echo "$RESULT" | python3 -c "import sys,json; print(json.loads(sys.stdin.read(), strict=False).get('id','error'))" 2>/dev/null)
  echo "  $TITLE -> $TID"

  # Dispatch if assigned
  if [ -n "$AGENT_ID" ]; then
    curl -s -X POST "$API/tasks/$TID/dispatch" -H "$AUTH" > /dev/null
    echo "    dispatched to $AGENT_NAME"
    sleep 3
  fi
done

echo ""
echo "=== Workflow loaded ==="
echo "Dashboard: $MC_URL"
