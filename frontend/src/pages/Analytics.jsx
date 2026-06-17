import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart3, TrendingUp, TrendingDown, MessageSquare, Bot,
    AlertTriangle, Users, RefreshCw, Activity, Clock, Globe,
    PieChart, Hash, Smile, Frown, Meh, Download
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, PieChart as RPieChart,
    Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import {
    getOverview, getMessagesByDay, getTopIntents, getHandoffRate,
    getSentimentTrend, getHourlyDistribution, getChannelBreakdown
} from '../api/analyticsApi';
import StatCard from '../components/StatCard';
import { cn } from '../utils';

const COLORS = {
    emerald: '#10b981', amber: '#f59e0b', red: '#ef4444',
    blue: '#3b82f6', purple: '#8b5cf6', pink: '#ec4899',
    cyan: '#06b6d4', orange: '#f97316'
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
const SENTIMENT_COLORS = { positive: '#10b981', negative: '#ef4444', neutral: '#f59e0b' };
const PLATFORM_ICONS = { messenger: '💬', facebook: '👍', instagram: '📷', whatsapp: '📱', web: '🌐' };

function formatNumber(n) {
    if (!n && n !== 0) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString();
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-popover border border-border rounded-xl shadow-lg p-3 text-sm">
            <p className="font-bold mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    {p.name}: <span className="font-bold">{p.value}</span>
                </p>
            ))}
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-card rounded-2xl p-6 border border-border h-28" />
                ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-card rounded-xl border border-border p-6 h-80" />
                ))}
            </div>
        </div>
    );
}

