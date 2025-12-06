# Amoeba CLI Command Reference

The Amoeba CLI (`amoeba`) provides full parity with the Dashboard UI, allowing you to manage your AI platform entirely from the terminal.

## Global Options

| Option | Description |
|--------|-------------|
| `--json` | Output results as JSON (useful for scripting) |
| `--quiet` | Suppress non-essential output |
| `--verbose` | Show detailed debug information |
| `--no-color` | Disable colored output |
| `--api-url <url>` | Override API URL (default: <http://localhost:5000>) |

## Authentication (`auth`)

Manage your session and identity.

```bash
amoeba auth login                   # Interactive login
amoeba auth login --token <token>   # Login with existing token
amoeba auth logout                  # Clear session
amoeba auth whoami                  # Show current user details
amoeba auth status                  # Check if authenticated
```

## System Status (`status`)

Check system health and usage.

```bash
amoeba status (or amoeba health)    # Show system readiness score & component status
amoeba stats                        # Show usage statistics (generations, cost, etc.)
```

## Deployment (`deployment`)

Manage server configuration and environment.

```bash
amoeba deployment analyze           # Analyze current server environment (ports, nginx, SSL)
amoeba deployment health            # Show deployment health score
amoeba deployment nginx             # Generate Nginx configuration
amoeba deployment dns <domain>      # Validate DNS records for a domain
amoeba deployment services          # List other services running on the server
```

## Content Generation (`generate`)

Create content using AI.

```bash
amoeba generate <type> [topic]      # Generate content (interactive if args missing)
# Example: amoeba generate blog "Future of AI"
```

## Templates (`templates`)

Manage content templates.

```bash
amoeba templates list               # List available templates
amoeba templates show <id>          # Show template details
```

## Configuration (`config`)

Manage local CLI configuration.

```bash
amoeba config list                  # Show current config
amoeba config set <key> <value>     # Set config value
amoeba config get <key>             # Get config value
```

## Database (`database`)

Manage database connections (Development only).

```bash
amoeba database switch <type>       # Switch between 'postgres' and 'sqlite'
```

## Environment (`env`)

Manage environment variables.

```bash
amoeba env list                     # List environment variables
amoeba env set <key> <value>        # Set environment variable
```
