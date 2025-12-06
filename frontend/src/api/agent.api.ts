import type { IAgentEvent } from '../types';

export const sendMessageSSE = (
  message: string,
  onEvent: (event: IAgentEvent) => void,
  onError: (error: Error) => void,
  onComplete: () => void
): (() => void) => {
  const abortController = new AbortController();

  fetch('http://localhost:3000/agent/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
    signal: abortController.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          onComplete();
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)) as IAgentEvent;
              onEvent(data);

              if (data.type === 'done') {
                onComplete();
                return;
              }
            } catch {
              // Ignore parse errors for incomplete JSON
            }
          }
        }
      }
    })
    .catch((error) => {
      if (error.name !== 'AbortError') {
        onError(error);
      }
    });

  return () => {
    abortController.abort();
  };
};
