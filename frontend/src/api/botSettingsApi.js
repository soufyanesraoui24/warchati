import client from './client';

export const getBotSettings = async () => {
  const { data } = await client.get('/bot-settings');
  return data?.data;
};

export const updateBotSettings = async (settings) => {
  const { data } = await client.put('/bot-settings', settings);
  return data?.data;
};
