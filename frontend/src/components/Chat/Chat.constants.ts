import type { AgentEventType } from '../../types';
import { Sparkles, Wrench, CheckCircle, AlertCircle, MessageSquare, Info } from 'lucide-react';

export const EVENT_ICONS: Record<AgentEventType, typeof Sparkles> = {
  annotation: Sparkles,
  tool_call: Wrench,
  tool_result: CheckCircle,
  error: AlertCircle,
  message: MessageSquare,
  done: Info,
};

export const EVENT_LABELS: Record<AgentEventType, string> = {
  annotation: 'Step',
  tool_call: 'Tool Call',
  tool_result: 'Result',
  error: 'Error',
  message: 'Message',
  done: 'Complete',
};
