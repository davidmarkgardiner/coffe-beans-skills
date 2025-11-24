# Quality Review Command

Trigger ChatGPT quality review of current changes with adaptive model selection.

## What This Command Does

1. **Collect changes** - Git diff of staged/recent changes
2. **Collect test results** - Local, preview, and production test outputs
3. **Call ChatGPT** - Adaptive model selection based on complexity
4. **Score implementation** - 0-100 across 6 categories
5. **Provide feedback** - Suggestions, critical issues, warnings

## Execution Steps

### 1. Navigate to Orchestration Scripts

```bash
cd .claude/skills/orchestration-system/scripts
```

### 2. Collect Code Changes

```bash
echo "📝 Collecting code changes..."

# Get git diff (staged + unstaged)
git diff HEAD > changes.diff

# Get list of modified files
git diff --name-only HEAD > modified-files.txt

# Count files and lines changed
FILE_COUNT=$(wc -l < modified-files.txt)
LINES_CHANGED=$(wc -l < changes.diff)

echo "Files modified: $FILE_COUNT"
echo "Lines changed: $LINES_CHANGED"

# Create changes summary
cat > code-changes.json << EOF
{
  "files_modified": $(cat modified-files.txt | jq -R . | jq -s .),
  "file_count": $FILE_COUNT,
  "lines_changed": $LINES_CHANGED,
  "diff": $(cat changes.diff | jq -R . | jq -s . | jq 'join("\n")')
}
EOF
```

### 3. Collect Test Results

```bash
echo "🧪 Collecting test results..."

# Aggregate all test results
cat > test-results.json << EOF
{
  "local": $(cat ../../coffee-website-react/local-test-results.json 2>/dev/null || echo '{}'),
  "preview": $(cat ../../coffee-website-react/preview-test-results.json 2>/dev/null || echo '{}'),
  "production": $(cat ../../coffee-website-react/production-test-results.json 2>/dev/null || echo '{}')
}
EOF

echo "Test results collected"
```

### 4. Read Original Specification

```bash
echo "📋 Reading specification..."

# Find the spec file (passed as argument or find most recent)
if [ -n "$1" ]; then
  SPEC_FILE="$1"
else
  SPEC_FILE=$(ls -t ../../specs/*.md 2>/dev/null | head -1)
fi

if [ -z "$SPEC_FILE" ]; then
  echo "⚠️ No specification file found"
  SPEC_CONTENT="No specification provided"
else
  SPEC_CONTENT=$(cat "$SPEC_FILE")
  echo "Specification: $SPEC_FILE"
fi
```

### 5. Call ChatGPT Quality Reviewer

```bash
echo "🤖 Calling ChatGPT quality reviewer..."

# Run the quality reviewer Python script
python3 chatgpt_reviewer.py \
  --spec "$SPEC_CONTENT" \
  --changes code-changes.json \
  --tests test-results.json \
  --output review-result.json

if [ $? -ne 0 ]; then
  echo "❌ Quality review failed"
  exit 1
fi

echo "✅ Review complete"
```

### 6. Parse and Display Results

