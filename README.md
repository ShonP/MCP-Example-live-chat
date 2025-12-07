# MCP Live Chat Agent

A real-time chat application demonstrating the Model Context Protocol (MCP) with live SSE streaming. Watch the AI agent think and work through problems step-by-step!

![Demo](https://img.shields.io/badge/Demo-Live%20Chat-blue)

## Features

- 🤖 **AI Agent** with OpenAI GPT-4o
- 🔧 **Multi-MCP Server Support** - connects to multiple MCP servers simultaneously
- 📡 **Real-time SSE streaming** - see the agent's thinking process live
- 🎨 **Copilot-style UI** with collapsible reasoning steps
- 🌙 **Dark/Light mode** support

## MCP Servers

This project supports multiple MCP servers:

| Server | Description | Tools |
|--------|-------------|-------|
| **Flight Server** | Local flight/passenger data | `get_flights`, `get_passengers_by_flight`, `count_passengers_by_flight`, etc. |
| **Fabric RTI** | Microsoft Fabric Real-Time Intelligence | `kusto_query`, `eventstream_list`, `activator_create_trigger`, etc. |

## Architecture

```
┌─────────────────┐     SSE Events      ┌─────────────────┐     MCP (stdio)     ┌─────────────────┐
│                 │◄───────────────────│                 │◄──────────────────►│  Flight Server  │
│     Frontend    │     HTTP POST      │     Backend     │                    │  (TypeScript)   │
│   (React/Vite)  │──────────────────►│    (NestJS)     │                    └─────────────────┘
│                 │                    │                 │
└─────────────────┘                    │                 │     MCP (stdio)     ┌─────────────────┐
     :5173                             │                 │◄──────────────────►│  Fabric RTI     │
                                       └─────────────────┘                    │  (Python/uvx)   │
                                            :3000                             └─────────────────┘
```

## Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key
- **uv** (for Fabric RTI MCP server) - [Install uv](https://docs.astral.sh/uv/getting-started/installation/)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/ShonP/MCP-Example-live-chat.git
cd MCP-Example-live-chat
```

### 2. Install uv (for Fabric RTI MCP server)

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or with Homebrew
brew install uv
```

### 3. Install dependencies

```bash
# Install root dependencies
npm install

# Install MCP server dependencies
cd mcp-server && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 4. Build the MCP server

```bash
cd mcp-server && npm run build && cd ..
```

### 5. Configure environment

Create a `.env` file in the `backend` folder:

```bash
# backend/.env
OPENAI_API_KEY=your-openai-api-key-here
```

## Running the Application

### Option 1: Run each service separately

**Terminal 1 - Backend (NestJS + MCP Server):**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option 2: Quick start (if you have concurrently installed)

```bash
npm run dev
```

## Usage

1. Open your browser to **http://localhost:5173**
2. Type a question about flights, e.g.:
   - "Show me the top 10 flights with most passengers"
   - "What flights go to Rome?"
   - "How many passengers are on flight AA123?"
3. Watch the agent think through the problem in real-time!

## Project Structure

```
mcp-example/
├── mcp-server/          # MCP Server (TypeScript)
│   ├── src/
│   │   ├── index.ts     # Server entry point
│   │   ├── tools.ts     # Tool implementations
│   │   └── data.ts      # Mock flight/passenger data
│   └── package.json
│
├── backend/             # NestJS Backend
│   ├── src/
│   │   ├── agent/       # Agent module
│   │   │   ├── services/
│   │   │   │   ├── agent.service.ts      # OpenAI integration
│   │   │   │   └── mcp-client.service.ts # MCP client
│   │   │   ├── controllers/
│   │   │   │   └── agent.controller.ts   # SSE endpoint
│   │   │   └── config/
│   │   │       └── agent.config.ts       # Agent instructions
│   │   └── main.ts
│   └── package.json
│
├── frontend/            # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   └── Chat/    # Chat component
│   │   ├── api/         # API client
│   │   └── types/       # TypeScript types
│   └── package.json
│
└── README.md
```

## Available MCP Tools

### Flight Server Tools

| Tool | Description |
|------|-------------|
| `get_flights` | Get flight information, filter by destination/airline |
| `get_passengers_by_flight` | Get passenger list for a specific flight |
| `count_passengers_by_flight` | Count passengers per flight, sorted |
| `get_top_flights_with_destinations` | Get top N flights by passenger count |
| `get_destination_info` | Get destination details by airport code |

### Microsoft Fabric RTI Tools

| Tool | Description |
|------|-------------|
| `kusto_query` | Execute KQL queries on Eventhouse/ADX databases |
| `kusto_list_databases` | List all databases in a Kusto cluster |
| `kusto_list_tables` | List all tables in a database |
| `kusto_get_table_schema` | Get detailed schema for a table |
| `kusto_sample_table_data` | Get sample records from a table |
| `eventstream_list` | List all Eventstreams in a Fabric workspace |
| `eventstream_create` | Create new Eventstreams |
| `activator_create_trigger` | Create alerts based on KQL conditions |

> **Note**: The Fabric RTI server provides 30+ tools. See the [microsoft/fabric-rti-mcp](https://github.com/microsoft/fabric-rti-mcp) repo for the complete list.

## Configuring MCP Servers

You can enable/disable MCP servers in `backend/src/agent/config/mcp-servers.config.ts`:

```typescript
export const MCP_SERVERS: McpServerConfig[] = [
  {
    name: 'flight-server',
    enabled: true,  // ← Toggle here
    // ...
  },
  {
    name: 'fabric-rti',
    enabled: true,  // ← Toggle here
    env: {
      KUSTO_SERVICE_URI: 'https://your-cluster.kusto.windows.net/',
      KUSTO_SERVICE_DEFAULT_DB: 'YourDatabase',
    },
    // ...
  },
];
```

## How It Works

1. **User sends a message** → Frontend POSTs to `/agent/ask`
2. **Backend receives request** → Opens SSE stream to client
3. **Agent starts reasoning** → Calls `annotate_step` to narrate thinking
4. **Agent calls MCP tools** → Backend forwards to MCP server
5. **Results stream back** → Each step is sent as an SSE event
6. **Frontend displays live** → Shows current step with pulsing indicator
7. **Completion** → Steps collapse into "Reasoned in X steps"

## Technologies

- **Frontend**: React 19, Vite, Emotion, TypeScript
- **Backend**: NestJS, OpenAI SDK, MCP SDK
- **MCP Server**: TypeScript, @modelcontextprotocol/sdk
- **Streaming**: Server-Sent Events (SSE)

## License

MIT
