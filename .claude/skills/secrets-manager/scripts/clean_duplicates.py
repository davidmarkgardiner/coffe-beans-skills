#!/usr/bin/env python3
"""
Clean duplicate environment variables from .env files.

This script:
1. Reads a .env file
2. Detects duplicate variable definitions
3. Keeps the first occurrence and removes duplicates
4. Preserves comments and formatting
5. Creates a backup before making changes

Usage:
    python3 clean_duplicates.py <path-to-env-file>

Example:
    python3 clean_duplicates.py .env
"""

import sys
import os
from collections import OrderedDict
import shutil

def parse_env_file(file_path):
    """
    Parse .env file and detect duplicates.
    Returns (lines, duplicates) where duplicates is a dict of var_name -> [line_numbers]
    """
    lines = []
    var_occurrences = {}

    with open(file_path, 'r') as f:
        for line_num, line in enumerate(f, 1):
            lines.append(line)
            stripped = line.strip()

            # Skip empty lines and comments
            if not stripped or stripped.startswith('#'):
                continue

            # Check if it's a variable definition
            if '=' in stripped:
                var_name = stripped.split('=')[0].strip()
                if var_name not in var_occurrences:
                    var_occurrences[var_name] = []
                var_occurrences[var_name].append(line_num)

    # Find duplicates
    duplicates = {var: occurrences for var, occurrences in var_occurrences.items()
                  if len(occurrences) > 1}

    return lines, duplicates

def clean_duplicates(file_path, dry_run=False):
    """
    Remove duplicate variable definitions from .env file.
    Keeps the first occurrence and removes subsequent ones.
    """
    if not os.path.exists(file_path):
        print(f"❌ Error: File not found: {file_path}")
        return False

    lines, duplicates = parse_env_file(file_path)

    if not duplicates:
        print(f"✅ No duplicates found in {file_path}")
        return True

    print(f"🔍 Found duplicates in {file_path}:")
    for var, occurrences in duplicates.items():
        print(f"   {var}: found on lines {occurrences}")

    if dry_run:
        print("\n🔍 Dry run mode - no changes made")
        return True

    # Create backup
    backup_path = f"{file_path}.backup"
    shutil.copy2(file_path, backup_path)
    print(f"\n💾 Backup created: {backup_path}")

    # Keep track of which variables we've seen
    seen_vars = set()
    cleaned_lines = []
    removed_count = 0

    for line_num, line in enumerate(lines, 1):
        stripped = line.strip()

        # Keep empty lines and comments
        if not stripped or stripped.startswith('#'):
            cleaned_lines.append(line)
            continue

        # Check if it's a variable definition
        if '=' in stripped:
            var_name = stripped.split('=')[0].strip()

            # If we've seen this variable before, skip it
            if var_name in seen_vars:
                print(f"   🗑️  Removing duplicate {var_name} (line {line_num})")
                removed_count += 1
                continue

            seen_vars.add(var_name)

        cleaned_lines.append(line)

    # Write cleaned content back to file
    with open(file_path, 'w') as f:
        f.writelines(cleaned_lines)

    print(f"\n✅ Cleaned {removed_count} duplicate(s)")
    print(f"   Original file: {backup_path}")
    print(f"   Cleaned file: {file_path}")

    return True

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 clean_duplicates.py <path-to-env-file>")
        print("\nExample:")
        print("  python3 clean_duplicates.py .env")
        print("  python3 clean_duplicates.py --dry-run .env")
        sys.exit(1)

    dry_run = '--dry-run' in sys.argv
    file_path = [arg for arg in sys.argv[1:] if arg != '--dry-run'][0]

    print("🧹 Cleaning duplicate environment variables")
    print("=" * 50)

    success = clean_duplicates(file_path, dry_run=dry_run)

    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()
