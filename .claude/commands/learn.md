# Skill Learning Command

Extract lessons from completed work and automatically update relevant skills.

## What This Command Does

1. **Analyze completed work** - Code changes, agent outputs, review feedback
2. **Detect patterns** - Successful approaches and reusable solutions
3. **Identify gotchas** - Pitfalls and issues encountered
4. **Extract solutions** - How problems were solved
5. **Update skills** - Add lessons to relevant skills
6. **Auto-commit** - Commit skill updates to git

## Execution Steps

### 1. Navigate to Skill Learner Scripts

```bash
cd .claude/skills/orchestration-system/scripts
```

### 2. Collect Orchestration Artifacts

```bash
echo "📚 Collecting orchestration artifacts..."

# Find specification used
SPEC_FILE=$(ls -t ../../../specs/*.md 2>/dev/null | head -1)

# Collect agent outputs
CLAUDE_OUTPUT=$(cat ../../../orchestration-outputs/claude-agent.json 2>/dev/null || echo '{}')
GEMINI_OUTPUT=$(cat ../../../orchestration-outputs/gemini-agent.json 2>/dev/null || echo '{}')

# Collect review feedback
REVIEW_OUTPUT=$(cat review-result.json 2>/dev/null || echo '{}')

# Collect test results
TEST_RESULTS=$(cat test-results.json 2>/dev/null || echo '{}')

# Get iteration count
ITERATION_COUNT=$(cat ../../../orchestration-outputs/iteration-count.txt 2>/dev/null || echo "1")

echo "Artifacts collected:"
echo "  Spec: $SPEC_FILE"
echo "  Claude output: $(echo $CLAUDE_OUTPUT | jq -r '.files_modified | length // 0') files"
echo "  Gemini output: $(echo $GEMINI_OUTPUT | jq -r '.integration_code | length // 0') integrations"
echo "  Review score: $(echo $REVIEW_OUTPUT | jq -r '.score // "N/A"')"
echo "  Iterations: $ITERATION_COUNT"
```

### 3. Extract Lessons

```bash
echo "🔍 Extracting lessons learned..."

# Run lesson extraction script
python3 extract_lessons.py \
  --spec "$SPEC_FILE" \
  --claude-output "$CLAUDE_OUTPUT" \
  --gemini-output "$GEMINI_OUTPUT" \
  --review "$REVIEW_OUTPUT" \
  --tests "$TEST_RESULTS" \
  --iterations "$ITERATION_COUNT" \
  --output lessons.json

if [ $? -ne 0 ]; then
  echo "❌ Lesson extraction failed"
  exit 1
fi

echo "✅ Lessons extracted"
```

### 4. Display Lessons

```bash
echo ""
echo "📊 Lessons Learned Summary:"
cat lessons.json | jq '.'

# Extract counts
PATTERNS_COUNT=$(cat lessons.json | jq '.patterns_detected | length')
GOTCHAS_COUNT=$(cat lessons.json | jq '.gotchas | length')
SOLUTIONS_COUNT=$(cat lessons.json | jq '.solutions | length')
TEST_PATTERNS_COUNT=$(cat lessons.json | jq '.test_patterns | length')
PERFORMANCE_TIPS_COUNT=$(cat lessons.json | jq '.performance_tips | length')

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 LESSONS SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Display patterns
if [ $PATTERNS_COUNT -gt 0 ]; then
  echo ""
  echo "✨ Patterns Detected ($PATTERNS_COUNT):"
  cat lessons.json | jq -r '.patterns_detected[] | "  • \(.)"'
fi

# Display gotchas
if [ $GOTCHAS_COUNT -gt 0 ]; then
  echo ""
  echo "⚠️ Gotchas Identified ($GOTCHAS_COUNT):"
  cat lessons.json | jq -r '.gotchas[] | "  • \(.)"'
fi

# Display solutions
if [ $SOLUTIONS_COUNT -gt 0 ]; then
  echo ""
  echo "💡 Solutions Found ($SOLUTIONS_COUNT):"
  cat lessons.json | jq -r '.solutions[] | "  • \(.)"'
fi

# Display test patterns
if [ $TEST_PATTERNS_COUNT -gt 0 ]; then
  echo ""
  echo "🧪 Test Patterns ($TEST_PATTERNS_COUNT):"
  cat lessons.json | jq -r '.test_patterns[] | "  • \(.)"'
fi

# Display performance tips
if [ $PERFORMANCE_TIPS_COUNT -gt 0 ]; then
  echo ""
  echo "⚡ Performance Tips ($PERFORMANCE_TIPS_COUNT):"
  cat lessons.json | jq -r '.performance_tips[] | "  • \(.)"'
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

### 5. Identify Skills to Update

```bash
echo ""
echo "🎯 Identifying skills to update..."

# Determine which skills should be updated based on lessons
SKILLS_TO_UPDATE=$(cat lessons.json | jq -r '.skills_to_update[]')

echo "Skills to update:"
echo "$SKILLS_TO_UPDATE" | while read skill; do
  echo "  • $skill"
done
```

### 6. Update Skills

```bash
echo ""
echo "📝 Updating skills..."

# Update each identified skill
echo "$SKILLS_TO_UPDATE" | while read skill; do
  echo "Updating $skill..."

  python3 update_skill.py \
    --skill "$skill" \
    --lessons lessons.json \
    --verbose

  if [ $? -eq 0 ]; then
    echo "  ✅ $skill updated"
  else
    echo "  ❌ Failed to update $skill"
  fi
