import client from './client';

export const login = async (email, password) => {
  const { data } = await client.post('/auth/login', { email, password });
  return data;
};

export const register = async (formData) => {
  const { data } = await client.post('/auth/register', formData);
  return data;
};

export const getMe = async () => {
  const { data } = await client.get('/auth/me');
  return data;
};

export const mockLogin = async (userId) => {
  const { data } = await client.post('/auth/mock-login', { userId });
  return data;
};
