import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 48rem;
  margin-inline: auto;
  background-color: var(--bg-primary);
`;

export const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-block: 1rem;
  padding-inline: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const MessageWrapper = styled.div<{ isUser: boolean }>`
  display: flex;
  justify-content: ${({ isUser }) => (isUser ? 'flex-end' : 'flex-start')};
`;

export const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 85%;
  padding-block: 0.75rem;
  padding-inline: 1rem;
  border-radius: 1rem;
  background-color: ${({ isUser }) =>
    isUser ? 'var(--color-primary)' : 'var(--bg-secondary)'};
  color: ${({ isUser }) => (isUser ? 'white' : 'var(--text-primary)')};
  word-wrap: break-word;
  white-space: pre-wrap;
`;

// Collapsible reasoning container
export const ReasoningContainer = styled.div`
  margin-block-start: 0.75rem;
  border-radius: 0.75rem;
  background-color: var(--bg-tertiary);
  overflow: hidden;
`;

export const ReasoningHeader = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding-block: 0.625rem;
  padding-inline: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 0.8125rem;
  font-weight: 500;
  text-align: start;

  &:hover {
    background-color: var(--bg-code);
  }
`;

export const ReasoningHeaderText = styled.span`
  flex: 1;
`;

export const StepCount = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
`;

export const ChevronIcon = styled.span<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;
  transform: rotate(${({ isOpen }) => (isOpen ? '90deg' : '0deg')});
`;

export const ReasoningContent = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  padding-block: 0.5rem;
  padding-inline: 0.75rem;
  border-block-start: 1px solid var(--border-color);
`;

// Live current step indicator
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

export const CurrentStepContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-block-start: 0.75rem;
`;

export const CurrentStepDot = styled.span<{ color: string }>`
  width: 0.5rem;
  height: 0.5rem;
  margin-block-start: 0.375rem;
  background-color: ${({ color }) => color};
  border-radius: 50%;
  flex-shrink: 0;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

export const CurrentStepContent = styled.div`
  flex: 1;
`;

export const CurrentStepTitle = styled.div`
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

export const CurrentStepDescription = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-block-start: 0.125rem;
`;

// Completed steps list
export const StepsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

export const StepItem = styled.div<{ eventType: string }>`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding-block: 0.375rem;
  padding-inline: 0;
  font-size: 0.75rem;
`;

export const StepIcon = styled.span<{ color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  color: ${({ color }) => color};
  flex-shrink: 0;
`;

export const StepText = styled.div`
  flex: 1;
`;

export const StepTitle = styled.span`
  font-weight: 500;
  color: var(--text-primary);
`;

export const StepDescription = styled.div`
  color: var(--text-secondary);
  margin-block-start: 0.125rem;
`;

export const StepData = styled.pre`
  font-size: 0.625rem;
  color: var(--text-muted);
  margin-block-start: 0.25rem;
  background-color: var(--bg-code);
  padding: 0.5rem;
  border-radius: 0.25rem;
  overflow-x: auto;
  max-height: 6rem;
  margin: 0;
  margin-block-start: 0.25rem;
`;

// Legacy exports for compatibility
export const EventsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-block-start: 0.75rem;
`;

export const EventCard = styled.div<{ eventType: string }>`
  padding-block: 0.5rem;
  padding-inline: 0.75rem;
  border-radius: 0.5rem;
  background-color: var(--bg-tertiary);
  border-inline-start: 3px solid
    ${({ eventType }) => {
      switch (eventType) {
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
    }};
`;

export const EventTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const EventTitleText = styled.span`
  font-weight: 400;
  opacity: 0.7;
`;

export const EventDescription = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-block-start: 0.25rem;
`;

export const EventData = styled.pre`
  font-size: 0.625rem;
  color: var(--text-muted);
  margin-block-start: 0.25rem;
  background-color: var(--bg-code);
  padding: 0.5rem;
  border-radius: 0.25rem;
  overflow-x: auto;
  max-height: 8rem;
`;

export const InputContainer = styled.div`
  padding-block: 1rem;
  padding-inline: 1rem;
  border-block-start: 1px solid var(--border-color);
  background-color: var(--bg-primary);
`;

export const InputWrapper = styled.form`
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
`;

export const TextArea = styled.textarea`
  flex: 1;
  padding-block: 0.75rem;
  padding-inline: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 1.5rem;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  font-family: inherit;
  resize: none;
  min-height: 2.75rem;
  max-height: 10rem;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: var(--color-primary);
  }

  &::placeholder {
    color: var(--text-muted);
  }
`;

export const SendButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border: none;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: white;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Header = styled.header`
  padding-block: 1rem;
  padding-inline: 1rem;
  border-block-end: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  text-align: center;
`;

export const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

export const Subtitle = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  margin-block-start: 0.25rem;
`;

export const StreamingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-block-start: 0.5rem;
`;

export const PulsingDot = styled.span`
  width: 0.5rem;
  height: 0.5rem;
  background-color: var(--color-primary);
  border-radius: 50%;
  animation: ${pulse} 1.5s infinite;
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 1rem;
  color: var(--text-muted);
  text-align: center;
  padding-inline: 2rem;
`;

export const EmptyStateIcon = styled.div`
  font-size: 3rem;
  opacity: 0.5;
`;

export const EmptyStateText = styled.p`
  font-size: 1rem;
  margin: 0;
`;

export const AssistantLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-block-end: 0.375rem;
`;
