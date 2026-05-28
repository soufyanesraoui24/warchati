import React, { useRef, useEffect, useState } from 'react';
import { Send, User, Bot, Facebook, Instagram, Phone, MessageSquare, Loader2, Power, PowerOff } from 'lucide-react';
import { cn } from '../utils';
import { formatMessageTime } from '../utils/formatDate';

const PLATFORM_CONFIG = {
  facebook: { icon: Facebook, color: 'text-blue-500' },
  whatsapp: { icon: Phone, color: 'text-green-500' },
  instagram: { icon: Instagram, color: 'text-pink-500' },
  messenger: { icon: Facebook, color: 'text-blue-500' },
};

const SENTIMENT_COLORS = {
  positive: 'text-emerald-500 bg-emerald-500/10',
  negative: 'text-red-500 bg-red-500/10',
  neutral: 'text-gray-500 bg-gray-500/10',
};

export default function ChatWindow({ messages, onSendMessage, loading, currentUserId, conversation, isAiActive, onToggleAi }) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage?.(inputText.trim());
    setInputText('');
  };

  const PlatformIcon = conversation
    ? (PLATFORM_CONFIG[conversation.platform?.toLowerCase()]?.icon || MessageSquare)
    : null;
  const platformColor = conversation
    ? (PLATFORM_CONFIG[conversation.platform?.toLowerCase()]?.color || 'text-gray-400')
    : '';

  return (
    <div className="flex flex-col h-full bg-background">
      {conversation ? (
        <>
          <div className="p-4 border-b border-border bg-card flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                {conversation.name?.charAt(0) || conversation.senderId?.charAt(0) || '?'}
              </div>
              <div>
                <h3 className="font-bold">{conversation.name || conversation.senderId || 'زبون'}</h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {PlatformIcon && <PlatformIcon className={cn('w-3.5 h-3.5', platformColor)} />}
                  <span>{conversation.platform}</span>
                  <span className={cn(
                    'px-1.5 py-0.5 rounded-full text-[10px] font-medium',
                    isAiActive
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-amber-500/10 text-amber-500'
                  )}>
                    {isAiActive ? 'AI' : 'يدوي'}
                  </span>
                </div>
              </div>
            </div>

            {/* زر تشغيل/إيقاف AI */}
            <button
              onClick={onToggleAi}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                isAiActive
                  ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
              )}
              title={isAiActive ? 'إيقاف الذكاء الاصطناعي' : 'تشغيل الذكاء الاصطناعي'}
            >
              {isAiActive ? <Power className="w-3.5 h-3.5" /> : <PowerOff className="w-3.5 h-3.5" />}
              {isAiActive ? 'AI شغال' : 'AI متوقف'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
                <p className="text-sm">لا توجد رسائل بعد</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isUser = msg.sender === 'user';
                const isBot = msg.sender === 'bot' || msg.sender === 'ai';
                const isAgent = msg.sender === 'agent' || msg.sender === 'employee';
                const isMine = msg.senderId === currentUserId || isAgent;

                return (
                  <div key={msg.id || msg._id || idx} className={cn('flex flex-col max-w-[80%]', isUser ? 'ml-auto items-start' : 'mr-auto items-end')}>
                    <div className={cn(
                      'p-3 rounded-2xl shadow-sm relative',
                      isUser ? 'bg-card border border-border text-foreground rounded-br-sm' :
                      isBot ? 'bg-primary text-primary-foreground rounded-bl-sm' :
                      'bg-amber-600 text-white rounded-bl-sm'
                    )}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      {msg.images && msg.images.length > 0 && (
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {msg.images.slice(0, 3).map((url, i) => (
                            <img key={i} src={url} alt="" className="w-20 h-20 rounded-lg object-cover border border-white/20" onError={(e) => e.target.style.display = 'none'} />
                          ))}
                        </div>
                      )}
                      {isUser && msg.sentiment && (
                        <span className={cn(
                          'absolute -bottom-4 right-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                          SENTIMENT_COLORS[msg.sentiment?.toLowerCase()] || 'text-gray-500 bg-gray-500/10'
                        )}>
                          {msg.sentiment}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1.5 px-1 flex items-center gap-1">
                      {isUser ? 'الزبون' : isBot ? 'وردة (AI)' : 'موظف'}
                      <span>•</span>
                      {formatMessageTime(msg.createdAt || msg.timestamp)}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {conversation.status !== 'HANDOFF' && isAiActive && (
            <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950/30 border-t border-border">
              <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" />
                إرسال رسالة سيلغي تفعيل البوت لهذه المحادثة
              </p>
            </div>
          )}

          <form onSubmit={handleSend} className="p-4 bg-card border-t border-border shrink-0">
            <div className="relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="اكتب رسالتك..."
                className="w-full bg-background border border-border rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-9 h-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                <Send className="w-4 h-4 mr-0.5" />
              </button>
            </div>
          </form>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
          <h3 className="text-xl font-bold opacity-50">اختر محادثة للبدء</h3>
          <p className="text-sm mt-2 opacity-50">ستظهر هنا رسائل المحادثة المحددة</p>
        </div>
      )}
    </div>
  );
}
