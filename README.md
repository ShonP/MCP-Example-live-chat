# MCP Live Chat Agent

A real-time chat application demonstrating the Model Context Protocol (MCP) with live SSE streaming. Watch the AI agent think and work through problems step-by-step!

![Demo](https://img.shields.io/badge/Demo-Live%20Chat-blue)

## Features

- 🤖 **AI Agent** with OpenAI GPT-4o
- 🔧 **MCP Server** with flight/passenger query tools
- 📡 **Real-time SSE streaming** - see the agent's thinking process live
- 🎨 **Copilot-style UI** with collapsible reasoning steps
- 🌙 **Dark/Light mode** support

## Architecture

```
┌─────────────────┐     SSE Events      ┌─────────────────┐     MCP (stdio)     ┌─────────────────┐
│                 │◄───────────────────│                 │◄──────────────────►│                 │
│     Frontend    │     HTTP POST      │     Backend     │                    │   MCP Server    │
│   (React/Vite)  │──────────────────►│    (NestJS)     │                    │  (TypeScript)   │
│                 │                    │                 │                    │                 │
└─────────────────┘                    └─────────────────┘                    └─────────────────┘
     :5173                                  :3000                              (spawned by backend)
```

## Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/ShonP/MCP-Example-live-chat.git
cd MCP-Example-live-chat
```

### 2. Install dependencies

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

### 3. Build the MCP server

```bash
cd mcp-server && npm run build && cd ..
```

### 4. Configure environment

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

| Tool | Description |
|------|-------------|
| `get_flights` | Get flight information, filter by destination/airline |
| `get_passengers_by_flight` | Get passenger list for a specific flight |
| `count_passengers_by_flight` | Count passengers per flight, sorted |
| `get_top_flights_with_destinations` | Get top N flights by passenger count |
| `get_destination_info` | Get destination details by airport code |

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
