import React from 'react';
import { MessageSquare, Facebook, Instagram, Phone, Search, Loader2 } from 'lucide-react';
import { cn } from '../utils';
import { formatMessageTime } from '../utils/formatDate';

const PLATFORM_CONFIG = {
  facebook: { icon: Facebook, color: 'text-blue-500' },
  whatsapp: { icon: Phone, color: 'text-green-500' },
  instagram: { icon: Instagram, color: 'text-pink-500' },
  messenger: { icon: Facebook, color: 'text-blue-500' },
};

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  loading,
}) {
  return (
    <div className="flex flex-col h-full bg-card/50">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="بحث في المحادثات..."
            className="w-full bg-background border border-border rounded-xl pr-10 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            لا توجد محادثات
          </div>
        ) : (
          conversations.map((conv) => {
            const PlatformIcon = PLATFORM_CONFIG[conv.platform?.toLowerCase()]?.icon || MessageSquare;
            const platformColor = PLATFORM_CONFIG[conv.platform?.toLowerCase()]?.color || 'text-gray-400';
            const lastMsg = conv.lastMessage?.text || conv.lastMessage || 'رسالة جديدة';
            const isSelected = selectedId === conv.id || selectedId === conv._id;

            return (
              <div
                key={conv.id || conv._id}
                onClick={() => onSelect(conv)}
                className={cn(
                  'p-3 border-b border-border cursor-pointer hover:bg-secondary/40 transition-all flex gap-3',
                  isSelected ? 'bg-secondary border-r-2 border-r-primary' : ''
                )}
              >
                <div className="relative shrink-0">
                  <div className="w-11 h-11 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                    {conv.name ? conv.name.charAt(0) : conv.senderId?.charAt(0) || '?'}
                  </div>
                  <div className={cn(
                    'absolute -bottom-0.5 -left-0.5 bg-background rounded-full p-0.5 shadow-sm',
                    platformColor
                  )}>
                    <PlatformIcon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h3 className="font-bold text-sm truncate">{conv.name || conv.senderId || 'زبون'}</h3>
                    <span className="text-[10px] text-muted-foreground shrink-0 mr-2">
                      {formatMessageTime(conv.updatedAt || conv.lastMessageAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{lastMsg}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {conv.unread > 0 && (
                      <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                        {conv.unread}
                      </span>
                    )}
                    {conv.aiActive === false && (
                      <span className="text-[10px] text-amber-500 font-medium">يدوي</span>
                    )}
                    {conv.aiActive !== false && conv.status !== 'HANDOFF' && (
                      <span className="text-[10px] text-emerald-500 font-medium">AI</span>
                    )}
                    {conv.status === 'HANDOFF' && conv.aiActive !== false && (
                      <span className="text-[10px] text-red-500 font-medium">تحويل</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
