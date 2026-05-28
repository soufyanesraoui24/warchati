import React, { useState } from 'react';
import { Plus, Search, Edit3, Trash2, Package, X, Save, Image as ImageIcon } from 'lucide-react';
import { cn } from '../utils';
import { useProducts } from '../hooks/useProducts';

const CATEGORIES = [
  'إلكترونيات', 'ملابس', 'أحذية', 'إكسسوارات',
  'عطور', 'منزل', 'مطبخ', 'أخرى',
];

const STOCK_STATUSES = [
  { value: 'in_stock', label: 'متوفر', color: 'text-emerald-500 bg-emerald-500/10' },
  { value: 'low_stock', label: 'كمية محدودة', color: 'text-amber-500 bg-amber-500/10' },
  { value: 'out_of_stock', label: 'غير متوفر', color: 'text-red-500 bg-red-500/10' },
];

export default function Products() {
  const { products, createProduct, updateProduct, deleteProduct, loading } = useProducts();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', sizes: '', colors: '',
    stockStatus: 'in_stock', category: 'أخرى', images: [],
  });

  const openAddForm = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', sizes: '', colors: '', stockStatus: 'in_stock', category: 'أخرى', images: [] });
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || product.sellingPrice || '',
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes || '',
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : product.colors || '',
      stockStatus: product.stockStatus || 'in_stock',
      category: product.category || 'أخرى',
      images: product.images || [],
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
      colors: formData.colors.split(',').map(c => c.trim()).filter(Boolean),
      price: Number(formData.price),
    };
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id || editingProduct._id, payload);
      } else {
        await createProduct(payload);
      }
      setShowForm(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleDelete = async (product) => {
    try {
      await deleteProduct(product.id || product._id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return !q || (p.name || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
  });

  const getStockBadge = (status) => {
    const s = STOCK_STATUSES.find(st => st.value === status) || STOCK_STATUSES[0];
    return <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', s.color)}>{s.label}</span>;
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">المنتجات</h2>
          <p className="text-sm text-muted-foreground mt-1">إدارة المنتجات والمخزون</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
        >
          <Plus className="w-4 h-4" />
          إضافة منتج
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث في المنتجات..."
          className="w-full bg-card border border-border rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="text-right p-4 font-bold text-muted-foreground">المنتج</th>
                <th className="text-right p-4 font-bold text-muted-foreground">السعر</th>
                <th className="text-right p-4 font-bold text-muted-foreground">الحالة</th>
                <th className="text-right p-4 font-bold text-muted-foreground">القسم</th>
                <th className="text-left p-4 font-bold text-muted-foreground">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">جاري التحميل...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">لا توجد منتجات</td></tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id || product._id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                          {product.image || product.images?.[0] ? (
                            <img src={product.image || product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold">{product.price ?? product.sellingPrice ?? 0} دج</td>
                    <td className="p-4">{getStockBadge(product.stockStatus)}</td>
                    <td className="p-4 text-muted-foreground">{product.category}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 justify-start">
                        <button
                          onClick={() => openEditForm(product)}
                          className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
              <h3 className="font-bold text-lg">{editingProduct ? 'تعديل المنتج' : 'إضافة منتج'}</h3>
              <button onClick={() => { setShowForm(false); setEditingProduct(null); }} className="p-1 hover:bg-secondary rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم المنتج</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="اسم المنتج"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  rows={3}
                  placeholder="وصف المنتج"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">السعر (دج)</label>
                <input
                  required
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">صور المنتج (روابط)</label>
                <div className="flex gap-2">
                  <input
                    value={Array.isArray(formData.images) ? formData.images.join(', ') : formData.images || ''}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="flex-1 bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ltr text-left"
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    dir="ltr"
                  />
                </div>
                {Array.isArray(formData.images) && formData.images.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {formData.images.map((url, i) => (
                      <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-border group">
                        <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, images: formData.images.filter((_, idx) => idx !== i) })}
                          className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">المقاسات</label>
                  <input
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="S, M, L, XL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الألوان</label>
                  <input
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="أحمر، أزرق، أسود"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">حالة المخزون</label>
                  <select
                    value={formData.stockStatus}
                    onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {STOCK_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">القسم</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                >
                  <Save className="w-4 h-4" />
                  {editingProduct ? 'تحديث' : 'حفظ'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingProduct(null); }}
                  className="flex-1 bg-secondary text-secondary-foreground font-bold py-2.5 rounded-xl hover:opacity-80 transition-opacity"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-border p-6 text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold mb-2">حذف المنتج</h3>
            <p className="text-sm text-muted-foreground mb-6">هل أنت متأكد من حذف "{deleteConfirm.name}"؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-xl hover:bg-red-600 transition-colors"
              >
                حذف
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-secondary text-secondary-foreground font-bold py-2.5 rounded-xl hover:opacity-80 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
