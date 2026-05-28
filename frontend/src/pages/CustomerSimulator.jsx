import React, { useState } from 'react';
import { Send, Smartphone, User, Facebook, Phone as PhoneIcon, Bot, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils';
import client from '../api/client';

const PLATFORMS = [
  { value: 'manual', label: 'يدوي (Manual)', icon: User, color: 'text-gray-500' },
  { value: 'facebook', label: 'فيسبوك (Messenger)', icon: Facebook, color: 'text-blue-500' },
  { value: 'whatsapp', label: 'واتساب (WhatsApp)', icon: PhoneIcon, color: 'text-green-500' },
];

export default function CustomerSimulator() {
  const [customerName, setCustomerName] = useState('');
  const [platform, setPlatform] = useState('manual');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setSending(true);
    setError(null);
    setResult(null);

    const payload = {
      customerName: customerName.trim() || `زبون_${Date.now()}`,
      platform,
      text: messageText.trim(),
    };

    try {
      const { data } = await client.post('/simulator/message', payload);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل إرسال الرسالة');
    } finally {
      setSending(false);
    }
  };

  const SelectedPlatform = PLATFORMS.find((p) => p.value === platform);

  const reset = () => {
    setResult(null);
    setMessageText('');
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Smartphone className="w-7 h-7 text-primary" />
          محاكي الزبون
        </h2>
        <p className="text-sm text-muted-foreground mt-1">اختبار البوت عن طريق محاكاة رسائل العملاء</p>
      </div>

      {!result ? (
        <form onSubmit={handleSend} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">اسم الزبون (اختياري)</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="مثال: أحمد"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">المنصة</label>
            <div className="flex gap-2">
              {PLATFORMS.map((pf) => (
                <button
                  key={pf.value}
                  type="button"
                  onClick={() => setPlatform(pf.value)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all',
                    platform === pf.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                  )}
                >
                  <pf.icon className={cn('w-4 h-4', pf.color)} />
                  {pf.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">نص الرسالة</label>
            <textarea
              required
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={4}
              placeholder="اكتب رسالة الزبون هنا... مثال: السلام عليكم، شحال السومة?"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-500 p-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={sending || !messageText.trim()}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {sending ? 'جاري الإرسال...' : 'إرسال كزبون'}
          </button>

          <p className="text-xs text-muted-foreground text-center">
            ستظهر الرسالة في صندوق الوارد وسيحللها البوت ويعطي رداً مقترحاً
          </p>
        </form>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-bold">تم إرسال الرسالة بنجاح</span>
            </div>
            <button
              onClick={reset}
              className="text-sm text-primary font-bold hover:underline"
            >
              إرسال رسالة أخرى
            </button>
          </div>

          <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{result.customerName || customerName || 'الزبون'}</span>
              {SelectedPlatform && (
                <span className={cn('flex items-center gap-1 text-xs', SelectedPlatform.color)}>
                  <SelectedPlatform.icon className="w-3.5 h-3.5" />
                  {SelectedPlatform.label}
                </span>
              )}
            </div>
            <div className="bg-background rounded-xl p-3 text-sm border border-border">
              {messageText}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-5 h-5 text-primary" />
              <span className="font-bold">نتيجة التحليل</span>
            </div>

            {result.analysis ? (
              <div className="space-y-3">
                {result.analysis.intent && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">النية:</span>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{result.analysis.intent}</span>
                  </div>
                )}
                {result.analysis.sentiment && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">المشاعر:</span>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full font-medium',
                      result.analysis.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-500' :
                      result.analysis.sentiment === 'negative' ? 'bg-red-500/10 text-red-500' :
                      'bg-gray-500/10 text-gray-500'
                    )}>
                      {result.analysis.sentiment === 'positive' ? 'إيجابية' :
                       result.analysis.sentiment === 'negative' ? 'سلبية' : 'محايدة'}
                    </span>
                  </div>
                )}
                {result.analysis.suggestedReply && (
                  <div>
                    <span className="text-xs text-muted-foreground">الرد المقترح:</span>
                    <p className="bg-background border border-border rounded-xl p-3 text-sm mt-1 leading-relaxed">
                      {result.analysis.suggestedReply}
                    </p>
                  </div>
                )}
              </div>
            ) : result.message ? (
              <p className="text-sm text-muted-foreground">{result.message}</p>
            ) : (
              <p className="text-sm text-muted-foreground">الرسالة قيد المعالجة، تحقق من صندوق الوارد لرؤية التحليل</p>
            )}
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-sm text-amber-600 flex items-center gap-2">
            <Bot className="w-4 h-4 shrink-0" />
            <span>اذهب إلى <strong>صندوق الوارد</strong> لمشاهدة الرد الكامل والتفاعل مع المحادثة</span>
          </div>
        </div>
      )}
    </div>
  );
}
