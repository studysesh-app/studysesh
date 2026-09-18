import { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
}

export function ChatInput({ onSend, placeholder = 'Type a message...' }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-card px-4 py-3">
      <div className="flex items-end gap-2 max-w-2xl mx-auto">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 rounded-2xl focus:outline-none transition-all text-foreground placeholder:text-muted-foreground"
          style={{
            fontSize: 'var(--text-base)',
            background: 'light-dark(linear-gradient(145deg, rgba(250, 250, 250, 1) 0%, rgba(245, 245, 245, 1) 100%), linear-gradient(145deg, rgba(30, 30, 30, 1) 0%, rgba(25, 25, 25, 1) 100%))',
            boxShadow: 'light-dark(inset 2px 2px 4px rgba(0, 0, 0, 0.1), inset -1px -1px 3px rgba(255, 255, 255, 0.9), inset 2px 2px 4px rgba(0, 0, 0, 0.4), inset -1px -1px 3px rgba(50, 50, 50, 0.3))',
            border: '1px solid light-dark(rgba(230, 230, 230, 0.8), rgba(50, 50, 50, 0.8))',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
            message.trim()
              ? 'hover:brightness-105 active:scale-95'
              : 'cursor-not-allowed opacity-50'
          }`}
          style={
            message.trim()
              ? {
                  background: 'linear-gradient(180deg, #db2321 0%, #a01a18 100%)',
                  boxShadow: '0 4px 12px rgba(219, 35, 33, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(160, 26, 24, 0.5)',
                  color: 'white',
                }
              : {
                  background: 'light-dark(linear-gradient(145deg, rgba(240, 240, 240, 1) 0%, rgba(220, 220, 220, 1) 100%), linear-gradient(145deg, rgba(35, 35, 35, 1) 0%, rgba(25, 25, 25, 1) 100%))',
                  boxShadow: 'light-dark(inset 1px 1px 3px rgba(0, 0, 0, 0.1), inset -1px -1px 3px rgba(255, 255, 255, 0.9), inset 1px 1px 3px rgba(0, 0, 0, 0.4), inset -1px -1px 3px rgba(50, 50, 50, 0.3))',
                  border: '1px solid light-dark(rgba(200, 200, 200, 0.5), rgba(50, 50, 50, 0.5))',
                  color: 'var(--muted-foreground)',
                }
          }
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}