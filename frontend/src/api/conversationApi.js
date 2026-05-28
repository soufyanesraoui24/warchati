import client from './client';

export const getConversations = async (params) => {
  const { data } = await client.get('/conversations', { params });
  return data;
};

export const getConversationById = async (id) => {
  const { data } = await client.get(`/conversations/${id}`);
  return data;
};

export const updateStatus = async (id, status) => {
  const { data } = await client.patch(`/conversations/${id}/status`, { status });
  return data;
};

export const assignConversation = async (id, userId) => {
  const { data } = await client.patch(`/conversations/${id}/assign`, { userId });
  return data;
};

export const toggleBot = async (id, enabled) => {
  const { data } = await client.patch(`/conversations/${id}/bot`, { enabled });
  return data;
};

export const deleteConversation = async (id) => {
  const { data } = await client.delete(`/conversations/${id}`);
  return data;
};
