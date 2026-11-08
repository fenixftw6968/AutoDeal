import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { wsService } from '../services/websocket';
import { ChatMessage, Campaign } from '../types';
import { Send, Users, Wifi, WifiOff, AlertCircle, Sparkles, Shield, Clock } from 'lucide-react';

interface CampaignChatProps {
  campaign: Campaign;
  isMember: boolean;
  onJoinClick: () => void;
}

export const CampaignChat: React.FC<CampaignChatProps> = ({ campaign, isMember, onJoinClick }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(wsService.getIsConnected());
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Monitor STOMP connection state
  useEffect(() => {
    const unsub = wsService.onConnectionChange((isConnected) => {
      setConnected(isConnected);
    });
    return unsub;
  }, []);

  // Fetch initial chat history
  useEffect(() => {
    if (!isMember) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    api.chat
      .getRecent(campaign.id)
      .then((data) => {
        if (isMounted) {
          setMessages(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load chat history:', err);
          setError('Unable to load chat history. Ensure you are an authorized member.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [campaign.id, isMember]);

  // Subscribe to real-time STOMP topic for this campaign
  useEffect(() => {
    if (!isMember) return;

    const unsubscribe = wsService.subscribeToCampaignChat(campaign.id, (incomingMessage: ChatMessage) => {
      setMessages((prev) => {
        // Prevent duplicate appending
        if (prev.some((m) => m.id === incomingMessage.id)) {
          return prev;
        }
        return [...prev, incomingMessage];
      });
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [campaign.id, isMember]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || !user || !isMember) return;

    const content = inputValue.trim();
    setInputValue('');

    try {
      if (connected) {
        // Direct real-time STOMP publication
        wsService.sendChatMessage(campaign.id, content);
      } else {
        // REST fallback if STOMP socket is temporarily reconnecting
        const saved = await api.chat.sendMessage(campaign.id, content);
        setMessages((prev) => [...prev, saved]);
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper date formatter
  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDate = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  if (!isMember) {
    return (
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[380px]">
        <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 mb-3">
          <Shield className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-stone-900">Member-Only Campaign Chat</h4>
        <p className="text-xs text-stone-500 max-w-sm mt-1 mb-5">
          Join this group-buy campaign to participate in direct discussions with fellow buyers, coordinate on trim options, and review incoming dealership quotes.
        </p>
        <button
          onClick={onJoinClick}
          className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-md hover:bg-stone-800 transition-colors shadow-xs cursor-pointer"
        >
          Join Campaign to Enter Chat
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[520px] bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
      {/* Chat Room Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 bg-stone-50/70">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              {campaign.model} Buyer Group Room
            </h4>
            <span className="text-[11px] text-stone-500">
              {campaign.currentBuyers} verified members in {campaign.city}
            </span>
          </div>
        </div>

        {/* Live WebSocket Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium">
          {connected ? (
            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Wifi className="w-3 h-3" /> Live
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <WifiOff className="w-3 h-3" /> Reconnecting...
            </span>
          )}
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && (
          <div className="text-center py-6 text-xs text-stone-400">Loading conversation history...</div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-2 bg-red-50 text-red-700 text-xs rounded-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center py-10">
            <Sparkles className="w-6 h-6 text-stone-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-stone-700">Group Room Initialized</p>
            <p className="text-[11px] text-stone-500 mt-0.5 max-w-xs mx-auto">
              Welcome! Say hi to your fellow group buyers and discuss desired colors, accessories, and target quotes.
            </p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isOwn = msg.senderId === user?.id;
          const isDealer = msg.senderRole?.includes('DEALER');
          const isSystem = msg.type === 'SYSTEM' || msg.type === 'OFFER_ALERT';

          const prevMsg = messages[index - 1];
          const showDateSeparator =
            !prevMsg || formatDate(prevMsg.timestamp) !== formatDate(msg.timestamp);

          return (
            <React.Fragment key={msg.id || index}>
              {showDateSeparator && (
                <div className="flex items-center justify-center my-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-semibold text-stone-500 bg-stone-100 rounded-full border border-stone-200">
                    {formatDate(msg.timestamp)}
                  </span>
                </div>
              )}

              {isSystem ? (
                <div className="p-2.5 my-2 bg-blue-50/70 border border-blue-100 rounded-lg text-center">
                  <span className="text-xs font-medium text-blue-900">{msg.content}</span>
                  <span className="block text-[10px] text-blue-500 mt-0.5">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              ) : (
                <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-semibold text-stone-700">
                      {isOwn ? 'You' : msg.senderName}
                    </span>
                    {isDealer && (
                      <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                        Dealer
                      </span>
                    )}
                    <span className="text-[10px] text-stone-400">{formatTime(msg.timestamp)}</span>
                  </div>

                  <div
                    className={`max-w-[80%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                      isOwn
                        ? 'bg-stone-900 text-white rounded-br-xs'
                        : 'bg-stone-100 text-stone-900 rounded-bl-xs border border-stone-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="p-3 bg-stone-50 border-t border-stone-200">
        <div className="flex items-end gap-2 bg-white border border-stone-200 rounded-lg p-1.5 focus-within:ring-1 focus-within:ring-stone-900">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={2000}
            placeholder="Type your message... (Enter to send, Shift+Enter for newline)"
            className="flex-1 max-h-24 resize-none border-none bg-transparent px-2 py-1 text-xs text-stone-900 placeholder-stone-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="p-2 bg-stone-900 text-white rounded-md hover:bg-stone-800 disabled:opacity-30 transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex justify-between items-center px-1 mt-1.5">
          <span className="text-[10px] text-stone-400">
            Messages are visible to all {campaign.currentBuyers} authorized members.
          </span>
          <span className="text-[10px] text-stone-400">{inputValue.length}/2000</span>
        </div>
      </form>
    </div>
  );
};
