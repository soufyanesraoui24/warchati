import client from './client';

export const getProducts = async (params) => {
  const { data } = await client.get('/products', { params });
  return data;
};

export const getProductById = async (id) => {
  const { data } = await client.get(`/products/${id}`);
  return data;
};

export const createProduct = async (productData) => {
  const { data } = await client.post('/products', productData);
  return data;
};

export const updateProduct = async (id, productData) => {
  const { data } = await client.put(`/products/${id}`, productData);
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await client.delete(`/products/${id}`);
  return data;
};
