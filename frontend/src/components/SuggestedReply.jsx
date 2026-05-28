import React, { useState } from 'react';
import { Check, Edit3, X, Send, Tag, Brain } from 'lucide-react';
import { cn } from '../utils';

export default function SuggestedReply({ suggestion, onAccept, onEdit, onReject, onSend }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');

  if (!suggestion) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
        <Send className="w-10 h-10 mb-3 opacity-30" />
        <p className="text-sm font-medium">لا يوجد رد مقترح</p>
        <p className="text-xs mt-1 opacity-60">سينشئ الذكاء الاصطناعي رداً مقترحاً تلقائياً</p>
      </div>
    );
  }

  const handleAccept = () => {
    setIsEditing(true);
    setEditedText(suggestion.text || suggestion.suggestedReply || '');
    onAccept?.(suggestion);
  };

  const handleSaveEdit = () => {
    onEdit?.({ ...suggestion, text: editedText });
    setIsEditing(false);
  };

  const handleReject = () => {
    onReject?.(suggestion);
  };

  const text = suggestion.text || suggestion.suggestedReply || '';

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="font-bold">الرد المقترح</h3>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        {suggestion.intent && (
          <div className="flex items-center gap-1.5 mb-2">
            <Tag className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium">
              {suggestion.intent}
            </span>
            {suggestion.sentiment && (
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                suggestion.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-500' :
                suggestion.sentiment === 'negative' ? 'bg-red-500/10 text-red-500' :
                'bg-gray-500/10 text-gray-500'
              )}>
                {suggestion.sentiment === 'positive' ? 'إيجابي' :
                 suggestion.sentiment === 'negative' ? 'سلبي' : 'محايد'}
              </span>
            )}
          </div>
        )}

        {isEditing ? (
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full bg-background border border-border rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows={3}
          />
        ) : (
          <p className="text-sm text-foreground bg-secondary/50 rounded-xl p-3 leading-relaxed">
            {text}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        {isEditing ? (
          <>
            <button
              onClick={handleSaveEdit}
              className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground font-bold py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity"
            >
              <Check className="w-4 h-4" />
              حفظ
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-secondary text-secondary-foreground font-bold py-2.5 rounded-xl text-sm hover:opacity-80 transition-opacity"
            >
              <X className="w-4 h-4" />
              إلغاء
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onSend?.(suggestion)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground font-bold py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
              إرسال
            </button>
            <button
              onClick={handleAccept}
              className="flex items-center justify-center gap-1.5 bg-emerald-500/10 text-emerald-600 font-bold py-2.5 px-4 rounded-xl text-sm hover:bg-emerald-500/20 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              تعديل
            </button>
            <button
              onClick={handleReject}
              className="flex items-center justify-center gap-1.5 bg-gray-500/10 text-gray-600 font-bold py-2.5 px-4 rounded-xl text-sm hover:bg-gray-500/20 transition-colors"
            >
              <X className="w-4 h-4" />
              رفض
            </button>
          </>
        )}
      </div>
    </div>
  );
}
