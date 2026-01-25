#!/usr/bin/env python3
"""
Task breakdown script using ChatGPT.

Analyzes specifications and breaks them down into frontend (Claude)
and Google integration (Gemini) tasks with dependencies.
"""

import json
import os
import sys
from typing import Dict, Any, Optional

# Load environment variables from .env
from load_env import load_env, get_api_key
load_env()

try:
    from openai import OpenAI
except ImportError:
    print("Error: openai package not installed. Run: pip install openai")
    sys.exit(1)


class TaskBreakdown:
    """Breaks down specifications into tasks for agents"""

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize task breakdown.

        Args:
            api_key: OpenAI API key (uses OPENAI_API_KEY from .env if not provided)
        """
        self.api_key = api_key or get_api_key("openai", required=True)

        self.client = OpenAI(api_key=self.api_key)

    def break_down(self, specification: str) -> Dict[str, Any]:
        """
        Break down specification into tasks.

        Args:
            specification: Feature specification text

        Returns:
            dict: Tasks breakdown with frontend_tasks, google_tasks, dependencies
        """
        prompt = self._build_prompt(specification)

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Use mini for task breakdown
                messages=[
                    {"role": "system", "content": self._get_system_prompt()},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                max_tokens=4000,
                response_format={"type": "json_object"},
            )

            # Parse response
            content = response.choices[0].message.content
            breakdown = json.loads(content)

            # Add execution strategy
            breakdown = self._add_execution_strategy(breakdown)

            return breakdown

        except Exception as e:
            print(f"Error calling ChatGPT API: {e}", file=sys.stderr)
            return self._create_error_breakdown(str(e))

    def _get_system_prompt(self) -> str:
        """System prompt for task breakdown"""
        return """You are a technical architect breaking down feature specifications into tasks.

Categorize tasks as:
- **frontend**: UI components, React code, styling, state management, forms
- **google**: Google API integrations (Gemini, Veo, Maps, Search, etc.)

For each task, provide:
- id: Unique identifier (e.g., "f1", "f2", "g1")
- description: Clear, actionable task description
- dependencies: List of task IDs this task depends on (empty if none)
- skills: Relevant Claude Code skills to use
- estimated_complexity: "low", "medium", or "high"

Return JSON:
{
    "frontend_tasks": [
        {
            "id": "f1",
            "description": "...",
            "dependencies": [],
            "skills": ["premium-coffee-website", "firebase-coffee-integration"],
            "estimated_complexity": "medium"
        }
    ],
    "google_tasks": [
        {
            "id": "g1",
            "description": "...",
            "dependencies": ["f1"],
            "skills": ["ai-content-manager"],
            "estimated_complexity": "low"
        }
    ]
}

Guidelines:
- Tasks without dependencies can run in parallel
- Tasks with dependencies must run sequentially
- Break down into small, manageable tasks
- Frontend tasks typically: components, routing, state, forms, styling
- Google tasks typically: API calls, content generation, optimization"""

    def _build_prompt(self, spec: str) -> str:
        """Build breakdown prompt"""
        return f"""Break down this feature specification into tasks for a multi-AI system:

# Specification
{spec}

Analyze the requirements and create a task breakdown with:
1. Frontend tasks (React components, UI, state management)
2. Google integration tasks (Gemini API, Veo, Maps, etc.)
3. Dependencies between tasks
4. Recommended skills for each task
5. Estimated complexity

Provide the breakdown as structured JSON."""

    def _add_execution_strategy(self, breakdown: Dict[str, Any]) -> Dict[str, Any]:
        """Add execution strategy based on dependencies"""
        frontend_tasks = breakdown.get("frontend_tasks", [])
        google_tasks = breakdown.get("google_tasks", [])

        # Check if any tasks have dependencies
        has_dependencies = any(
            task.get("dependencies", [])
            for task in frontend_tasks + google_tasks
        )

        # Determine strategy
        if not frontend_tasks or not google_tasks:
            # Only one type of task
            strategy = "sequential" if has_dependencies else "parallel"
        elif has_dependencies:
            strategy = "parallel_then_sequential"
        else:
            strategy = "fully_parallel"

        breakdown["execution_strategy"] = strategy

        # Add summary
        breakdown["summary"] = {
            "total_tasks": len(frontend_tasks) + len(google_tasks),
            "frontend_count": len(frontend_tasks),
            "google_count": len(google_tasks),
            "has_dependencies": has_dependencies,
        }

        return breakdown

    def _create_error_breakdown(self, error_message: str) -> Dict[str, Any]:
        """Create error breakdown when API call fails"""
        return {
            "frontend_tasks": [],
            "google_tasks": [],
            "execution_strategy": "error",
            "summary": {
                "total_tasks": 0,
                "frontend_count": 0,
                "google_count": 0,
                "has_dependencies": False,
            },
            "error": error_message,
        }


def main():
    """Command-line interface for task breakdown"""
    import argparse

    parser = argparse.ArgumentParser(description="Task Breakdown with ChatGPT")
    parser.add_argument("spec_file", help="Specification file path")
    parser.add_argument("--output", help="Output file path (default: stdout)")
    parser.add_argument("--pretty", action="store_true", help="Pretty print JSON")

    args = parser.parse_args()

    # Read specification
    if not os.path.isfile(args.spec_file):
        print(f"Error: Spec file not found: {args.spec_file}", file=sys.stderr)
        sys.exit(1)

    with open(args.spec_file) as f:
        spec = f.read()

    # Create breakdown
    breakdown_service = TaskBreakdown()

    print("Analyzing specification...", file=sys.stderr)
    breakdown = breakdown_service.break_down(spec)

    # Output results
    indent = 2 if args.pretty else None
    breakdown_json = json.dumps(breakdown, indent=indent)

    if args.output:
        with open(args.output, "w") as f:
            f.write(breakdown_json)
        print(f"Breakdown saved to {args.output}", file=sys.stderr)
    else:
        print(breakdown_json)

    # Print summary to stderr
    summary = breakdown.get("summary", {})
    print(f"\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", file=sys.stderr)
    print(f"Total Tasks: {summary.get('total_tasks', 0)}", file=sys.stderr)
    print(f"  Frontend: {summary.get('frontend_count', 0)}", file=sys.stderr)
    print(f"  Google: {summary.get('google_count', 0)}", file=sys.stderr)
    print(f"Execution: {breakdown.get('execution_strategy', 'unknown')}", file=sys.stderr)
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", file=sys.stderr)

    # Exit code
    if "error" in breakdown:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
