import client from './client';

export const getOverview = async () => {
  const { data } = await client.get('/analytics/overview');
  return data;
};

export const getMessagesByDay = async () => {
  const { data } = await client.get('/analytics/messages-by-day');
  return data;
};

export const getTopIntents = async () => {
  const { data } = await client.get('/analytics/top-intents');
  return data;
};

export const getHandoffRate = async () => {
  const { data } = await client.get('/analytics/handoff-rate');
  return data;
};
