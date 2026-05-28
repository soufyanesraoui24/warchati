import client from './client';

export const getMessages = async (conversationId, params) => {
  const { data } = await client.get(`/conversations/${conversationId}/messages`, { params });
  return data;
};

export const sendMessage = async (conversationId, text) => {
  const { data } = await client.post(`/conversations/${conversationId}/messages`, { text });
  return data;
};

export const sendSuggestedReply = async (messageId) => {
  const { data } = await client.post(`/messages/${messageId}/suggested-reply`);
  return data;
};
