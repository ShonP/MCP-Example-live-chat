import type { FC } from 'react';
import { useRef, useEffect } from 'react';
import { Send, Plane } from 'lucide-react';
import type { IChatProps, IMessageProps, IEventCardProps } from './Chat.types';
import {
  ChatContainer,
  MessagesContainer,
  MessageWrapper,
  MessageBubble,
  EventsContainer,
  EventCard,
  EventTitle,
  EventTitleText,
  EventDescription,
  EventData,
  InputContainer,
  InputWrapper,
  TextArea,
  SendButton,
  Header,
  Title,
  Subtitle,
  StreamingIndicator,
  PulsingDot,
  EmptyState,
  EmptyStateIcon,
  EmptyStateText,
} from './Chat.style';
import { useChat } from './Chat.hooks';
import { EVENT_ICONS, EVENT_LABELS } from './Chat.constants';

const EventCardComponent: FC<IEventCardProps> = ({ event }) => {
  const Icon = EVENT_ICONS[event.type];

  return (
    <EventCard eventType={event.type}>
      <EventTitle>
        <Icon size={14} />
        <span>{EVENT_LABELS[event.type]}</span>
        <EventTitleText>{event.title}</EventTitleText>
      </EventTitle>
      {event.description && (
        <EventDescription>{event.description}</EventDescription>
      )}
      {event.data && Object.keys(event.data).length > 0 && (
        <EventData>{JSON.stringify(event.data, null, 2)}</EventData>
      )}
    </EventCard>
  );
};

const Message: FC<IMessageProps> = ({ role, content, events, isStreaming }) => {
  const isUser = role === 'user';

  return (
    <MessageWrapper isUser={isUser}>
      <MessageBubble isUser={isUser}>
        {content || (isStreaming ? '' : 'Processing...')}
        {!isUser && events && events.length > 0 && (
          <EventsContainer>
            {events.map((event, index) => (
              <EventCardComponent key={index} event={event} />
            ))}
          </EventsContainer>
        )}
        {isStreaming && (
          <StreamingIndicator>
            <PulsingDot />
            <span>Agent is thinking...</span>
          </StreamingIndicator>
        )}
      </MessageBubble>
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
