import client from './client';

export const analyzeMessage = async (text) => {
  const { data } = await client.post('/ai/analyze', { text });
  return data;
};

export const generateReply = async (conversationId, text) => {
  const { data } = await client.post('/ai/generate-reply', { conversationId, text });
  return data;
};

export const getBotStatus = async () => {
  const { data } = await client.get('/ai/bot-status');
  return data;
};