```bash
echo ""
echo "📊 Quality Review Results:"
cat review-result.json | jq '.'

# Extract key metrics
SCORE=$(cat review-result.json | jq -r '.score')
MODEL_USED=$(cat review-result.json | jq -r '.model_used')
FEEDBACK=$(cat review-result.json | jq -r '.feedback')

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 QUALITY SCORE: $SCORE/100"
echo "🤖 Model Used: $MODEL_USED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Display breakdown
echo ""
echo "Score Breakdown:"
cat review-result.json | jq -r '.breakdown | to_entries[] | "  \(.key): \(.value)/\(if .key == "correctness" then 30 elif .key == "code_quality" then 25 elif .key == "testing" then 20 elif .key == "performance" then 10 elif .key == "security" then 10 else 5 end)"'

# Display feedback
echo ""
echo "Overall Feedback:"
echo "$FEEDBACK" | fold -s -w 80

# Display suggestions
SUGGESTIONS_COUNT=$(cat review-result.json | jq '.suggestions | length')
if [ $SUGGESTIONS_COUNT -gt 0 ]; then
  echo ""
  echo "Suggestions ($SUGGESTIONS_COUNT):"
  cat review-result.json | jq -r '.suggestions[] | "  • \(.)"'
fi

# Display critical issues
CRITICAL_COUNT=$(cat review-result.json | jq '.critical_issues | length')
if [ $CRITICAL_COUNT -gt 0 ]; then
  echo ""
  echo "❌ Critical Issues ($CRITICAL_COUNT):"
  cat review-result.json | jq -r '.critical_issues[] | "  ! \(.)"'
fi

# Display warnings
WARNINGS_COUNT=$(cat review-result.json | jq '.warnings | length')
if [ $WARNINGS_COUNT -gt 0 ]; then
  echo ""
  echo "⚠️ Warnings ($WARNINGS_COUNT):"
  cat review-result.json | jq -r '.warnings[] | "  • \(.)"'
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Determine next steps
if [ $(echo "$SCORE >= 85" | bc) -eq 1 ]; then
  echo "✅ APPROVED - Quality threshold met (≥85)"
  echo "   Ready for production deployment"
elif [ $(echo "$SCORE >= 70" | bc) -eq 1 ]; then
  echo "⚠️ NEEDS IMPROVEMENT - Iterate on suggestions"
  echo "   Address suggestions and re-review"
else
  echo "❌ MANUAL REVIEW REQUIRED - Score below 70"
  echo "   Significant issues detected"
fi

echo ""
```

## Quality Scoring Criteria

| Category | Max Points | Description |
|----------|------------|-------------|
| **Correctness** | 30 | Meets spec, no bugs, handles edge cases |
| **Code Quality** | 25 | Clean, maintainable, best practices |
| **Testing** | 20 | ≥70% coverage, all tests pass |
| **Performance** | 10 | No bottlenecks, optimized |
| **Security** | 10 | No vulnerabilities, secure patterns |
| **Documentation** | 5 | Clear comments, updated docs |

**Total:** 100 points

## Thresholds

- **85-100**: ✅ Auto-approve (production ready)
- **70-84**: ⚠️ Iterate (address suggestions)
- **0-69**: ❌ Manual review required

## Adaptive Model Selection

The reviewer automatically selects the appropriate ChatGPT model:

**Uses GPT-4o when:**
- Code review (always)
- Token count > 2,000
- Lines of code > 500
- File count > 10

**Uses GPT-4o-mini when:**
- Simple/small changes
- Low token count
- Few files modified

**Model costs:**
- GPT-4o: $0.005/1K input, $0.015/1K output
- GPT-4o-mini: $0.00015/1K input, $0.00060/1K output

## Output Format

Returns JSON with review results:

```json
{
  "score": 87,
  "model_used": "gpt-4o",
  "feedback": "Excellent implementation with comprehensive tests...",
  "suggestions": [
    "Consider adding loading states to avatar upload",
    "Add error boundary around UserProfile component"
  ],
  "critical_issues": [],
  "warnings": [
    "Avatar upload could benefit from progress indicator"
  ],
  "breakdown": {
    "correctness": 28,
    "code_quality": 24,
    "testing": 19,
    "performance": 9,
    "security": 10,
    "documentation": 4
  },
  "timestamp": "2025-11-24T10:45:00Z",
  "token_usage": {
    "input": 3420,
    "output": 856,
    "cost_usd": 0.03
  }
}
```

## Error Handling

- **No changes detected**: Report nothing to review
- **ChatGPT API fails**: Retry once, then report error
- **Test results missing**: Note in review that tests weren't evaluated
- **Spec file missing**: Review code changes only, note missing spec

## Integration with Orchestration

This command is called automatically after tests pass:

```bash
# In orchestration workflow
/test-local     # If pass →
/test-preview   # If pass →
/review         # Score changes

# If score < 85 and iterations < 3:
# → Create fix spec from suggestions
# → Re-spawn agents
# → Re-test
# → /review again
```

## Manual Usage

You can run this command manually anytime:

```bash
/review [path/to/spec.md]
```

If no spec provided, uses most recent spec from `specs/` directory.

## Tips

- Run after completing feature development
- Address critical issues first, then suggestions
- Review token usage to optimize costs
- Save review-result.json for documentation
- Use feedback to improve future implementations

---

**Now execute the quality review pipeline as described above.**
