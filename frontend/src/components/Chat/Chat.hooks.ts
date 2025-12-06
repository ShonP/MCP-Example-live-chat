import { useState, useCallback, useRef, useEffect } from 'react';
import type { IAgentEvent, IChatMessage } from '../../types';
import { sendMessageSSE } from '../../api/agent.api';

export const useChat = () => {
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const abortRef = useRef<(() => void) | null>(null);

  const addUserMessage = useCallback((content: string): string => {
    const id = crypto.randomUUID();
    const userMessage: IChatMessage = {
      id,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    return id;
  }, []);

  const addAssistantMessage = useCallback((): string => {
    const id = crypto.randomUUID();
    const assistantMessage: IChatMessage = {
      id,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      events: [],
      isStreaming: true,
    };
    setMessages((prev) => [...prev, assistantMessage]);
    return id;
  }, []);

  const updateAssistantMessage = useCallback(
    (id: string, event: IAgentEvent) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== id) return msg;

          const updatedEvents = [...(msg.events || []), event];
          let updatedContent = msg.content;

          // Update content for message or done events
          if (event.type === 'message' && event.data?.content) {
            updatedContent = event.data.content as string;
          }

          return {
            ...msg,
            events: updatedEvents,
            content: updatedContent,
          };
        })
      );
    },
    []
  );

  const finalizeAssistantMessage = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, isStreaming: false } : msg
      )
    );
  }, []);

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim() || isLoading) return;

      setIsLoading(true);
      addUserMessage(content);
      const assistantId = addAssistantMessage();
      setInputValue('');

      abortRef.current = sendMessageSSE(
        content,
        (event) => {
          updateAssistantMessage(assistantId, event);
        },
        (error) => {
          console.error('SSE Error:', error);
          updateAssistantMessage(assistantId, {
            type: 'error',
            title: 'Error',
            description: error.message,
            timestamp: new Date().toISOString(),
          });
          setIsLoading(false);
          finalizeAssistantMessage(assistantId);
        },
        () => {
          setIsLoading(false);
          finalizeAssistantMessage(assistantId);
        }
      );
    },
    [
      isLoading,
      addUserMessage,
      addAssistantMessage,
      updateAssistantMessage,
      finalizeAssistantMessage,
    ]
  );

  const cancelRequest = useCallback(() => {
    if (abortRef.current) {
      abortRef.current();
      abortRef.current = null;
      setIsLoading(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current();
      }
    };
  }, []);

  return {
    messages,
    isLoading,
    inputValue,
    setInputValue,
    sendMessage,
    cancelRequest,
  };
};
