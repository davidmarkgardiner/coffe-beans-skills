#!/usr/bin/env python3
"""
Adaptive model selection for ChatGPT based on task complexity.

Selects between GPT-4o (complex/critical tasks) and GPT-4o-mini (simple tasks)
to optimize cost and performance.
"""

import tiktoken
from typing import Literal, Optional

ModelType = Literal["gpt-4o", "gpt-4o-mini"]


class AdaptiveModelSelector:
    """Selects appropriate GPT model based on task characteristics"""

    # Complexity thresholds
    TOKEN_THRESHOLD = 2000  # Use GPT-4o for prompts > 2000 tokens
    CODE_LINES_THRESHOLD = 500  # Use GPT-4o for >500 lines of code
    FILE_COUNT_THRESHOLD = 10  # Use GPT-4o for >10 files

    # Model costs (per 1K tokens)
    COSTS = {
        "gpt-4o": {"input": 0.005, "output": 0.015},
        "gpt-4o-mini": {"input": 0.00015, "output": 0.00060},
    }

    def __init__(self):
        """Initialize the model selector with tiktoken encoding"""
        try:
            self.encoding = tiktoken.encoding_for_model("gpt-4o")
        except Exception:
            # Fallback to cl100k_base if model-specific encoding not found
            self.encoding = tiktoken.get_encoding("cl100k_base")

    def select_model(
        self,
        prompt: str = "",
        code_context: str = "",
        file_count: int = 0,
        is_review: bool = False,
        force_model: Optional[ModelType] = None,
    ) -> ModelType:
        """
        Select appropriate model based on task complexity.

        Args:
            prompt: User prompt/specification text
            code_context: Code being reviewed/analyzed
            file_count: Number of files involved in the task
            is_review: Whether this is a code review task (always uses GPT-4o)
            force_model: Override auto-selection with specific model

        Returns:
            ModelType: "gpt-4o" or "gpt-4o-mini"
        """
        # Force model if specified
        if force_model:
            return force_model

        # Always use GPT-4o for code reviews (quality critical)
        if is_review:
            return "gpt-4o"

        # Check token count
        combined_text = f"{prompt}\n{code_context}"
        token_count = len(self.encoding.encode(combined_text))

        if token_count > self.TOKEN_THRESHOLD:
            return "gpt-4o"

        # Check code complexity (lines of code)
        if code_context:
            line_count = len(code_context.split("\n"))
            if line_count > self.CODE_LINES_THRESHOLD:
                return "gpt-4o"

        # Check file count
        if file_count > self.FILE_COUNT_THRESHOLD:
            return "gpt-4o"

        # Default to mini for simple tasks
        return "gpt-4o-mini"

    def get_model_config(self, model: ModelType) -> dict:
        """
        Get configuration for selected model.

        Args:
            model: The model to get config for

        Returns:
            dict: Model configuration with temperature, max_tokens, etc.
        """
        configs = {
            "gpt-4o": {
                "model": "gpt-4o",
                "temperature": 0.2,
                "max_tokens": 16000,
                "top_p": 0.95,
            },
            "gpt-4o-mini": {
                "model": "gpt-4o-mini",
                "temperature": 0.3,
                "max_tokens": 8000,
                "top_p": 0.95,
            },
        }
        return configs[model]

    def estimate_cost(
        self, model: ModelType, input_tokens: int, output_tokens: int
    ) -> float:
        """
        Estimate cost for using a model.

        Args:
            model: The model to estimate cost for
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens

        Returns:
            float: Estimated cost in USD
        """
        costs = self.COSTS[model]
        input_cost = (input_tokens / 1000) * costs["input"]
        output_cost = (output_tokens / 1000) * costs["output"]
        return input_cost + output_cost

    def count_tokens(self, text: str) -> int:
        """
        Count tokens in text.

        Args:
            text: Text to count tokens in

        Returns:
            int: Number of tokens
        """
        return len(self.encoding.encode(text))


def main():
    """Example usage"""
    selector = AdaptiveModelSelector()

    # Example 1: Simple task
    model1 = selector.select_model(
        prompt="Add a button to the homepage", code_context="", file_count=1
    )
    print(f"Example 1 (simple): {model1}")

    # Example 2: Complex task
    model2 = selector.select_model(
        prompt="Refactor authentication system",
        code_context="x" * 1000,  # Large codebase
        file_count=15,
    )
    print(f"Example 2 (complex): {model2}")

    # Example 3: Code review (always GPT-4o)
    model3 = selector.select_model(
        prompt="Review this PR", code_context="small", file_count=2, is_review=True
    )
    print(f"Example 3 (review): {model3}")

    # Cost estimation
    cost = selector.estimate_cost("gpt-4o", input_tokens=3000, output_tokens=800)
    print(f"\nEstimated cost for GPT-4o (3K in, 800 out): ${cost:.4f}")

    cost_mini = selector.estimate_cost(
        "gpt-4o-mini", input_tokens=3000, output_tokens=800
    )
    print(f"Estimated cost for GPT-4o-mini (3K in, 800 out): ${cost_mini:.4f}")
    print(f"Savings with mini: ${cost - cost_mini:.4f} ({(1 - cost_mini/cost)*100:.1f}%)")


if __name__ == "__main__":
    main()
