import { useState, useCallback, useEffect } from 'react';
import {
  getProducts,
  createProduct as apiCreate,
  updateProduct as apiUpdate,
  deleteProduct as apiDelete,
} from '../api/productApi';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts(params);
      setProducts(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (productData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiCreate(productData);
      await fetchProducts();
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'فشل إضافة المنتج');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  const updateProduct = useCallback(async (id, productData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiUpdate(id, productData);
      await fetchProducts();
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تحديث المنتج');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiDelete(id);
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل حذف المنتج');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, fetchProducts, createProduct, updateProduct, deleteProduct, loading, error };
}
