#!/usr/bin/env python3
"""
Load environment variables from .env file.

This module provides a simple way to load .env files without external dependencies.
"""

import os
import sys
from pathlib import Path
from typing import Dict, Optional


def find_env_file() -> Optional[Path]:
    """
    Find .env file by checking current dir, parent, and git root.

    Returns:
        Path to .env file, or None if not found
    """
    # Check current directory
    current = Path.cwd()
    if (current / ".env").exists():
        return current / ".env"

    # Check parent directory
    if (current.parent / ".env").exists():
        return current.parent / ".env"

    # Check git root
    try:
        import subprocess

        result = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            capture_output=True,
            text=True,
            check=True,
        )
        git_root = Path(result.stdout.strip())
        if (git_root / ".env").exists():
            return git_root / ".env"
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass

    return None


def parse_env_line(line: str) -> Optional[tuple[str, str]]:
    """
    Parse a line from .env file.

    Args:
        line: Line from .env file

    Returns:
        Tuple of (key, value) or None if line should be skipped
    """
    # Strip whitespace
    line = line.strip()

    # Skip empty lines and comments
    if not line or line.startswith("#"):
        return None

    # Find equals sign
    if "=" not in line:
        return None

    # Split on first equals
    key, value = line.split("=", 1)
    key = key.strip()
    value = value.strip()

    # Remove quotes if present
    if value.startswith('"') and value.endswith('"'):
        value = value[1:-1]
    elif value.startswith("'") and value.endswith("'"):
        value = value[1:-1]

    return key, value


def load_env(env_file: Optional[Path] = None, override: bool = True) -> Dict[str, str]:
    """
    Load environment variables from .env file.

    Args:
        env_file: Path to .env file (auto-detected if None)
        override: Whether to override existing environment variables

    Returns:
        Dict of loaded environment variables
    """
    if env_file is None:
        env_file = find_env_file()

    if env_file is None:
        print("⚠️  No .env file found", file=sys.stderr)
        print("   Create one from .env.example:", file=sys.stderr)
        print("   cp .env.example .env", file=sys.stderr)
        return {}

    print(f"📝 Loading environment from: {env_file}", file=sys.stderr)

    loaded = {}

    try:
        with open(env_file, "r") as f:
            for line in f:
                parsed = parse_env_line(line)
                if parsed:
                    key, value = parsed

                    # Set in os.environ if override or not already set
                    if override or key not in os.environ:
                        os.environ[key] = value
                        loaded[key] = value

    except Exception as e:
        print(f"❌ Error loading .env: {e}", file=sys.stderr)
        return {}

    print(f"✅ Environment loaded ({len(loaded)} variables)", file=sys.stderr)
    return loaded


def verify_api_keys() -> bool:
    """
    Verify that required API keys are set.

    Returns:
        True if all required keys present, False otherwise
    """
    required_keys = [
        "OPENAI_API_KEY",
        "ANTHROPIC_API_KEY",
        "GEMINI_API_KEY",
    ]

    missing = [key for key in required_keys if not os.getenv(key)]

    if missing:
        print("❌ Missing required API keys:", file=sys.stderr)
        for key in missing:
            print(f"   - {key}", file=sys.stderr)
        print("", file=sys.stderr)
        print("   Please set these in your .env file", file=sys.stderr)
        return False

    print("✅ All required API keys present", file=sys.stderr)
    return True


def get_api_key(service: str, required: bool = True) -> Optional[str]:
    """
    Get API key for a service.

    Args:
        service: Service name (openai, anthropic, gemini, etc.)
        required: Whether the key is required

    Returns:
        API key or None if not found

    Raises:
        ValueError: If key is required but not found
    """
    key_name = f"{service.upper()}_API_KEY"
    key = os.getenv(key_name)

    if required and not key:
        raise ValueError(f"{key_name} not set. Please add it to your .env file.")

    return key


# Auto-load .env when module is imported
if __name__ != "__main__":
    load_env()


def main():
    """Command-line interface"""
    import argparse

    parser = argparse.ArgumentParser(description="Load environment variables from .env")
    parser.add_argument("--verify", action="store_true", help="Verify required API keys")
    parser.add_argument("--show", action="store_true", help="Show loaded variables (keys only)")

    args = parser.parse_args()

    loaded = load_env()

    if args.show:
        print("\nLoaded environment variables:")
        for key in sorted(loaded.keys()):
            # Mask API keys
            if "KEY" in key or "SECRET" in key or "TOKEN" in key:
                value = "***" + loaded[key][-4:] if len(loaded[key]) > 4 else "***"
            else:
                value = loaded[key]
            print(f"  {key}={value}")

    if args.verify:
        verify_api_keys()
        sys.exit(0 if verify_api_keys() else 1)


if __name__ == "__main__":
    main()
