import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, Pencil, Trash2, Save, X, Package, Globe, Loader2, Hash } from 'lucide-react';
import { cn } from '../utils';
import client from '../api/client';
import { getProducts } from '../api/productApi';

export default function QATemplates() {
  const [tab, setTab] = useState('general');
  const [templates, setTemplates] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ questions: [''], text: '', intent: '' });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const url = tab === 'general'
        ? '/templates/general'
        : (selectedProduct ? `/templates/product/${selectedProduct}` : '/templates');
      const { data } = await client.get(url);
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts().then(res => {
      const list = Array.isArray(res) ? res : (res?.data || []);
      setProducts(list);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [tab, selectedProduct]);

  const resetForm = () => {
    setForm({ questions: [''], text: '', intent: '' });
    setEditing(null);
  };

  const handleEdit = (tpl) => {
    setEditing(tpl.id);
    setForm({
      questions: Array.isArray(tpl.questions) && tpl.questions.length > 0 ? tpl.questions : [''],
      text: tpl.text,
      intent: tpl.intent || ''
    });
  };

  const updateQuestion = (idx, value) => {
    setForm(f => {
      const qs = [...f.questions];
      qs[idx] = value;
      return { ...f, questions: qs };
    });
  };

  const addQuestion = () => {
    setForm(f => ({ ...f, questions: [...f.questions, ''] }));
  };

  const removeQuestion = (idx) => {
    setForm(f => ({
      ...f,
      questions: f.questions.filter((_, i) => i !== idx)
    }));
  };

  const handleSave = async () => {
    const validQs = form.questions.filter(q => q.trim());
    if (validQs.length === 0 || !form.text.trim()) return;
    try {
      const payload = {
        questions: validQs,
        text: form.text,
        intent: form.intent,
        productId: tab === 'general' ? null : selectedProduct || null,
      };
      if (editing) {
        await client.put(`/templates/${editing}`, payload);
      } else {
        await client.post('/templates', payload);
      }
      resetForm();
      fetchTemplates();
    } catch (err) {
      console.error('Error saving template:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await client.delete(`/templates/${id}`);
      fetchTemplates();
    } catch (err) {
      console.error('Error deleting template:', err);
    }
  };

  const handleCancel = () => resetForm();

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="w-7 h-7 text-primary" />
            القوالب والردود
          </h2>
          <p className="text-sm text-muted-foreground mt-1">إدارة الأسئلة والأجوبة الذكية للمنتجات والردود العامة</p>
        </div>
      </div>

      <div className="flex gap-2 bg-card border border-border rounded-xl p-1">
        <button
          onClick={() => { setTab('general'); setSelectedProduct(''); }}
          className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all',
            tab === 'general' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Globe className="w-4 h-4" />
          عامة
        </button>
        <button
          onClick={() => setTab('product')}
          className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all',
            tab === 'product' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Package className="w-4 h-4" />
          حسب المنتج
        </button>
      </div>

      {tab === 'product' && (
        <div className="bg-card border border-border rounded-xl p-4">
          <label className="block text-sm font-medium mb-1.5">اختر المنتج</label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
          >
            <option value="">-- اختر منتجاً --</option>
            {products.map((p) => (
              <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm">{editing ? 'تعديل القالب' : 'إضافة قالب جديد'}</h3>
        <div className="grid gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">الأسئلة (سؤال واحد أو أكثر لنفس الجواب)</label>
            <div className="space-y-2">
              {form.questions.map((q, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Hash className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    value={q}
                    onChange={(e) => updateQuestion(idx, e.target.value)}
                    className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm"
                    placeholder={`سؤال ${idx + 1}`}
                  />
                  {form.questions.length > 1 && (
                    <button onClick={() => removeQuestion(idx)} className="p-2 text-muted-foreground hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addQuestion}
                className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                إضافة سؤال آخر
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">الجواب</label>
            <textarea
              value={form.text}
              onChange={(e) => setForm(f => ({ ...f, text: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm resize-none"
              rows={3}
              placeholder="مثال: السعر 350 ألف دج للقميص الواحد"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">التصنيف (اختياري)</label>
            <input
              value={form.intent}
              onChange={(e) => setForm(f => ({ ...f, intent: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
              placeholder="مثال: price_inquiry"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!form.questions.some(q => q.trim()) || !form.text.trim()}
              className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {editing ? 'تحديث' : 'إضافة'}
            </button>
            {editing && (
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-secondary text-secondary-foreground font-bold px-5 py-2.5 rounded-xl hover:opacity-80 text-sm"
              >
                <X className="w-4 h-4" />
                إلغاء
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-bold text-sm text-muted-foreground">
          {tab === 'general' ? 'القوالب العامة' : (!selectedProduct ? 'اختر منتجاً لعرض قوالبه' : `قوالب المنتج`)}
          {loading && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
        </h3>
        {!loading && templates.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">لا توجد قوالب بعد</p>
        )}
        <div className="grid gap-3">
          {templates.map((tpl) => (
            <div key={tpl.id || tpl._id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1.5 min-w-0">
                  {tpl.productId && (
                    <span className="inline-block text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      {tpl.productId?.name || 'منتج'}
                    </span>
                  )}
                  <div className="space-y-0.5">
                    {(Array.isArray(tpl.questions) ? tpl.questions : [tpl.question || '']).map((q, i) => (
                      <p key={i} className="text-sm text-foreground flex items-start gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        {q}
                      </p>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground border-t border-border pt-1.5 mt-1.5">
                    <span className="text-xs text-primary font-medium ml-1">ج:</span>
                    {tpl.text}
                  </p>
                  {tpl.intent && (
                    <span className="inline-block text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                      {tpl.intent}
                    </span>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleEdit(tpl)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(tpl.id || tpl._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
