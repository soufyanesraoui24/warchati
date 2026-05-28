import React from 'react';
import { CheckCircle2, XCircle, Webhook, Clock, Zap } from 'lucide-react';
import { cn } from '../utils';
import { formatRelativeTime } from '../utils/formatDate';

export default function ChannelStatusCard({ name, icon: Icon, isConnected, lastMessage, webhookUrl, onTest }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            isConnected ? 'bg-emerald-500/10' : 'bg-red-500/10'
          )}>
            <Icon className={cn('w-6 h-6', isConnected ? 'text-emerald-500' : 'text-red-500')} />
          </div>
          <div>
            <h3 className="font-bold text-lg">{name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              {isConnected ? (
                <span className="flex items-center gap-1 text-sm text-emerald-500 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  متصل
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm text-red-500 font-medium">
                  <XCircle className="w-3.5 h-3.5" />
                  غير متصل
                </span>
              )}
            </div>
          </div>
        </div>
        <div className={cn(
          'w-3 h-3 rounded-full animate-pulse',
          isConnected ? 'bg-emerald-500' : 'bg-red-500'
        )} />
      </div>

      <div className="space-y-3 mt-4 pt-4 border-t border-border">
        {webhookUrl && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Webhook className="w-4 h-4 shrink-0" />
            <span className="truncate font-mono text-xs" dir="ltr">{webhookUrl}</span>
          </div>
        )}
        {lastMessage && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 shrink-0" />
            <span>آخر رسالة: {formatRelativeTime(lastMessage)}</span>
          </div>
        )}
      </div>

      <button
        onClick={onTest}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold py-2.5 px-4 rounded-xl transition-colors text-sm"
      >
        <Zap className="w-4 h-4" />
        اختبار الاتصال
      </button>
    </div>
  );
}
