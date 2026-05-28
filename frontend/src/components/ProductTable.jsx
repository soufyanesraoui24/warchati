import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, Edit, Trash2, Eye, EyeOff, CheckSquare, Square } from 'lucide-react';

export default function ProductTable({ products, onEdit, onDelete, onToggleStatus }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, active, draft
    const [selectedIds, setSelectedIds] = useState([]);

    // Filter Logic
    const filteredProducts = products.filter(p => {
        const matchesSearch = (p.productName || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all'
            ? true
            : (statusFilter === 'active' ? p.isPublic : !p.isPublic);
        return matchesSearch && matchesStatus;
    });

    // Selection Logic
    const toggleSelectAll = () => {
        if (selectedIds.length === filteredProducts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredProducts.map(p => p.id));
        }
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Filters Bar */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        الكل
                    </button>
                    <button
                        onClick={() => setStatusFilter('active')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === 'active' ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        نشط
                    </button>
                    <button
                        onClick={() => setStatusFilter('draft')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === 'draft' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        مسودة
                    </button>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="بحث عن منتج..."
                        className="w-full pl-4 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4 w-12 text-center">
                                <button onClick={toggleSelectAll} className="flex items-center justify-center">
                                    {selectedIds.length > 0 && selectedIds.length === filteredProducts.length ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                                </button>
                            </th>
                            <th className="px-6 py-4">المنتج</th>
                            <th className="px-6 py-4">الحالة</th>
                            <th className="px-6 py-4">المخزون</th>
                            <th className="px-6 py-4">القسم</th>
                            <th className="px-6 py-4">السعر</th>
                            <th className="px-6 py-4">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map(product => (
                            <tr key={product.id} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => toggleSelect(product.id)} className="flex items-center justify-center">
                                        {selectedIds.includes(product.id) ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4 text-gray-300" />}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                                            {product.image ? (
                                                <img src={product.image} alt={product.productName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <ImageIcon className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{product.productName}</p>
                                            <p className="text-xs text-gray-500">{product.sku || 'SKU: ---'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => onToggleStatus(product.id, !product.isPublic)}
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${product.isPublic
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                                    >
                                        {product.isPublic ? 'نشط' : 'مسودة'}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm">
                                        {/* Simulating stock if not available in basic product model */}
                                        <span className={product.stock <= 10 ? 'text-orange-600 font-medium' : 'text-gray-600'}>
                                            {product.stock || 100} في المخزون
                                        </span>
                                        <div className="text-xs text-gray-400">لـ {product.variants?.length || 1} أنواع</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {product.category || 'General'}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium">{Number(product.sellingPrice).toLocaleString()} د.ج</div>
                                    {product.compareAtPrice && (
                                        <div className="text-xs text-gray-400 line-through">{Number(product.compareAtPrice).toLocaleString()} د.ج</div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onEdit(product)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => onDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredProducts.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    لا توجد منتجات تطابق بحثك
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer / Pagination */}
            <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                <div>عرض {filteredProducts.length} من {products.length} منتج</div>
                <div className="flex gap-2">
                    <button disabled className="px-3 py-1 border rounded disabled:opacity-50">السابق</button>
                    <button disabled className="px-3 py-1 border rounded disabled:opacity-50">التالي</button>
                </div>
            </div>
        </div>
    );
}

function ImageIcon({ className }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
}
