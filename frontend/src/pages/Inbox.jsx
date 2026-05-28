import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { cn } from '../utils';
import { getConversations } from '../api/conversationApi';
import { getMessages, sendMessage } from '../api/messageApi';
import { analyzeMessage, generateReply } from '../api/aiApi';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import SuggestedReply from '../components/SuggestedReply';
import AIAnalysisPanel from '../components/AIAnalysisPanel';

export default function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [analysis, setAnalysis] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [aiActive, setAiActive] = useState(true);
  const { socket } = useSocket();

  const fetchConversationsList = useCallback(async () => {
    try {
      const params = {};
      if (platformFilter !== 'all') params.platform = platformFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      const data = await getConversations(params);
      setConversations(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [platformFilter, statusFilter]);

  useEffect(() => {
    fetchConversationsList();
  }, [fetchConversationsList]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = () => {
      fetchConversationsList();
      if (selectedConv) {
        loadMessages(selectedConv.id || selectedConv._id);
      }
    };

    const handleAiResponse = () => {
      fetchConversationsList();
      if (selectedConv) {
        loadMessages(selectedConv.id || selectedConv._id);
      }
    };

    const handleAiToggled = (data) => {
      if (data.conversationId === (selectedConv?.id || selectedConv?._id)) {
        setAiActive(data.aiActive);
      }
      fetchConversationsList();
    };

    socket.on('new_user_message', handleNewMessage);
    socket.on('new_ai_response', handleAiResponse);
    socket.on('handoff_alert', fetchConversationsList);
    socket.on('ai_toggled', handleAiToggled);

    return () => {
      socket.off('new_user_message', handleNewMessage);
      socket.off('new_ai_response', handleAiResponse);
      socket.off('handoff_alert', fetchConversationsList);
      socket.off('ai_toggled', handleAiToggled);
    };
  }, [socket, selectedConv]);

  const loadMessages = async (convId) => {
    if (!convId) return;
    setMessagesLoading(true);
    try {
      const data = await getMessages(convId);
      setMessages(Array.isArray(data) ? data : data?.data || []);
      analyzeLatestMessage(convId, data);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const analyzeLatestMessage = async (convId, msgs) => {
    const msgsArray = Array.isArray(msgs) ? msgs : msgs?.data || [];
    const lastUserMsg = [...msgsArray].reverse().find(m => m.sender === 'user');

    if (lastUserMsg) {
      try {
        const result = await analyzeMessage(lastUserMsg.text);
        setAnalysis(result?.analysis || result);
      } catch (e) {
        console.error('Analysis error:', e);
      }

      setChatLoading(true);
      try {
        const replyResult = await generateReply(convId, lastUserMsg.text);
        setSuggestion(replyResult?.suggestion || replyResult);
      } catch (e) {
        console.error('Generate reply error:', e);
      } finally {
        setChatLoading(false);
      }
    }
  };

  const handleSelectConversation = async (conv) => {
    // إيقاف AI تلقائياً عند فتح المحادثة
    setSelectedConv(conv);
    setAiActive(false);
    if (socket) {
      socket.emit('pause_ai', conv.id || conv._id);
    }
    setAnalysis(null);
    setSuggestion(null);
    await loadMessages(conv.id || conv._id);
  };

  const handleCloseConversation = () => {
    // تشغيل AI تلقائياً عند ترك المحادثة
    const convId = selectedConv?.id || selectedConv?._id;
    if (convId && socket) {
      socket.emit('resume_ai', convId);
    }
    setSelectedConv(null);
    setAiActive(false);
    setMessages([]);
    setAnalysis(null);
    setSuggestion(null);
  };

  const handleToggleAi = () => {
    const convId = selectedConv?.id || selectedConv?._id;
    if (!convId || !socket) return;
    const newState = !aiActive;
    setAiActive(newState);
    socket.emit(newState ? 'resume_ai' : 'pause_ai', convId);
  };

  const handleSendMessage = async (text) => {
    if (!selectedConv) return;
    const convId = selectedConv.id || selectedConv._id;

    try {
      const newMsg = await sendMessage(convId, text);
      setMessages(prev => [...prev, newMsg]);
      setSelectedConv(prev => ({ ...prev, status: prev.status !== 'HANDOFF' ? 'HANDOFF' : prev.status }));
      fetchConversationsList();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleAcceptSuggestion = (sug) => {
    setSuggestion({ ...sug, isEditing: true });
  };

  const handleEditSuggestion = (edited) => {
    setSuggestion(edited);
  };

  const handleRejectSuggestion = () => {
    setSuggestion(null);
  };

  const handleSendSuggestion = async (sug) => {
    if (!selectedConv) return;
    const convId = selectedConv.id || selectedConv._id;
    const text = sug.text || sug.suggestedReply || '';
    if (!text.trim()) return;

    try {
      const newMsg = await sendMessage(convId, text);
      setMessages(prev => [...prev, newMsg]);
      setSuggestion(null);
      setAnalysis(null);
      fetchConversationsList();
    } catch (err) {
      console.error('Error sending suggestion:', err);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const name = (conv.name || conv.senderId || '').toLowerCase();
    const lastMsg = (conv.lastMessage?.text || conv.lastMessage || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return !q || name.includes(q) || lastMsg.includes(q);
  });

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-card border border-border rounded-xl overflow-hidden shadow-sm" dir="rtl">
      <div className="w-[320px] shrink-0 border-l border-border flex flex-col">
        <div className="p-3 border-b border-border bg-card space-y-2">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            صندوق الوارد
          </h2>
          <div className="flex gap-2">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="flex-1 bg-background border border-border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">كل المنصات</option>
              <option value="facebook">فيسبوك</option>
              <option value="whatsapp">واتساب</option>
              <option value="instagram">انستغرام</option>
              <option value="manual">يدوي</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 bg-background border border-border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">كل الحالات</option>
              <option value="ACTIVE">AI نشط</option>
              <option value="HANDOFF">يدوي</option>
              <option value="RESOLVED">منتهية</option>
            </select>
          </div>
        </div>
        <ConversationList
          conversations={filteredConversations}
          selectedId={selectedConv?.id || selectedConv?._id}
          onSelect={handleSelectConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          loading={loading}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {selectedConv && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-card border-b border-border">
            <span className="text-xs text-muted-foreground">
              {aiActive ? '🤖 الرد التلقائي شغال' : '✋ الردود يدوية - AI متوقف'}
            </span>
            <button
              onClick={handleCloseConversation}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-secondary transition-colors"
            >
              ✕ إغلاق المحادثة
            </button>
          </div>
        )}
        <ChatWindow
          messages={messages}
          onSendMessage={handleSendMessage}
          loading={messagesLoading}
          conversation={selectedConv}
          isAiActive={aiActive}
          onToggleAi={handleToggleAi}
        />
      </div>

      <div className="w-[300px] shrink-0 border-r border-border bg-card/50 flex flex-col overflow-y-auto">
        {chatLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <AIAnalysisPanel analysis={analysis} />
            <div className="border-t border-border mt-auto">
              <SuggestedReply
                suggestion={suggestion}
                onAccept={handleAcceptSuggestion}
                onEdit={handleEditSuggestion}
                onReject={handleRejectSuggestion}
                onSend={handleSendSuggestion}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
