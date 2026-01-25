# Coffee Copilot Scripts

This directory contains utility scripts for setting up and managing the Coffee Copilot.

## Available Scripts

### `setup-env.sh`
Creates a `.env` template file with all required environment variables for the Coffee Copilot backend.

**Usage:**
```bash
chmod +x scripts/setup-env.sh
./scripts/setup-env.sh
```

This will create a `.env` file in your current directory with placeholders for:
- OpenAI API key
- GitHub integration (for issue filing)
- Vector database configuration
- Server settings
- Optional payment integration

### `verify-dependencies.sh`
Verifies that all required dependencies and configuration are in place before starting development.

**Usage:**
```bash
chmod +x scripts/verify-dependencies.sh
./scripts/verify-dependencies.sh
```

This script checks for:
- Node.js installation
- Package manager (npm/yarn)
- `.env` file existence and configuration
- `package.json` and installed dependencies

## Quick Start

1. Make scripts executable:
   ```bash
   chmod +x scripts/*.sh
   ```

2. Set up environment variables:
   ```bash
   ./scripts/setup-env.sh
   ```

3. Edit `.env` and fill in your API keys

4. Verify everything is configured:
   ```bash
   ./scripts/verify-dependencies.sh
   ```

5. Start building your Coffee Copilot!
