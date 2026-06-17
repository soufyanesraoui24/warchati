import client from './client';

export const getOverview = async (days = 1) => {
  const { data } = await client.get(`/analytics/overview?days=${days}`);
  return data?.data;
};

export const getMessagesByDay = async (days = 30) => {
  const { data } = await client.get(`/analytics/messages-by-day?days=${days}`);
  return data?.data;
};

export const getTopIntents = async (days = 30) => {
  const { data } = await client.get(`/analytics/top-intents?days=${days}`);
  return data?.data;
};

export const getHandoffRate = async (days = 30) => {
  const { data } = await client.get(`/analytics/handoff-rate?days=${days}`);
  return data?.data;
};

export const getSentimentTrend = async (days = 30) => {
  const { data } = await client.get(`/analytics/sentiment-trend?days=${days}`);
  return data?.data;
};

export const getHourlyDistribution = async (days = 30) => {
  const { data } = await client.get(`/analytics/hourly-distribution?days=${days}`);
  return data?.data;
};

export const getChannelBreakdown = async () => {
  const { data } = await client.get('/analytics/channel-breakdown');
  return data?.data;
};