done

echo ""
echo "✅ All skills updated"
```

### 7. Store in Lessons Database

```bash
echo ""
echo "💾 Storing in lessons database..."

# Append to lessons database
LESSON_ID="lesson-$(date +%s)"

cat lessons.json | jq --arg id "$LESSON_ID" --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  '. + {lesson_id: $id, timestamp: $ts}' \
  >> ../../skill-learner/lessons_db.json

echo "Stored as $LESSON_ID"
```

### 8. Auto-Commit Skill Updates

```bash
echo ""
echo "📤 Committing skill updates..."

cd ../../../

# Stage skill changes
git add .claude/skills/

# Check if there are changes to commit
if git diff --cached --quiet; then
  echo "No skill changes to commit"
else
  # Create commit message
  FEATURE_NAME=$(basename "$SPEC_FILE" .md)

  git commit -m "learn: update skills from $FEATURE_NAME orchestration

Patterns: $PATTERNS_COUNT detected
Gotchas: $GOTCHAS_COUNT documented
Solutions: $SOLUTIONS_COUNT added
Test Patterns: $TEST_PATTERNS_COUNT captured
Performance Tips: $PERFORMANCE_TIPS_COUNT added

Quality Score: $(echo $REVIEW_OUTPUT | jq -r '.score')/100
Iterations: $ITERATION_COUNT

Skills updated:
$(echo "$SKILLS_TO_UPDATE" | sed 's/^/- /')

Lesson ID: $LESSON_ID"

  echo "✅ Skills committed to git"

  # Display commit hash
  COMMIT_HASH=$(git rev-parse --short HEAD)
  echo "Commit: $COMMIT_HASH"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ LEARNING COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

## Lesson Categories

### Patterns Detected
Successful implementation approaches that worked well:
- Component structure patterns
- State management strategies
- API integration patterns
- Error handling approaches

### Gotchas Identified
Issues and pitfalls encountered:
- Configuration requirements (e.g., CORS for Firebase Storage)
- API rate limits and quotas
- Browser compatibility issues
- Timing/race condition problems

### Solutions Found
How problems were solved:
- Specific code solutions
- Configuration changes
- Library usage patterns
- Workarounds for limitations

### Test Patterns
Testing strategies that proved effective:
- Mocking strategies
- Test data fixtures
- E2E test patterns
- Performance testing approaches

### Performance Tips
Optimizations discovered:
- Caching strategies
- Lazy loading patterns
- Bundle size optimizations
- API call optimizations

## Skills Typically Updated

Based on task type, these skills are commonly updated:

| Task Type | Skills Updated |
|-----------|---------------|
| Frontend work | premium-coffee-website, firebase-coffee-integration |
| Google integrations | ai-content-manager, gemini-google-agent |
| Payments | stripe-integration |
| Testing | webapp-testing |
| Orchestration | orchestration-system |

## Lessons Database

All lessons are stored in `.claude/skills/skill-learner/lessons_db.json`:

```json
{
  "lesson_id": "lesson-1732453200",
  "timestamp": "2025-11-24T10:50:00Z",
  "feature": "user-profiles",
  "quality_score": 87,
  "iterations": 2,
  "patterns_detected": [...],
  "gotchas": [...],
  "solutions": [...],
  "test_patterns": [...],
  "performance_tips": [...],
  "skills_updated": ["firebase-coffee-integration", "premium-coffee-website"]
}
```

## Output Format

Returns JSON with extracted lessons:

```json
{
  "patterns_detected": [
    "Avatar upload with Firebase Storage requires CORS configuration",
    "Image optimization with Gemini API works best with 1024x1024 resolution"
  ],
  "gotchas": [
    "Firebase Storage upload progress events need debouncing",
    "Gemini API rate limits: 60 requests/minute"
  ],
  "solutions": [
    "Use React Query for upload state management",
    "Implement exponential backoff for Gemini API calls"
  ],
  "test_patterns": [
    "Mock Firebase Storage in E2E tests using Playwright interceptors",
    "Use fixture data for Gemini API responses"
  ],
  "performance_tips": [
    "Lazy load avatar images with Intersection Observer",
    "Cache Gemini-optimized images in Firebase Storage"
  ],
  "skills_to_update": [
    "firebase-coffee-integration",
    "ai-content-manager",
    "premium-coffee-website"
  ]
}
```

## Error Handling

- **No artifacts found**: Report that nothing to learn from
- **Extraction fails**: Log error, don't update skills
- **Skill update fails**: Continue with other skills, report failures
- **Git commit fails**: Report issue but don't fail (manual commit needed)

## Integration with Orchestration

This command is called automatically after successful deployment:

```bash
# In orchestration workflow
/test-production # If pass →
/learn           # Extract and save lessons
```

## Manual Usage

You can run this command manually anytime:

```bash
/learn
```

## Tips

- Run after every successful orchestration
- Review lessons database periodically for trends
- Skills improve over time with more lessons
- Lessons help avoid repeating mistakes
- Patterns become reusable templates

## Disabling Auto-Commit

If you want to review skill changes before committing:

```bash
# Set environment variable
export SKILL_LEARNING_AUTO_COMMIT=false

# Then run /learn
/learn

# Review changes
git diff .claude/skills/

# Commit manually if satisfied
git commit -m "learn: manual review and commit"
```

---

**Now execute the skill learning pipeline as described above.**
