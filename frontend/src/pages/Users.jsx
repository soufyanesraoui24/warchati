import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, UserPlus, Trash2, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

const ROLES = ['ADMIN', 'EMPLOYEE', 'MANAGER', 'CLIENT'];

export default function Users() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE' });
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const { data } = await client.get('/users');
            setUsers(Array.isArray(data) ? data : data?.data || []);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await client.post('/auth/register', form);
            setShowForm(false);
            setForm({ name: '', email: '', password: '', role: 'EMPLOYEE' });
            fetchUsers();
        } catch (err) {
            setError(err?.response?.data?.message || 'فشل إنشاء المستخدم');
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await client.put(`/users/${userId}/role`, { role: newRole });
            fetchUsers();
        } catch (err) {
            console.error('Error updating role:', err);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
        try {
            await client.delete(`/users/${userId}`);
            fetchUsers();
        } catch (err) {
            console.error('Error deleting user:', err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UsersIcon className="w-6 h-6 text-primary" />
                        فريق العمل
                    </h1>
                    <p className="text-muted-foreground text-sm">إدارة المستخدمين والصلاحيات</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                >
                    <UserPlus className="w-4 h-4" />
                    إضافة مستخدم
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="bg-card border border-border rounded-2xl p-5 space-y-4">
                    <h3 className="font-bold">مستخدم جديد</h3>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="الاسم" className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="البريد" className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="كلمة السر" className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90">إنشاء</button>
                        <button type="button" onClick={() => setShowForm(false)} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90">إلغاء</button>
                    </div>
                </form>
            )}

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">لا يوجد مستخدمين</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="text-right p-4 font-bold">الاسم</th>
                                    <th className="text-right p-4 font-bold">البريد</th>
                                    <th className="text-right p-4 font-bold">الحالة</th>
                                    <th className="text-right p-4 font-bold">الصلاحية</th>
                                    <th className="text-right p-4 font-bold">تاريخ التسجيل</th>
                                    <th className="text-right p-4 font-bold">خيارات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u._id} className="border-b border-border hover:bg-muted/30">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">{u.name?.charAt(0)}</div>
                                                <span className="font-medium">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-muted-foreground">{u.email}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.authProvider === 'google' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                                                {u.authProvider === 'google' ? 'Google' : 'Local'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={u.role}
                                                onChange={e => handleRoleChange(u._id, e.target.value)}
                                                className="bg-background border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                                disabled={u._id === currentUser?.id}
                                            >
                                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </td>
                                        <td className="p-4 text-muted-foreground text-xs">
                                            {new Date(u.createdAt).toLocaleDateString('ar-DZ')}
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleDelete(u._id)}
                                                disabled={u._id === currentUser?.id}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg disabled:opacity-30"
                                                title="حذف"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
