import React, { useState, useEffect } from 'react';
import { Facebook, Phone, RefreshCw, CheckCircle2, XCircle, Zap } from 'lucide-react';
import { cn } from '../utils';
import client from '../api/client';
import ChannelStatusCard from '../components/ChannelStatusCard';

const CHANNELS = [
  { key: 'facebook', name: 'فيسبوك (Messenger)', icon: Facebook },
  { key: 'whatsapp', name: 'واتساب (Business API)', icon: Phone },
];

export default function Channels() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/channels/status');
      setChannels(
        CHANNELS.map((ch) => ({
          ...ch,
          isConnected: data[ch.key]?.isConnected ?? false,
          lastMessage: data[ch.key]?.lastMessage ?? null,
          webhookUrl: data[ch.key]?.webhookUrl ?? null,
        }))
      );
    } catch (err) {
      console.error('Error fetching channel status:', err);
      setChannels(CHANNELS.map((ch) => ({ ...ch, isConnected: false, lastMessage: null, webhookUrl: null })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTest = async (channelKey) => {
    setTesting(channelKey);
    try {
      const { data } = await client.post(`/channels/${channelKey}/test`);
      if (data.success) {
        fetchStatus();
      }
    } catch (err) {
      console.error(`Test connection error for ${channelKey}:`, err);
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">القنوات المتصلة</h2>
          <p className="text-sm text-muted-foreground mt-1">حالة اتصال منصات التواصل</p>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center gap-2 bg-secondary text-secondary-foreground font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-opacity text-sm"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          تحديث
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-muted-foreground">جاري التحميل...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {channels.map((channel) => (
            <ChannelStatusCard
              key={channel.key}
              name={channel.name}
              icon={channel.icon}
              isConnected={channel.isConnected}
              lastMessage={channel.lastMessage}
              webhookUrl={channel.webhookUrl}
              onTest={() => handleTest(channel.key)}
              isTesting={testing === channel.key}
            />
          ))}
        </div>
      )}
    </div>
  );
}
