import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { AgentService } from '../services/agent.service';

interface AskDto {
  question: string;
}

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  /**
   * POST /agent/ask
   * Streams agent events via SSE
   */
  @Post('ask')
  async ask(@Body() body: AskDto, @Res() res: Response): Promise<void> {
    const { question } = body;

    if (!question) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'Question is required' });
      return;
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    try {
      // Stream events from the agent
      for await (const event of this.agentService.runAgent(question)) {
        // Format as SSE
        const sseData = `data: ${JSON.stringify(event)}\n\n`;
        res.write(sseData);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorEvent = {
        type: 'error',
        title: 'Agent Error',
        description: errorMessage,
        data: { error: errorMessage },
        timestamp: new Date().toISOString(),
      };
      res.write(`data: ${JSON.stringify(errorEvent)}\n\n`);
    } finally {
      res.end();
    }
  }
}
