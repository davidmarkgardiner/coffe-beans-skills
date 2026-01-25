#!/usr/bin/env python3
"""
Upload secrets from .env file to Google Secret Manager
This script parses a .env file and creates/updates secrets in GSM
"""

import os
import sys
import subprocess
from pathlib import Path


def parse_env_file(env_path):
    """Parse .env file and return dict of key-value pairs"""
    secrets = {}

    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()

            # Skip empty lines and comments
            if not line or line.startswith('#'):
                continue

            # Split on first = sign
            if '=' in line:
                key, value = line.split('=', 1)
                key = key.strip()
                value = value.strip()

                # Remove quotes if present
                if value.startswith('"') and value.endswith('"'):
                    value = value[1:-1]
                elif value.startswith("'") and value.endswith("'"):
                    value = value[1:-1]

                secrets[key] = value

    return secrets


def get_gcp_project():
    """Get the current GCP project ID"""
    try:
        result = subprocess.run(
            ['gcloud', 'config', 'get-value', 'project'],
            capture_output=True,
            text=True,
            check=True
        )
        project_id = result.stdout.strip()
        if not project_id:
            print("❌ No GCP project set. Run: gcloud config set project PROJECT_ID")
            sys.exit(1)
        return project_id
    except subprocess.CalledProcessError:
        print("❌ Failed to get GCP project. Make sure gcloud is installed and configured.")
        sys.exit(1)


def secret_exists(secret_name, project_id):
    """Check if a secret already exists in GSM"""
    try:
        subprocess.run(
            ['gcloud', 'secrets', 'describe', secret_name, '--project', project_id],
            capture_output=True,
            check=True
        )
        return True
    except subprocess.CalledProcessError:
        return False


def create_or_update_secret(secret_name, secret_value, project_id):
    """Create or update a secret in Google Secret Manager"""
    # Convert secret name to lowercase and replace underscores with hyphens (GSM naming convention)
    gsm_secret_name = secret_name.lower().replace('_', '-')

    try:
        if secret_exists(gsm_secret_name, project_id):
            # Update existing secret by adding a new version
            print(f"   Updating: {gsm_secret_name}")
            subprocess.run(
                ['gcloud', 'secrets', 'versions', 'add', gsm_secret_name,
                 '--data-file=-', '--project', project_id],
                input=secret_value,
                text=True,
                check=True,
                capture_output=True
            )
        else:
            # Create new secret
            print(f"   Creating: {gsm_secret_name}")
            subprocess.run(
                ['gcloud', 'secrets', 'create', gsm_secret_name,
                 '--data-file=-', '--project', project_id],
                input=secret_value,
                text=True,
                check=True,
                capture_output=True
            )
        return gsm_secret_name
    except subprocess.CalledProcessError as e:
        print(f"   ❌ Failed to create/update {gsm_secret_name}: {e}")
        return None


def main():
    env_file = sys.argv[1] if len(sys.argv) > 1 else '.env'

    if not os.path.exists(env_file):
        print(f"❌ File not found: {env_file}")
        sys.exit(1)

    print("📤 Uploading secrets to Google Secret Manager")
    print("=" * 50)

    # Get GCP project
    project_id = get_gcp_project()
    print(f"📋 Project: {project_id}\n")

    # Parse .env file
    secrets = parse_env_file(env_file)

    if not secrets:
        print(f"⚠️  No secrets found in {env_file}")
        sys.exit(0)

    print(f"📦 Found {len(secrets)} secrets in {env_file}\n")

    # Upload each secret
    success_count = 0
    gsm_names = {}

    for key, value in secrets.items():
        gsm_name = create_or_update_secret(key, value, project_id)
        if gsm_name:
            success_count += 1
            gsm_names[key] = gsm_name

    print(f"\n✅ Successfully uploaded {success_count}/{len(secrets)} secrets")

    # Print Teller configuration snippet
    if gsm_names:
        print("\n📝 Add these mappings to your .teller configuration:\n")
        print("providers:")
        print("  google_secretmanager:")
        print("    kind: google_secretmanager")
        print("    maps:")
        print("      - id: secrets")
        print(f"        path: projects/{project_id}")
        print("        keys:")
        for env_key, gsm_name in gsm_names.items():
            print(f"          {gsm_name}: {env_key}")


if __name__ == '__main__':
    main()
