import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, MessageSquare, Bot, AlertTriangle, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { getOverview, getMessagesByDay, getTopIntents, getHandoffRate } from '../api/analyticsApi';
import StatCard from '../components/StatCard';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export default function Analytics() {
    const [overview, setOverview] = useState(null);
    const [messagesByDay, setMessagesByDay] = useState([]);
    const [topIntents, setTopIntents] = useState([]);
    const [handoffRate, setHandoffRate] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [overviewData, messagesData, intentsData, handoffData] = await Promise.all([
                getOverview(),
                getMessagesByDay(),
                getTopIntents(),
                getHandoffRate()
            ]);
            setOverview(overviewData);
            setMessagesByDay(messagesData || []);
            setTopIntents(intentsData || []);
            setHandoffRate(handoffData);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64 text-muted-foreground">جاري تحميل الإحصائيات...</div>;
    }

    const stats = [
        { label: 'المحادثات اليوم', value: overview?.todayConversations || 0, icon: MessageSquare, isUp: true },
        { label: 'الرسائل المعالجة', value: overview?.todayMessages || 0, icon: Bot, isUp: true },
        { label: 'حلول الذكاء الاصطناعي', value: overview?.aiHandled || 0, icon: Bot, isUp: true },
        { label: 'تحتاج موظف', value: overview?.needsHuman || 0, icon: AlertTriangle, isUp: false },
    ];

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    الإحصائيات
                </h1>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <StatCard key={stat.label} title={stat.label} value={stat.value} icon={stat.icon} isUp={stat.isUp} />
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-bold mb-4">الرسائل حسب اليوم</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={messagesByDay}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-bold mb-4">توزيع النوايا</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={topIntents} dataKey="count" nameKey="intent" cx="50%" cy="50%" outerRadius={100} label>
                                {topIntents.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-bold mb-4">معدل التحويل البشري</h3>
                <div className="flex items-center gap-8">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-emerald-500">{handoffRate?.aiPercentage || 0}%</p>
                        <p className="text-sm text-muted-foreground">الذكاء الاصطناعي</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-amber-500">{handoffRate?.humanPercentage || 0}%</p>
                        <p className="text-sm text-muted-foreground">تدخل بشري</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
