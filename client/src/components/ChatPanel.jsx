import { useEffect, useState, useRef } from 'react';
import Button from './ui/Button';

export default function ChatPanel({ socketApi, roomId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!socketApi?.on) return;

    const handler = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socketApi.on('chat-message', handler);

    return () => {
      socketApi.off('chat-message', handler);
    };
  }, [socketApi]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = {
      roomId,
      userId: currentUser?.id,
      userName: currentUser?.fullName || 'User',
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };
    socketApi?.emit('chat-message', msg);
    setMessages((prev) => [...prev, msg]); // optimistic
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-base-200 rounded-lg">
      <div className="px-4 py-2 bg-base-300 font-semibold">Chat</div>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 text-sm">
        {messages.map((m, i) => (
          <div key={i} className="flex flex-col">
            <span className="font-semibold">
              {m.userName}{' '}
              <span className="text-xs text-base-content/60">
                {new Date(m.timestamp).toLocaleTimeString()}
              </span>
            </span>
            <span className="bg-base-100 rounded px-2 py-1">
              {m.text}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-base-300">
        <textarea
          rows={2}
          className="textarea textarea-bordered w-full text-sm"
          placeholder="Type a message and press Enter..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="flex justify-end mt-2">
          <Button size="sm" variant="primary" onClick={sendMessage} disabled={!input.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
    