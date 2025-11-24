#!/usr/bin/env python3
"""
ChatGPT-powered quality reviewer with adaptive model selection.

Reviews code changes against specifications and test results,
providing scored feedback (0-100) and actionable suggestions.
"""

import json
import os
import sys
from typing import Dict, Any, Optional
from datetime import datetime

# Load environment variables from .env
from load_env import load_env, get_api_key
load_env()

try:
    from openai import OpenAI
except ImportError:
    print("Error: openai package not installed. Run: pip install openai")
    sys.exit(1)

from adaptive_model import AdaptiveModelSelector, ModelType


class QualityReviewer:
    """Reviews code quality and provides scored feedback"""

    # Scoring weights
    SCORING_WEIGHTS = {
        "correctness": 30,
        "code_quality": 25,
        "testing": 20,
        "performance": 10,
        "security": 10,
        "documentation": 5,
    }

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the quality reviewer.

        Args:
            api_key: OpenAI API key (uses OPENAI_API_KEY from .env if not provided)
        """
        self.api_key = api_key or get_api_key("openai", required=True)

        self.client = OpenAI(api_key=self.api_key)
        self.selector = AdaptiveModelSelector()

    def review(
        self,
        specification: str,
        code_changes: Dict[str, Any],
        test_results: Dict[str, Any],
        force_model: Optional[ModelType] = None,
        iteration_number: int = 1,
    ) -> Dict[str, Any]:
        """
        Review code quality with adaptive model selection.

        Args:
            specification: Feature specification/requirements
            code_changes: Dict with code changes (files, diff, etc.)
            test_results: Dict with test results (local, preview, production)
            force_model: Force specific model (overrides adaptive selection)
            iteration_number: Current iteration number (for context)

        Returns:
            dict: Review results with score, feedback, suggestions, etc.
        """
        # Prepare code context for model selection
        code_context = self._prepare_code_context(code_changes)
        file_count = code_changes.get("file_count", 0)

        # Select appropriate model
        model = self.selector.select_model(
            prompt=specification,
            code_context=code_context,
            file_count=file_count,
            is_review=True,  # Always use GPT-4o for reviews
            force_model=force_model,
        )

        config = self.selector.get_model_config(model)

        print(f"Using model: {model}")

        # Build review prompt
        prompt = self._build_review_prompt(
            specification, code_changes, test_results, iteration_number
        )

        # Count tokens for cost estimation
        input_tokens = self.selector.count_tokens(
            self._get_system_prompt() + prompt
        )

        # Call ChatGPT
        try:
            response = self.client.chat.completions.create(
                model=config["model"],
                messages=[
                    {"role": "system", "content": self._get_system_prompt()},
                    {"role": "user", "content": prompt},
                ],
                temperature=config["temperature"],
                max_tokens=config["max_tokens"],
                top_p=config["top_p"],
                response_format={"type": "json_object"},
            )

            # Parse review
            review_content = response.choices[0].message.content
            review = json.loads(review_content)

            # Add metadata
            output_tokens = response.usage.completion_tokens
            review["model_used"] = model
            review["timestamp"] = datetime.utcnow().isoformat() + "Z"
            review["iteration_number"] = iteration_number
            review["token_usage"] = {
                "input": input_tokens,
                "output": output_tokens,
                "total": input_tokens + output_tokens,
                "cost_usd": round(
                    self.selector.estimate_cost(model, input_tokens, output_tokens), 4
                ),
            }

            # Validate score breakdown
            review = self._validate_review(review)

            return review

        except Exception as e:
            print(f"Error calling ChatGPT API: {e}")
            return self._create_error_review(str(e))

    def _get_system_prompt(self) -> str:
        """System prompt for quality reviewer"""
        return """You are an expert code reviewer specializing in production-ready web applications.

Review the code changes against the specification and test results.

Score the implementation on a scale of 0-100 based on:
- **Correctness** (30 points): Meets specification, no bugs, handles edge cases gracefully
- **Code Quality** (25 points): Clean, maintainable, follows best practices, proper abstractions
- **Testing** (20 points): Comprehensive test coverage (≥70%), all tests pass, includes E2E tests
- **Performance** (10 points): Efficient algorithms, no obvious bottlenecks, optimized renders
- **Security** (10 points): No vulnerabilities, secure patterns, proper input validation
- **Documentation** (5 points): Clear comments, updated docs, component documentation

Provide your review as JSON:
{
    "score": <0-100>,
    "feedback": "<overall assessment in 2-3 sentences>",
    "suggestions": ["<specific improvement>", ...],
    "critical_issues": ["<must-fix issue>", ...],
    "warnings": ["<should-fix issue>", ...],
    "breakdown": {
        "correctness": <0-30>,
        "code_quality": <0-25>,
        "testing": <0-20>,
        "performance": <0-10>,
        "security": <0-10>,
        "documentation": <0-5>
    }
}

Be thorough but fair. Score 85+ indicates production-ready code.

Scoring guidelines:
- **85-100**: ✅ Production ready, well-tested, maintainable
- **70-84**: ⚠️ Good foundation but needs improvements
- **0-69**: ❌ Significant issues requiring attention"""

    def _build_review_prompt(
        self,
        spec: str,
        changes: Dict[str, Any],
        tests: Dict[str, Any],
        iteration: int,
    ) -> str:
        """Build review prompt with all context"""
        prompt = f"""# Review Request (Iteration {iteration})

## Specification
{spec}

## Code Changes
Files modified: {changes.get('file_count', 0)}
Lines changed: {changes.get('lines_changed', 0)}

{self._format_code_changes(changes)}

## Test Results
{self._format_test_results(tests)}