export default function Analytics() {
    const [days, setDays] = useState(30);
    const [overview, setOverview] = useState(null);
    const [messagesByDay, setMessagesByDay] = useState([]);
    const [topIntents, setTopIntents] = useState([]);
    const [handoffRate, setHandoffRate] = useState(null);
    const [sentimentTrend, setSentimentTrend] = useState([]);
    const [hourlyDist, setHourlyDist] = useState([]);
    const [channelBreakdown, setChannelBreakdown] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);

    const fetchAnalytics = useCallback(async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        else if (!overview) setLoading(true);
        try {
            const [overviewData, messagesData, intentsData, handoffData, sentimentData, hourlyData, channelData] =
                await Promise.all([
                    getOverview(days), getMessagesByDay(days), getTopIntents(days),
                    getHandoffRate(days), getSentimentTrend(days), getHourlyDistribution(days), getChannelBreakdown()
                ]);
            setOverview(overviewData);
            setMessagesByDay(messagesData || []);
            setTopIntents(intentsData || []);
            setHandoffRate(handoffData);
            setSentimentTrend(sentimentData || []);
            setHourlyDist(hourlyData || []);
            setChannelBreakdown(channelData || []);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [days, overview]);

    useEffect(() => { fetchAnalytics(); }, [days]);

    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => fetchAnalytics(true), 30000);
        return () => clearInterval(interval);
    }, [autoRefresh, days]);

    const handleRefresh = () => fetchAnalytics(true);

    const handleExport = () => {
        const rows = [['المعامل', 'القيمة']];
        if (overview) {
            rows.push(['محادثات اليوم', overview.today?.conversations || 0]);
            rows.push(['رسائل اليوم', overview.today?.messages || 0]);
            rows.push(['معالج بالذكاء', overview.today?.aiHandled || 0]);
            rows.push(['تحويل بشري', overview.today?.handoffs || 0]);
        }
        if (handoffRate) {
            rows.push(['نسبة الذكاء', handoffRate.aiPercentage + '%']);
            rows.push(['نسبة التدخل البشري', handoffRate.humanPercentage + '%']);
        }
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `analytics-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
    };

    if (loading) return <LoadingSkeleton />;

    const todayStats = overview?.today || {};
    const convChange = todayStats.convChange;
    const msgChange = todayStats.msgChange;

    const statsCards = [
        { label: 'محادثات اليوم', value: todayStats.conversations || 0, change: convChange != null ? `${convChange > 0 ? '+' : ''}${convChange}%` : null, isUp: convChange > 0, icon: MessageSquare },
        { label: 'رسائل اليوم', value: todayStats.messages || 0, change: msgChange != null ? `${msgChange > 0 ? '+' : ''}${msgChange}%` : null, isUp: msgChange > 0, icon: Bot },
        { label: 'معالج بالذكاء الاصطناعي', value: todayStats.aiHandled || 0, icon: Activity, isUp: true },
        { label: 'بحاجة تدخل بشري', value: todayStats.handoffs || 0, icon: AlertTriangle, isUp: false },
    ];

    const totalStats = overview?.total || {};
    const totalCards = [
        { label: 'إجمالي المحادثات', value: totalStats.conversations || 0, icon: MessageSquare, isUp: true },
        { label: 'إجمالي الرسائل', value: totalStats.messages || 0, icon: Bot, isUp: true },
        { label: 'المنتجات', value: totalStats.products || 0, icon: Hash, isUp: true },
        { label: 'العملاء النشطون', value: totalStats.activeCustomers || 0, icon: Users, isUp: true },
    ];

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    الإحصائيات
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex bg-muted rounded-lg p-1">
                        {[7, 30, 90].map(d => (
                            <button key={d}
                                onClick={() => setDays(d)}
                                className={cn('px-3 py-1.5 text-sm rounded-md transition-colors',
                                    days === d ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted-foreground/10'
                                )}>
                                {d} يوم
                            </button>
                        ))}
                    </div>
                    <button onClick={handleRefresh} disabled={refreshing}
                        className="p-2 rounded-lg hover:bg-muted transition-colors">
                        <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
                    </button>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                        <input type="checkbox" checked={autoRefresh}
                            onChange={e => setAutoRefresh(e.target.checked)}
                            className="rounded border-border" />
                        تلقائي
                    </label>
                    <button onClick={handleExport}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-muted hover:bg-muted-foreground/10 transition-colors">
                        <Download className="w-4 h-4" /> تصدير
                    </button>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((stat) => (
                    <StatCard key={stat.label} title={stat.label} value={stat.value}
                        change={stat.change} icon={stat.icon} isUp={stat.isUp} />
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="bg-card rounded-xl border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold">الرسائل حسب اليوم</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> روبوت</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> وكيل</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> زبون</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={messagesByDay}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                            <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="bot" stackId="1" stroke={COLORS.blue} fill={COLORS.blue} fillOpacity={0.3} name="روبوت" />
                            <Area type="monotone" dataKey="agent" stackId="1" stroke={COLORS.emerald} fill={COLORS.emerald} fillOpacity={0.3} name="وكيل" />
                            <Area type="monotone" dataKey="user" stackId="1" stroke={COLORS.amber} fill={COLORS.amber} fillOpacity={0.3} name="زبون" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-bold mb-4">اتجاه المشاعر</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={sentimentTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                            <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="positive" stackId="a" fill={SENTIMENT_COLORS.positive} name="إيجابي" />
                            <Bar dataKey="neutral" stackId="a" fill={SENTIMENT_COLORS.neutral} name="محايد" />
                            <Bar dataKey="negative" stackId="a" fill={SENTIMENT_COLORS.negative} name="سلبي" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        التوزيع الساعي
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={hourlyDist}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" interval={2} />
                            <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" fill={COLORS.blue} radius={[4, 4, 0, 0]} name="رسائل" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <PieChart className="w-4 h-4 text-muted-foreground" />
                        توزيع القنوات
                    </h3>
                    <div className="flex items-center justify-center h-[250px]">
                        {channelBreakdown.length > 0 ? (
                            <div className="flex flex-col items-center">
                                <ResponsiveContainer width={180} height={180}>
                                    <RPieChart>
                                        <Pie data={channelBreakdown} dataKey="count" nameKey="channel"
                                            cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                                            {channelBreakdown.map((entry, i) => (
                                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </RPieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-wrap justify-center gap-3 mt-2">
                                    {channelBreakdown.map((entry, i) => (
                                        <span key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                            {PLATFORM_ICONS[entry.channel] || '📱'} {entry.channel}: {entry.count}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">لا توجد بيانات</p>
                        )}
                    </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        أكثر النوايا شيوعاً
                    </h3>
                    <div className="space-y-3">
                        {topIntents.length > 0 ? topIntents.slice(0, 6).map((item, i) => {
                            const maxCount = Math.max(...topIntents.map(t => t.count));
                            const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                            const labels = {
                                greeting: 'تحية', price_inquiry: 'استفسار سعر',
                                delivery_inquiry: 'توصيل', payment_inquiry: 'دفع',
                                size_inquiry: 'مقاسات', color_inquiry: 'ألوان',
                                availability_inquiry: 'توفر', product_inquiry: 'منتجات',
                                complaint: 'شكوى', order_status: 'حالة طلب',
                                return_policy: 'إرجاع', discount_inquiry: 'تخفيضات',
                                working_hours: 'ساعات العمل', store_info: 'معلومات متجر',
                                perfume_inquiry: 'عطور', shoe_inquiry: 'أحذية'
                            };
                            return (
                                <div key={item.intent} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span>{labels[item.intent] || item.intent}</span>
                                        <span className="text-muted-foreground">{item.count}</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div className="h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="text-muted-foreground text-sm text-center py-8">لا توجد نوايا مسجلة</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        أداء الذكاء الاصطناعي
                    </h3>
                    <div className="flex items-center justify-around py-4">
                        <div className="text-center">
                            <div className="relative w-32 h-32 mx-auto">
                                <ResponsiveContainer width={128} height={128}>
                                    <RPieChart>
                                        <Pie data={[
                                            { name: 'ذكاء اصطناعي', value: parseFloat(handoffRate?.aiPercentage || 0) },
                                            { name: 'تدخل بشري', value: parseFloat(handoffRate?.humanPercentage || 0) }
                                        ]} dataKey="value" nameKey="name"
                                            cx="50%" cy="50%" innerRadius={35} outerRadius={60}>
                                            <Cell fill={COLORS.emerald} />
                                            <Cell fill={COLORS.amber} />
                                        </Pie>
                                    </RPieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-emerald-500">{handoffRate?.aiPercentage || 0}%</span>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">معدل نجاح الذكاء</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <div>
                                    <p className="text-sm font-medium">ذكاء اصطناعي</p>
                                    <p className="text-xs text-muted-foreground">{handoffRate?.aiPercentage || 0}%</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-amber-500" />
                                <div>
                                    <p className="text-sm font-medium">تدخل بشري</p>
                                    <p className="text-xs text-muted-foreground">{handoffRate?.humanPercentage || 0}%</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <div>
                                    <p className="text-sm font-medium">إجمالي المحادثات</p>
                                    <p className="text-xs text-muted-foreground">{handoffRate?.total || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        نظرة عامة
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {totalCards.map((stat) => (
                            <div key={stat.label} className="bg-muted/30 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    <stat.icon className="w-4 h-4" />
                                    <span className="text-xs">{stat.label}</span>
                                </div>
                                <p className="text-2xl font-bold">{formatNumber(stat.value)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">معدل الرسائل لكل محادثة</span>
                            <span className="font-bold">
                                {overview?.total?.conversations > 0
                                    ? (overview.total.messages / overview.total.conversations).toFixed(1)
                                    : 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
