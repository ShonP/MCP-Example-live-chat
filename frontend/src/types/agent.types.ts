export type AgentEventType =
  | 'annotation'
  | 'tool_call'
  | 'tool_result'
  | 'message'
  | 'error'
  | 'done';

export interface IAgentEvent {
  type: AgentEventType;
  title: string;
  description: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

export interface IChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  events?: IAgentEvent[];
  isStreaming?: boolean;
}
