import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ProductForm({ product, onSave, onCancel }) {
    const isEdit = !!product;

    const [formData, setFormData] = useState({
        productName: '',
        description: '',
        image: '',
        images: [], // for gallery
        sellingPrice: '',
        compareAtPrice: '',
        costPrice: '',
        sku: '',
        barcode: '',
        trackQuantity: true,
        stock: 100,
        category: 'General',
        isPublic: true,
        status: 'active',
        hasVariants: false,
        tags: '',
        weight: 0,
        isPhysical: true,
        options: [],
        properties: [],
        ...product
    });

    useEffect(() => {
        if (product) {
            setFormData(prev => ({ ...prev, ...product, status: product.isPublic ? 'active' : 'draft' }));
        }
    }, [product]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            isPublic: formData.status === 'active'
        });
    };

    // --- Image Handlers ---
    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Import dynamically or pass from props if unable to add top-level import easily here. 
        // Better to rely on helper function. But for now assuming direct logic.
        // We need to access supabase client.
        // Let's assume we can import it. If not, this needs refactor.
        // Added: import { supabase } from '../../lib/supabase'; at top of file

        for (const file of files) {
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                // Upload
                const { data, error } = await supabase.storage
                    .from('product-media')
                    .upload(filePath, file);

                if (error) {
                    console.error('Upload Error', error);
                    alert('فشل رفع الصورة');
                    continue;
                }

                // Get URL
                const { data: { publicUrl } } = supabase.storage
                    .from('product-media')
                    .getPublicUrl(filePath);

                setFormData(prev => {
                    // If no main image, set first upload as main
                    const isFirst = !prev.image && !prev.images?.length;
                    if (!prev.image) {
                        return { ...prev, image: publicUrl, images: [publicUrl, ...(prev.images || [])] };
                    }
                    return { ...prev, images: [...(prev.images || []), publicUrl] };
                });

            } catch (error) {
                console.error('Upload failed', error);
            }
        }
    };

    const removeImage = (index) => {
        setFormData(prev => {
            const newImages = prev.images.filter((_, i) => i !== index);
            if (prev.image === prev.images[index]) {
                const nextImage = newImages[0] || '';
                return { ...prev, images: newImages, image: nextImage };
            }
            return { ...prev, images: newImages };
        });
    };

    const setMainImage = (imgUrl) => {
        setFormData(prev => ({ ...prev, image: imgUrl }));
    };

    // --- Variants Handlers ---
    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...(prev.options || []), { id: Date.now(), name: '', values: '' }]
        }));
    };

    const removeOption = (id) => {
        setFormData(prev => ({
            ...prev,
            options: (prev.options || []).filter(opt => opt.id !== id)
        }));
    };

    const handleOptionChange = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            options: (prev.options || []).map(opt =>
                opt.id === id ? { ...opt, [field]: value } : opt
            )
        }));
    };

    // --- Properties (Specifications) Handlers ---
    const addProperty = () => {
        setFormData(prev => ({
            ...prev,
            properties: [...(prev.properties || []), { id: Date.now(), name: '', value: '' }]
        }));
    };

    const removeProperty = (id) => {
        setFormData(prev => ({
            ...prev,
            properties: (prev.properties || []).filter(p => p.id !== id)
        }));
    };

    const handlePropertyChange = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            properties: (prev.properties || []).map(p =>
                p.id === id ? { ...p, [field]: value } : p
            )
        }));
    };

    return (
        <div className="fixed inset-0 bg-gray-100 z-50 overflow-y-auto w-full h-full animate-in slide-in-from-bottom-5 duration-300">
            {/* Top Bar */}
            <div className="sticky top-0 bg-white border-b border-gray-200 z-10 px-4 py-3 shadow-sm">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-bold text-gray-900">
                            {isEdit ? `تعديل ${formData.productName}` : 'إضافة منتج جديد'}
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-lg">
                            إلغاء
                        </button>
                        <button onClick={handleSubmit} className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            حفظ المنتج
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (Main Info) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* General */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج</label>
                                <input
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="مثال: قميص قطني صيفي"
                                    value={formData.productName}
                                    onChange={e => setFormData({ ...formData, productName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                                <textarea
                                    rows={6}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="وصف تفصيلي للمنتج..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Media */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900">الوسائط (Media)</h3>
                            <span className="text-xs text-gray-500">
                                {formData.images?.length || 0} صور
                            </span>
                        </div>

                        <div className="space-y-4">
                            {/* Upload Area */}
                            <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer block">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                                <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-medium text-gray-900">اضغط لرفع الصور</p>
                                <p className="text-xs text-gray-500 mt-1">أو قم بسحب وإفلات الملفات هنا</p>
                            </label>

                            {/* Gallery Grid */}
                            {formData.images && formData.images.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                                    {formData.images.map((img, index) => (
                                        <div key={index} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                            <img src={img} alt={`Product ${index}`} className="w-full h-full object-cover" />

                                            {/* Actions Overlay */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="p-1.5 bg-white text-red-600 rounded-full hover:bg-red-50"
                                                    title="حذف الصورة"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                {formData.image !== img && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setMainImage(img)}
                                                        className="px-2 py-1 bg-white text-xs font-bold rounded-full hover:bg-gray-50 opacity-90 hover:opacity-100"
                                                    >
                                                        رئيسية
                                                    </button>
                                                )}
                                            </div>

                                            {/* Main Image Indicator */}
                                            {formData.image === img && (
                                                <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm z-10">
                                                    الرئيسية
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-none">
                        <h3 className="font-bold text-gray-900 mb-4">التسعير</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">السعر (Price)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full p-2 pl-12 border border-gray-300 rounded-lg"
                                        placeholder="0.00"
                                        value={formData.sellingPrice}
                                        onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })}
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">DZD</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">سعر المقارنة (Compare-at)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full p-2 pl-12 border border-gray-300 rounded-lg"
                                        placeholder="0.00"
                                        value={formData.compareAtPrice || ''}
                                        onChange={e => setFormData({ ...formData, compareAtPrice: e.target.value })}
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">DZD</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">سعر التكلفة (Cost per item)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full p-2 pl-12 border border-gray-300 rounded-lg"
                                        placeholder="0.00"
                                        value={formData.costPrice || ''}
                                        onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">DZD</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">لن يراه العملاء</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الربح (Margin)</label>
                                <div className="text-sm font-bold text-green-600 mt-2">
                                    {formData.sellingPrice && formData.costPrice ? `${((formData.sellingPrice - formData.costPrice) / formData.sellingPrice * 100).toFixed(0)}%` : '-'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inventory */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="font-bold text-gray-900 mb-4">المخزون (Inventory)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SKU (Stock Keeping Unit)</label>
                                <input
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    value={formData.sku || ''}
                                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Barcode (ISBN, UPC, GTIN)</label>
                                <input
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    value={formData.barcode || ''}
                                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="trackQty"
                                className="w-4 h-4 rounded text-blue-600"
                                checked={formData.trackQuantity}
                                onChange={e => setFormData({ ...formData, trackQuantity: e.target.checked })}
                            />
                            <label htmlFor="trackQty" className="text-sm text-gray-700">تتبع الكمية</label>
                        </div>
                        {formData.trackQuantity && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-1">الكمية المتوفرة</label>
                                <input
                                    type="number"
                                    className="w-32 p-2 border border-gray-300 rounded-lg"
                                    value={formData.stock}
                                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                />
                            </div>
                        )}
                    </div>

                    {/* Variants / Options */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900">الخيارات (Variants)</h3>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="hasVariants"
                                    className="w-4 h-4 rounded text-blue-600"
                                    checked={formData.hasVariants || false}
                                    onChange={e => setFormData({ ...formData, hasVariants: e.target.checked })}
                                />
                                <label htmlFor="hasVariants" className="text-sm text-gray-700">هذا المنتج له خيارات متعددة (مثل المقاس أو اللون)</label>
                            </div>
                        </div>

                        {formData.hasVariants && (
                            <div className="space-y-4 border-t border-gray-100 pt-4">
                                {formData.options && formData.options.map((opt) => (
                                    <div key={opt.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative mb-4">
                                        <button
                                            onClick={() => removeOption(opt.id)}
                                            className="absolute top-2 left-2 p-1 text-red-500 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">اسم الخيار (Option Name)</label>
                                                <input
                                                    className="w-full p-2 border rounded bg-white text-sm"
                                                    placeholder="مثال: Size, Color"
                                                    value={opt.name}
                                                    onChange={(e) => handleOptionChange(opt.id, 'name', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">القيم (Values)</label>
                                                <input
                                                    className="w-full p-2 border rounded bg-white text-sm"
                                                    placeholder="S, M, L (افصل بفاصلة)"
                                                    value={opt.values}
                                                    onChange={(e) => handleOptionChange(opt.id, 'values', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={addOption}
                                    className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" /> إضافة خيار آخر
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Properties / Specifications */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="font-bold text-gray-900 mb-4">خصائص المنتج (Properties)</h3>
                        <div className="space-y-3">
                            {formData.properties && formData.properties.map((prop) => (
                                <div key={prop.id} className="flex gap-2 items-center">
                                    <input
                                        className="flex-1 p-2 border rounded-lg text-sm"
                                        placeholder="الخاصية (مثال: نوع القماش)"
                                        value={prop.name}
                                        onChange={(e) => handlePropertyChange(prop.id, 'name', e.target.value)}
                                    />
                                    <input
                                        className="flex-1 p-2 border rounded-lg text-sm"
                                        placeholder="القيمة (مثال: 100% قطن)"
                                        value={prop.value}
                                        onChange={(e) => handlePropertyChange(prop.id, 'value', e.target.value)}
                                    />
                                    <button
                                        onClick={() => removeProperty(prop.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addProperty}
                            className="mt-4 text-sm text-blue-600 font-bold hover:underline flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" /> إضافة خاصية جديدة
                        </button>
                    </div>

                    {/* Shipping */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="font-bold text-gray-900 mb-4">الشحن (Shipping)</h3>
                        <div className="flex items-center gap-2 mb-4">
                            <input
                                type="checkbox"
                                id="isPhysical"
                                className="w-4 h-4 rounded text-blue-600"
                                checked={formData.isPhysical !== false}
                                onChange={e => setFormData({ ...formData, isPhysical: e.target.checked })}
                            />
                            <label htmlFor="isPhysical" className="text-sm text-gray-700">هذا منتج فعلي (Physical Product)</label>
                        </div>
                        {formData.isPhysical !== false && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الوزن (Weight)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="w-full p-2 border border-gray-300 rounded-lg text-left dir-ltr"
                                            placeholder="0.0"
                                            value={formData.weight || ''}
                                            onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                        />
                                        <div className="absolute left-1 top-1 bottom-1 flex items-center bg-gray-50 px-2 rounded border border-gray-200 text-xs font-bold text-gray-500">
                                            kg
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SEO Listing Preview */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-gray-900">محركات البحث (SEO)</h3>
                                <p className="text-sm text-gray-500">معاينة ظهور المنتج في نتائج البحث</p>
                            </div>
                            <button className="text-blue-600 text-sm font-bold hover:underline">تعديل SEO</button>
                        </div>
                        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                            <div className="text-sm text-blue-600 font-medium hover:underline cursor-pointer truncate">
                                {formData.productName || 'اسم المنتج'}
                            </div>
                            <div className="text-xs text-green-700 mt-0.5 truncate font-mono">
                                https://yoursite.com/products/{formData.productName?.toLowerCase().replace(/\s+/g, '-') || 'product-handle'}
                            </div>
                            <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {formData.description || 'وصف المنتج كما سيظهر في محركات البحث...'}
                            </div>
                        </div>
                    </div>
                </div>
                {/* End Left Column */}

                {/* Right Column (Sidebar) */}
                <div className="space-y-6">
                    {/* Status */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="font-bold text-gray-900 mb-4">حالة المنتج</h3>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="active">نشط (Active)</option>
                            <option value="draft">مسودة (Draft)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-2">
                            المنتج {formData.status === 'active' ? 'ظاهر' : 'مخفي'} في متجرك.
                        </p>
                    </div>

                    {/* Organization */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="font-bold text-gray-900 mb-4">التنظيم</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">القسم (Category)</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="General">عام</option>
                                    <option value="Men">رجال</option>
                                    <option value="Women">نساء</option>
                                    <option value="Kids">أطفال</option>
                                    <option value="Accessories">اكسسوارات</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">نوع المنتج (Type)</label>
                                <input
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="مثال: T-Shirt"
                                    value={formData.productType || ''}
                                    onChange={e => setFormData({ ...formData, productType: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">المورد (Vendor)</label>
                                <input
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="مثال: Nike"
                                    value={formData.vendor || ''}
                                    onChange={e => setFormData({ ...formData, vendor: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (الوسوم)</label>
                                <input
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="Cotton, Summer, Sale"
                                    value={formData.tags || ''}
                                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">افصل بين الوسوم بفاصلة</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