Please review this implementation and provide a scored assessment."""

        return prompt

    def _format_code_changes(self, changes: Dict[str, Any]) -> str:
        """Format code changes for prompt"""
        output = []

        if "files_modified" in changes:
            output.append("### Modified Files")
            for file in changes["files_modified"]:
                output.append(f"- {file}")

        if "diff" in changes:
            output.append("\n### Code Diff (sample)")
            diff = changes["diff"]
            # Truncate if too long
            if len(diff) > 3000:
                diff = diff[:3000] + "\n... (truncated)"
            output.append(f"```diff\n{diff}\n```")

        return "\n".join(output)

    def _format_test_results(self, tests: Dict[str, Any]) -> str:
        """Format test results for prompt"""
        output = []

        for test_type, results in tests.items():
            if not results:
                continue

            output.append(f"### {test_type.title()} Tests")

            if test_type == "local":
                output.append(f"- Lint: {results.get('lint', 'unknown')}")
                output.append(f"- Build: {results.get('build', 'unknown')}")

                unit = results.get("unit_tests", {})
                output.append(
                    f"- Unit Tests: {unit.get('passed', 0)}/{unit.get('total', 0)} passed"
                )
                output.append(f"  Coverage: {unit.get('coverage', 0)}%")

                e2e = results.get("e2e_tests", {})
                output.append(
                    f"- E2E Tests: {e2e.get('passed', 0)}/{e2e.get('total', 0)} passed"
                )

            elif test_type == "preview":
                e2e = results.get("e2e_tests", {})
                output.append(
                    f"- E2E Tests: {e2e.get('passed', 0)}/{e2e.get('total', 0)} passed"
                )

                lighthouse = results.get("lighthouse", {})
                if lighthouse:
                    output.append(
                        f"- Lighthouse Performance: {lighthouse.get('performance', 0)}"
                    )
                    output.append(
                        f"- Lighthouse Accessibility: {lighthouse.get('accessibility', 0)}"
                    )

            elif test_type == "production":
                smoke = results.get("smoke_tests", {})
                output.append(
                    f"- Smoke Tests: {smoke.get('passed', 0)}/{smoke.get('total', 0)} passed"
                )

                monitoring = results.get("monitoring", {})
                if monitoring:
                    output.append(
                        f"- Error Rate: {monitoring.get('error_rate', 0):.4f}"
                    )

        return "\n".join(output) if output else "No test results available"

    def _prepare_code_context(self, changes: Dict[str, Any]) -> str:
        """Extract code for context sizing"""
        context = changes.get("diff", "")
        return context

    def _validate_review(self, review: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and fix review structure"""
        # Ensure breakdown exists and sums correctly
        if "breakdown" not in review:
            review["breakdown"] = {}

        breakdown = review["breakdown"]

        # Set defaults for missing categories
        for category, max_points in self.SCORING_WEIGHTS.items():
            if category not in breakdown:
                breakdown[category] = 0

        # Recalculate total score from breakdown
        calculated_score = sum(breakdown.values())
        review["score"] = calculated_score

        # Ensure lists exist
        for key in ["suggestions", "critical_issues", "warnings"]:
            if key not in review:
                review[key] = []

        # Ensure feedback exists
        if "feedback" not in review:
            review["feedback"] = "Review completed"

        return review

    def _create_error_review(self, error_message: str) -> Dict[str, Any]:
        """Create error review when API call fails"""
        return {
            "score": 0,
            "model_used": "error",
            "feedback": f"Review failed: {error_message}",
            "suggestions": [],
            "critical_issues": [f"API Error: {error_message}"],
            "warnings": [],
            "breakdown": {
                category: 0 for category in self.SCORING_WEIGHTS.keys()
            },
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "iteration_number": 0,
            "token_usage": {"input": 0, "output": 0, "total": 0, "cost_usd": 0.0},
        }


def main():
    """Command-line interface for quality reviewer"""
    import argparse

    parser = argparse.ArgumentParser(description="ChatGPT Quality Reviewer")
    parser.add_argument("--spec", required=True, help="Specification text or file path")
    parser.add_argument(
        "--changes", required=True, help="Code changes JSON file path"
    )
    parser.add_argument(
        "--tests", required=True, help="Test results JSON file path"
    )
    parser.add_argument("--output", help="Output file path (default: stdout)")
    parser.add_argument("--model", choices=["gpt-4o", "gpt-4o-mini"], help="Force specific model")
    parser.add_argument("--iteration", type=int, default=1, help="Iteration number")

    args = parser.parse_args()

    # Read specification
    if os.path.isfile(args.spec):
        with open(args.spec) as f:
            spec = f.read()
    else:
        spec = args.spec

    # Read code changes
    with open(args.changes) as f:
        changes = json.load(f)

    # Read test results
    with open(args.tests) as f:
        tests = json.load(f)

    # Create reviewer
    reviewer = QualityReviewer()

    # Run review
    print("Running quality review...")
    review = reviewer.review(
        specification=spec,
        code_changes=changes,
        test_results=tests,
        force_model=args.model,
        iteration_number=args.iteration,
    )

    # Output results
    review_json = json.dumps(review, indent=2)

    if args.output:
        with open(args.output, "w") as f:
            f.write(review_json)
        print(f"Review saved to {args.output}")
    else:
        print(review_json)

    # Print summary to stderr for visibility
    print(f"\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", file=sys.stderr)
    print(f"Score: {review['score']}/100", file=sys.stderr)
    print(f"Model: {review['model_used']}", file=sys.stderr)
    print(f"Cost: ${review['token_usage']['cost_usd']}", file=sys.stderr)
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", file=sys.stderr)

    # Exit code based on score
    if review["score"] >= 85:
        sys.exit(0)  # Success
    else:
        sys.exit(1)  # Needs improvement


if __name__ == "__main__":
    main()
