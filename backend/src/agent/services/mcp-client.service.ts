import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as path from 'path';

interface TextContent {
  type: 'text';
  text: string;
}

interface ToolResult {
  content: Array<TextContent | { type: string }>;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

@Injectable()
export class McpClientService implements OnModuleInit, OnModuleDestroy {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private tools: MCPTool[] = [];

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  async connect(): Promise<void> {
    try {
      // Path to the MCP server
      const mcpServerPath = path.resolve(
        __dirname,
        '../../../../mcp-server/build/index.js',
      );

      console.log('Connecting to MCP server at:', mcpServerPath);

      this.transport = new StdioClientTransport({
        command: 'node',
        args: [mcpServerPath],
      });

      this.client = new Client({
        name: 'flight-agent-client',
        version: '1.0.0',
      });

      await this.client.connect(this.transport);
      console.log('Connected to MCP server');

      // Fetch available tools
      await this.refreshTools();
    } catch (error) {
      console.error('Failed to connect to MCP server:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }

  async refreshTools(): Promise<MCPTool[]> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    const result = await this.client.listTools();
    this.tools = result.tools.map((tool) => ({
      name: tool.name,
      description: tool.description || '',
      inputSchema: tool.inputSchema as Record<string, unknown>,
    }));

    console.log(
      'Available MCP tools:',
      this.tools.map((t) => t.name),
    );
    return this.tools;
  }

  getTools(): MCPTool[] {
    return this.tools;
  }

  async callTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<unknown> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    console.log(`Calling MCP tool: ${name}`, args);

    const result = (await this.client.callTool({
      name,
      arguments: args,
    })) as ToolResult;

    // Parse the text content from the result
    const textContent = result.content.find(
      (c): c is TextContent => c.type === 'text',
    );
    if (textContent) {
      try {
        return JSON.parse(textContent.text);
      } catch {
        return textContent.text;
      }
    }

    return result.content;
  }
}
