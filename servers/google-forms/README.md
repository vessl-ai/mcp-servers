# Google Forms Integration Server

**MCP server for Google Forms.**

---

## What is this?

This MCP server for Google Forms lets you create, update, and delete Google Forms, and get responses from them.

---

## Features

- Create, update, and delete Google Forms
- Get responses from Google Forms
- Get all Google Forms owned by the authenticated user
- Get a specific response from a Google Form
- List all responses from a Google Form

---

## Development

```bash
# 1. Install dependencies
pnpm install

# 2. Start the dev server
pnpm run start:dev

# 3. Run mcp inspector
pnpm run inspector
```

## Using with [mcpctl](https://github.com/vessl-ai/mcpctl)

0. Check mcpctl control plane runnnig

```bash
mcpctl cp status
```

1. write a server.json file

```json
{
  "name": "server-google-forms",
  "resourceType": "remote",
  "transport": {
    "type": "sse",
    "port": 8080
  },
  "command": "npx -y @vessl-ai/google-forms-mcp-server",
  "env": {
    "HOST": "0.0.0.0",
    "PORT": "8080"
  },
  "secrets": {
    "GOOGLE_CLIENT_ID": {
      "source": "keychain",
      "key": "google-client-id"
    },
    "GOOGLE_CLIENT_SECRET": {
      "source": "keychain",
      "key": "google-client-secret"
    }
  }
}
```

2. Add secrets

```bash
mcpctl secrets add google-client-id --value <your-client-id>
mcpctl secrets add google-client-secret --value <your-client-secret>
```

3. Run mcpctl

```bash
mcpctl server start -f server.json
```

4. Install to claude

```bash
mcpctl client connect server-google-forms --client claude
```

## License

MIT
