# MCP + Agent + SSE Real-Time Client Architecture

This project demonstrates how to build a complete system with:
1. **MCP Server** - Tools server using Model Context Protocol
2. **Agent Server** - Uses OpenAI Agents SDK with dynamic tool calling
3. **Client** - Chat interface with live SSE updates

## Architecture Overview

```
┌─────────────────┐     SSE Events      ┌─────────────────┐     MCP Protocol    ┌─────────────────┐
│                 │◄───────────────────│                 │◄──────────────────►│                 │
│     Client      │     HTTP POST      │   Agent Server  │    (stdio/HTTP)    │   MCP Server    │
│   (React/HTML)  │──────────────────►│   (FastAPI)     │                    │   (Python)      │
│                 │                    │                 │                    │                 │
└─────────────────┘                    └─────────────────┘                    └─────────────────┘
```

---

## Best Practices & Techniques

### 1. MCP Transport Options

Based on the [MCP specification](https://modelcontextprotocol.io/docs/concepts/transports), there are multiple transport options:

| Transport | Use Case | Pros | Cons |
|-----------|----------|------|------|
| **stdio** | Local development, CLI tools | Simple, no network overhead | Local only |
| **Streamable HTTP** | Production servers | Scalable, supports SSE streaming | More complex setup |
| **HTTP + SSE** | Legacy support | Backwards compatible | Being deprecated |

**Recommendation**: Use **stdio** for development and **Streamable HTTP** for production.

### 2. OpenAI Agents SDK Streaming

The [OpenAI Agents SDK](https://github.com/openai/openai-agents-python) provides built-in streaming with event types:

- **`RawResponsesStreamEvent`**: Token-by-token LLM output
- **`RunItemStreamEvent`**: High-level events (tool calls, messages, handoffs)
- **`AgentUpdatedStreamEvent`**: Agent change notifications

### 3. Real-Time Client Updates via SSE

Server-Sent Events (SSE) is the recommended approach for:
- One-way server-to-client streaming
- Simple implementation (just HTTP)
- Auto-reconnection support
- Works with all browsers

---

## Project Structure

```
mcp-example/
├── README.md
├── package.json
├── mcp-server/
│   ├── server.py              # MCP server with tools
│   └── requirements.txt
├── agent-server/
│   ├── main.py                # FastAPI server with SSE
│   ├── agent.py               # OpenAI Agent configuration
│   ├── event_types.py         # Event type definitions
│   └── requirements.txt
└── client/
    ├── index.html             # Chat interface
    ├── styles.css
    └── app.js                 # SSE client logic
```

---

## Component Details

### 1. MCP Server (`mcp-server/`)

The MCP server exposes tools that the agent can dynamically call:

```python
# Example tools the MCP server will provide:
- get_weather(city: str) -> str        # Get weather for a city
- search_flights(from: str, to: str)   # Search flights
- book_hotel(city: str, date: str)     # Book a hotel
```

**Key Features:**
- Uses `mcp` Python package
- Exposes tools via JSON-RPC
- Can run as stdio or HTTP server

### 2. Agent Server (`agent-server/`)

The agent server is the brain of the system:

```python
# Core architecture:
1. Receive user message via POST /chat
2. Start SSE stream for that request
3. Run OpenAI Agent with MCP tools
4. Stream events back to client in real-time
```

**Key Features:**
- Uses `openai-agents` SDK
- Dynamic tool discovery from MCP server
- LLM decides what tools to call (not hardcoded)
- Re-evaluation based on tool results
- SSE streaming of all events

### 3. Client (`client/`)

Simple HTML/JS chat interface:

```javascript
// SSE event handling:
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch(data.type) {
    case 'planning': // Agent is planning
    case 'tool_call': // Agent is calling a tool
    case 'tool_result': // Tool returned a result
    case 'thinking': // Agent is re-evaluating
    case 'message': // Final message
  }
};
```

---

## Event Flow Example

User asks: *"What's the weather in Tel Aviv, New York, and Berlin?"*

```
┌──────────────────────────────────────────────────────────────────────┐
│ Event Stream                                                          │
├──────────────────────────────────────────────────────────────────────┤
│ 1. { type: "planning",                                                │
│      title: "Planning query",                                         │
│      description: "I need to get weather for 3 cities" }              │
├──────────────────────────────────────────────────────────────────────┤
│ 2. { type: "tool_call",                                               │
│      title: "Checking weather",                                       │
│      description: "Getting weather for Tel Aviv",                     │
│      tool: "get_weather", args: { city: "Tel Aviv" } }                │
├──────────────────────────────────────────────────────────────────────┤
│ 3. { type: "tool_result",                                             │
│      title: "Weather received",                                       │
│      description: "Tel Aviv: 25°C, Sunny",                            │
│      result: { temp: 25, condition: "Sunny" } }                       │
├──────────────────────────────────────────────────────────────────────┤
│ 4. { type: "tool_call",                                               │
│      title: "Checking weather",                                       │
│      description: "Getting weather for New York",                     │
│      tool: "get_weather", args: { city: "New York" } }                │
├──────────────────────────────────────────────────────────────────────┤
│ ... (more tool calls and results)                                     │
├──────────────────────────────────────────────────────────────────────┤
│ N. { type: "message",                                                 │
│      title: "Response ready",                                         │
│      description: "Here's the weather for all cities...",             │
│      content: "Tel Aviv: 25°C Sunny, New York: 15°C Cloudy..." }      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: MCP Server

1. Create `mcp-server/server.py` with sample tools
2. Implement stdio transport
3. Add tool registration with proper schemas
4. Test with MCP client

### Phase 2: Agent Server

1. Create FastAPI app with SSE support
2. Integrate OpenAI Agents SDK
3. Connect to MCP server via `MCPServerStdio`
4. Implement dynamic event streaming:
   - Listen to agent stream events
   - Transform to client-friendly format with title/description
   - Push via SSE

### Phase 3: Client

1. Create chat UI with message history
2. Implement SSE connection
3. Display live updates with step indicators
4. Show tool calls and results in real-time

---

## Key Code Patterns

### Dynamic Agent Loop (Agent Decides Tools)

```python
from agents import Agent, Runner, function_tool
from agents.mcp import MCPServerStdio

# MCP server provides tools dynamically
async with MCPServerStdio(
    name="Travel Tools",
    params={"command": "python", "args": ["mcp-server/server.py"]}
) as mcp_server:
    
    agent = Agent(
        name="Travel Assistant",
        instructions="""
        You are a helpful travel assistant. 
        Use the available tools to help users with weather, flights, and hotels.
        Always explain what you're doing.
        """,
        mcp_servers=[mcp_server],  # Tools discovered dynamically!
    )
    
    # Agent decides which tools to call based on user input
    result = Runner.run_streamed(agent, input=user_message)
    
    async for event in result.stream_events():
        # Transform and stream to client
        yield transform_event(event)
```

### SSE Streaming with Event Transformation

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

async def event_generator(user_message: str):
    async for event in run_agent(user_message):
        # Add human-readable title and description
        enriched_event = {
            "type": event.type,
            "title": generate_title(event),
            "description": generate_description(event),
            "data": event.data
        }
        yield f"data: {json.dumps(enriched_event)}\n\n"

@app.post("/chat")
async def chat(request: ChatRequest):
    return StreamingResponse(
        event_generator(request.message),
        media_type="text/event-stream"
    )
```

### Client SSE Handling

```javascript
async function sendMessage(message) {
    const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value);
        const events = text.split('\n\n').filter(e => e.startsWith('data: '));
        
        for (const event of events) {
            const data = JSON.parse(event.slice(6));
            displayEvent(data);  // Show in UI with title/description
        }
    }
}
```

---

## Running the Project

### Prerequisites

```bash
# Python 3.11+
python --version

# Node.js (optional, for serving client)
node --version
```

### Setup

```bash
# 1. Install MCP server dependencies
cd mcp-server
pip install -r requirements.txt

# 2. Install Agent server dependencies
cd ../agent-server
pip install -r requirements.txt

# 3. Set OpenAI API key
export OPENAI_API_KEY=your-key-here
```

### Run

```bash
# Terminal 1: Start Agent Server (it will spawn MCP server)
cd agent-server
uvicorn main:app --reload --port 8000

# Terminal 2: Serve Client
cd client
python -m http.server 3000

# Open browser: http://localhost:3000
```

---

## Event Type Reference

| Event Type | Title Example | Description Example | When |
|------------|---------------|---------------------|------|
| `planning` | "Planning request" | "Analyzing what tools are needed" | Agent starts thinking |
| `tool_call` | "Calling {tool}" | "Getting weather for {city}" | Before tool execution |
| `tool_result` | "{tool} completed" | "Received: {summary}" | After tool returns |
| `thinking` | "Evaluating results" | "Checking if more calls needed" | Re-evaluation phase |
| `message` | "Response ready" | "Here's what I found..." | Final response |
| `error` | "Error occurred" | "{error message}" | On error |

---

## Why This Architecture?

### Dynamic Tool Calling
The agent discovers tools from MCP at runtime and decides what to call based on the user's request. No hardcoded tool sequences!

### Real-Time Updates
Every step is streamed to the client as it happens:
- User sees what the agent is planning
- User sees each tool being called
- User sees results as they come back
- User can follow the agent's reasoning

### Scalable Pattern
This same pattern works for:
- Simple single-tool queries
- Complex multi-tool orchestration
- Error recovery and re-evaluation
- Long-running operations

---

## References

- [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP Transports](https://modelcontextprotocol.io/docs/concepts/transports)
- [Streaming in Agents SDK](https://openai.github.io/openai-agents-python/streaming/)
- [FastAPI SSE](https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse)
