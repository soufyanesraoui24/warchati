import { useState, useCallback, useEffect } from 'react';
import { getConversations } from '../api/conversationApi';

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConversations = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getConversations(params);
      setConversations(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تحميل المحادثات');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectConversation = useCallback((conv) => {
    setSelectedConversation(conv);
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    selectedConversation,
    selectConversation,
    fetchConversations,
    loading,
    error,
  };
}
