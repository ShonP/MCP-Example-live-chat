import type { FC } from 'react';
import { useRef, useEffect, useState } from 'react';
import { Send, Plane, ChevronRight, Sparkles, CheckCircle } from 'lucide-react';
import type { IChatProps, IMessageProps } from './Chat.types';
import type { IAgentEvent } from '../../types';
import {
  ChatContainer,
  MessagesContainer,
  MessageWrapper,
  MessageBubble,
  InputContainer,
  InputWrapper,
  TextArea,
  SendButton,
  Header,
  Title,
  Subtitle,
  EmptyState,
  EmptyStateIcon,
  EmptyStateText,
  ReasoningContainer,
  ReasoningHeader,
  ReasoningHeaderText,
  StepCount,
  ChevronIcon,
  ReasoningContent,
  StepsList,
  StepItem,
  StepIcon,
  StepText,
  StepTitle,
  StepDescription,
  StepData,
  CurrentStepContainer,
  CurrentStepDot,
  CurrentStepContent,
  CurrentStepTitle,
  CurrentStepDescription,
  AssistantLabel,
} from './Chat.style';
import { useChat } from './Chat.hooks';
import { EVENT_ICONS } from './Chat.constants';

const getEventColor = (type: string): string => {
  switch (type) {
    case 'annotation':
      return 'var(--color-info)';
    case 'tool_call':
      return 'var(--color-warning)';
    case 'tool_result':
      return 'var(--color-success)';
    case 'error':
      return 'var(--color-error)';
    case 'message':
      return 'var(--color-primary)';
    default:
      return 'var(--color-muted)';
  }
};

interface IReasoningStepsProps {
  events: IAgentEvent[];
  isStreaming: boolean;
}

const ReasoningSteps: FC<IReasoningStepsProps> = ({ events, isStreaming }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Filter out 'done' events and get meaningful steps
  const steps = events.filter((e) => e.type !== 'done' && e.type !== 'message');
  const currentStep = isStreaming ? steps[steps.length - 1] : null;
  const completedSteps = isStreaming ? steps.slice(0, -1) : steps;

  if (steps.length === 0 && !isStreaming) {
    return null;
  }

  return (
    <>
      {/* Live current step indicator - only show while streaming */}
      {isStreaming && currentStep && (
        <CurrentStepContainer>
          <CurrentStepDot color={getEventColor(currentStep.type)} />
          <CurrentStepContent>
            <CurrentStepTitle>
              {currentStep.title}
              <ChevronRight size={14} />
            </CurrentStepTitle>
            {currentStep.description && (
              <CurrentStepDescription>
                {currentStep.description}
              </CurrentStepDescription>
            )}
          </CurrentStepContent>
        </CurrentStepContainer>
      )}

      {/* Collapsible completed steps - only show when NOT streaming */}
      {!isStreaming && completedSteps.length > 0 && (
        <ReasoningContainer>
          <ReasoningHeader onClick={() => setIsOpen(!isOpen)}>
            <ChevronIcon isOpen={isOpen}>
              <ChevronRight size={14} />
            </ChevronIcon>
            <ReasoningHeaderText>
              Reasoned in {completedSteps.length} steps
            </ReasoningHeaderText>
            <StepCount>
              {isOpen ? 'collapse' : 'expand'}
            </StepCount>
          </ReasoningHeader>

          <ReasoningContent isOpen={isOpen}>
            <StepsList>
              {completedSteps.map((event, index) => {
                const Icon = EVENT_ICONS[event.type] || CheckCircle;
                return (
                  <StepItem key={index} eventType={event.type}>
                    <StepIcon color={getEventColor(event.type)}>
                      <Icon size={14} />
                    </StepIcon>
                    <StepText>
                      <StepTitle>{event.title}</StepTitle>
                      {event.description && (
                        <StepDescription>{event.description}</StepDescription>
                      )}
                      {event.data && Object.keys(event.data).length > 0 && (
                        <StepData>
                          {JSON.stringify(event.data, null, 2)}
                        </StepData>
                      )}
                    </StepText>
                  </StepItem>
                );
              })}
            </StepsList>
          </ReasoningContent>
        </ReasoningContainer>
      )}
    </>
  );
};

const Message: FC<IMessageProps> = ({ role, content, events, isStreaming }) => {
  const isUser = role === 'user';

  return (
    <MessageWrapper isUser={isUser}>
      <div>
        {!isUser && (
          <AssistantLabel>
            <Sparkles size={14} />
            Copilot
          </AssistantLabel>
        )}
        <MessageBubble isUser={isUser}>
          {content || (isStreaming && (!events || events.length === 0) ? 'Thinking...' : '')}
        </MessageBubble>
        {!isUser && events && events.length > 0 && (
          <ReasoningSteps events={events} isStreaming={isStreaming || false} />
        )}
      </div>
    </MessageWrapper>
  );
};

export const Chat: FC<IChatProps> = () => {
  const { messages, isLoading, inputValue, setInputValue, sendMessage } =
    useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  return (
    <ChatContainer>
      <Header>
        <Title>Flight Agent</Title>
        <Subtitle>Ask me about flights and passengers</Subtitle>
      </Header>

      <MessagesContainer>
        {messages.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>
              <Plane size={48} />
            </EmptyStateIcon>
            <EmptyStateText>
              Ask me about flights, passengers, or destinations.
              <br />
              I&apos;ll show you my thinking process in real-time!
            </EmptyStateText>
          </EmptyState>
        ) : (
          messages.map((msg) => (
            <Message
              key={msg.id}
              role={msg.role}
              content={msg.content}
              events={msg.events}
              isStreaming={msg.isStreaming}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        <InputWrapper onSubmit={handleSubmit}>
          <TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about flights..."
            rows={1}
            disabled={isLoading}
          />
          <SendButton type="submit" disabled={isLoading || !inputValue.trim()}>
            <Send size={18} />
          </SendButton>
        </InputWrapper>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chat;
