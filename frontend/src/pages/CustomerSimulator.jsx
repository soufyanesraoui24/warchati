import React, { useState, useEffect, useRef } from 'react';
import { Send, Smartphone, User, Bot, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../utils';
import client from '../api/client';

export default function CustomerSimulator() {
  const [customerName, setCustomerName] = useState(() => localStorage.getItem('sim_customer') || '');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = async () => {
    const name = customerName.trim();
    if (!name) return;
    setLoading(true);
    setError(null);
    try {
      const { data: listRes } = await client.get('/conversations', {
        params: { status: 'ACTIVE', limit: 10 }
      });
      const convs = listRes?.data || [];
      const match = convs.find(c =>
        c.name?.toLowerCase() === name.toLowerCase()
      );
      if (match) {
        const { data: msgRes } = await client.get(`/conversations/${match._id}/messages`);
        const msgs = msgRes?.data || [];
        setMessages(msgs);
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !customerName.trim()) return;

    const name = customerName.trim();
    localStorage.setItem('sim_customer', name);

    setSending(true);
    setError(null);

    const fakeUserMsg = { sender: 'user', text: messageText.trim(), _temp: true };
    setMessages(prev => [...prev, fakeUserMsg]);

    try {
      const { data } = await client.post('/simulator/message', {
        customerName: name,
        platform: 'manual',
        text: messageText.trim()
      });
      const botReply = data?.data?.botReply;
      if (botReply) {
        setMessages(prev => [...prev.filter(m => m !== fakeUserMsg), {
          sender: 'bot',
          text: botReply.text,
          intent: botReply.intent,
          sentiment: botReply.sentiment
        }]);
      }
      await loadConversation();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل إرسال الرسالة');
      setMessages(prev => prev.filter(m => m !== fakeUserMsg));
    } finally {
      setSending(false);
      setMessageText('');
    }
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

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex gap-2">
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="اسم الزبون"
          />
          <button
            onClick={loadConversation}
            className="px-3 rounded-xl border border-border text-muted-foreground hover:bg-secondary/50 transition-colors"
            title="تحميل المحادثة"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading && (
          <div className="text-center text-sm text-muted-foreground py-4">
            <Loader2 className="w-5 h-5 animate-spin inline ml-2" />
            جاري التحميل...
          </div>
        )}

        {messages.length > 0 && (
          <div className="bg-background rounded-xl border border-border p-4 space-y-3 max-h-96 overflow-y-auto">
            {messages.map((msg, idx) => (
              <div key={idx} className={cn(
                'flex gap-2',
                msg.sender === 'user' ? '' : 'flex-row-reverse'
              )}>
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold',
                  msg.sender === 'user' ? 'bg-primary/10 text-primary' : 'bg-emerald-500/10 text-emerald-500'
                )}>
                  {msg.sender === 'user' ? 'ز' : 'ب'}
                </div>
                <div className={cn(
                  'max-w-[80%] rounded-xl px-3 py-2 text-sm',
                  msg.sender === 'user'
                    ? 'bg-primary/10 text-foreground'
                    : 'bg-emerald-500/10 text-foreground'
                )}>
                  <p className="leading-relaxed">{msg.text}</p>
                  {msg.sender === 'bot' && (msg.intent || msg.sentiment) && (
                    <div className="flex gap-2 mt-1.5">
                      {msg.intent && (
                        <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                          {msg.intent}
                        </span>
                      )}
                      {msg.sentiment && (
                        <span className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded',
                          msg.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-500' :
                          msg.sentiment === 'negative' ? 'bg-red-500/20 text-red-500' :
                          'bg-gray-500/20 text-gray-500'
                        )}>
                          {msg.sentiment === 'positive' ? 'إيجابية' :
                           msg.sentiment === 'negative' ? 'سلبية' : 'محايدة'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}

        {!loading && messages.length === 0 && customerName.trim() && (
          <p className="text-center text-sm text-muted-foreground py-4">
            لا توجد محادثة سابقة. أرسل أول رسالة للبدء.
          </p>
        )}

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            required
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="اكتب رسالة الزبون..."
          />
          <button
            type="submit"
            disabled={sending || !messageText.trim() || !customerName.trim()}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-3 rounded-xl text-sm">{error}</div>
        )}
      </div>
    </div>
  );
}
