import type { FC } from 'react';
import type { IAgentEvent } from '../../types';

export interface IChatProps {
  // Props can be extended as needed
}

export interface IChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export interface IMessageProps {
  role: 'user' | 'assistant';
  content: string;
  events?: IAgentEvent[];
  isStreaming?: boolean;
}

export interface IEventCardProps {
  event: IAgentEvent;
}

export type ChatComponent = FC<IChatProps>;
export type ChatInputComponent = FC<IChatInputProps>;
export type MessageComponent = FC<IMessageProps>;
export type EventCardComponent = FC<IEventCardProps>;
