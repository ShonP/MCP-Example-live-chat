import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { McpClientService } from './mcp-client.service';
import { AgentStreamEvent, createEvent } from '../types/agent-event.types';
import { AGENT_INSTRUCTIONS, AGENT_MODEL } from '../config/agent.config';

type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;
type ChatCompletionTool = OpenAI.Chat.Completions.ChatCompletionTool;
type ChatCompletionMessageToolCall =
  OpenAI.Chat.Completions.ChatCompletionMessageToolCall;

@Injectable()
export class AgentService {
  private openai: OpenAI;

  constructor(private readonly mcpClient: McpClientService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Run the agent with streaming events
   * Uses a generator to yield events as they happen
   */
  async *runAgent(userMessage: string): AsyncGenerator<AgentStreamEvent> {
    const messages: ChatMessage[] = [
      { role: 'system', content: AGENT_INSTRUCTIONS },
      { role: 'user', content: userMessage },
    ];

    // Get MCP tools and convert to OpenAI format
    const mcpTools = this.mcpClient.getTools();
    const tools: ChatCompletionTool[] = [
      // Add annotate_step as a special tool (handled locally, not via MCP)
      {
        type: 'function',
        function: {
          name: 'annotate_step',
          description:
            'Narrate your current action to keep the user informed. Call this before and after every tool call.',
          parameters: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Short title for this step',
              },
              description: {
                type: 'string',
                description: 'Detailed description of what you are doing',
              },
            },
            required: ['title', 'description'],
          },
        },
      },
      // Add MCP tools
      ...mcpTools.map((tool) => ({
        type: 'function' as const,
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema,
        },
      })),
    ];

    // Emit initial event
    yield createEvent(
      'annotation',
      'Agent Started',
      `Processing your request: "${userMessage}"`,
    );

    const maxIterations = 20; // Safety limit
    let iteration = 0;

    while (iteration < maxIterations) {
      iteration++;

      // Call OpenAI
      const response = await this.openai.chat.completions.create({
        model: AGENT_MODEL,
        messages,
        tools,
        tool_choice: 'auto',
      });

      const assistantMessage = response.choices[0].message;

      // Add assistant message to history
      messages.push(assistantMessage);

      // Check if we have tool calls
      const toolCalls = assistantMessage.tool_calls;
      if (toolCalls && toolCalls.length > 0) {
        // Process each tool call
        for (const toolCall of toolCalls) {
          yield* this.processToolCall(toolCall, messages);
        }
      } else {
        // No tool calls - this is the final answer
        const finalAnswer = assistantMessage.content || 'No response generated';

        yield createEvent('message', 'Response', finalAnswer, {
          content: finalAnswer,
        });

        yield createEvent('done', 'Complete', 'Agent finished processing', {
          finalAnswer,
        });

        break;
      }
    }

    if (iteration >= maxIterations) {
      yield createEvent(
        'error',
        'Max iterations reached',
        'The agent reached its maximum number of iterations',
        { error: 'Max iterations exceeded' },
      );
    }
  }

  /**
   * Process a single tool call
   */
  private async *processToolCall(
    toolCall: ChatCompletionMessageToolCall,
    messages: ChatMessage[],
  ): AsyncGenerator<AgentStreamEvent> {
    // Only handle function type tool calls
    if (toolCall.type !== 'function') {
      return;
    }

    const toolName = toolCall.function.name;
    const toolArgs = JSON.parse(toolCall.function.arguments) as Record<
      string,
      unknown
    >;

    if (toolName === 'annotate_step') {
      // Handle annotation locally - emit as SSE event
      const title =
        typeof toolArgs.title === 'string' ? toolArgs.title : 'Step';
      const description =
        typeof toolArgs.description === 'string' ? toolArgs.description : '';

      yield createEvent('annotation', title, description);

      // Add tool response to messages
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify({ ok: true }),
      });
    } else {
      // Emit tool call event
      yield createEvent(
        'tool_call',
        `Calling ${toolName}`,
        `Executing tool with args`,
        {
          tool: toolName,
          args: toolArgs,
        },
      );

      try {
        // Call MCP tool
        const result = await this.mcpClient.callTool(toolName, toolArgs);

        // Emit tool result event
        yield createEvent(
          'tool_result',
          `${toolName} completed`,
          'Tool execution successful',
          {
            tool: toolName,
            result,
          },
        );

        // Add tool response to messages
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';

        yield createEvent('error', `${toolName} failed`, errorMessage, {
          error: errorMessage,
        });

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify({ error: errorMessage }),
        });
      }
    }
  }
}
