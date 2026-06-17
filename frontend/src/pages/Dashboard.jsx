import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Bot, AlertTriangle, ArrowUpRight, ArrowDownRight,
  BarChart3, Target, TrendingUp, Package, Users
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { cn } from '../utils';
import { getOverview, getMessagesByDay, getTopIntents, getHandoffRate } from '../api/analyticsApi';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [messagesByDay, setMessagesByDay] = useState([]);
  const [topIntents, setTopIntents] = useState([]);
  const [handoffRate, setHandoffRate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getOverview().catch(() => null),
      getMessagesByDay().catch(() => []),
      getTopIntents().catch(() => []),
      getHandoffRate().catch(() => null),
    ]).then(([ov, msgs, intents, handoff]) => {
      setOverview(ov);
      setMessagesByDay(Array.isArray(msgs) ? msgs : []);
      setTopIntents(Array.isArray(intents) ? intents : []);
      setHandoffRate(handoff);
      setLoading(false);
    });
  }, []);

  const stats = overview ? [
    { title: 'المحادثات اليوم', value: overview.today?.conversations ?? 0, change: '', isUp: true, icon: MessageSquare },
    { title: 'الرسائل اليوم', value: overview.today?.messages ?? 0, change: '', isUp: true, icon: BarChart3 },
    { title: 'تم بواسطة AI', value: overview.today?.aiHandled ?? 0, change: '', isUp: true, icon: Bot },
    { title: 'تحتاج تدخل بشري', value: overview.total?.pendingHandoffs ?? 0, change: '', isUp: false, icon: AlertTriangle },
    { title: 'المنتجات', value: overview.total?.products ?? 0, change: '', isUp: true, icon: Package },
    { title: 'الزبائن النشطون', value: overview.total?.activeCustomers ?? 0, change: '', isUp: true, icon: Users },
  ] : [];

  const resolutionData = handoffRate ? [
    { name: 'الذكاء الاصطناعي', value: handoffRate.aiPercent ?? 85, color: '#10b981' },
    { name: 'تدخل بشري', value: handoffRate.humanPercent ?? 15, color: '#f59e0b' },
  ] : [
    { name: 'الذكاء الاصطناعي', value: 85, color: '#10b981' },
    { name: 'تدخل بشري', value: 15, color: '#f59e0b' },
  ];

  const chartData = messagesByDay.length > 0 ? messagesByDay : [
    { day: 'السبت', messages: 120, ai: 95 },
    { day: 'الأحد', messages: 98, ai: 78 },
    { day: 'الإثنين', messages: 145, ai: 120 },
    { day: 'الثلاثاء', messages: 132, ai: 105 },
    { day: 'الأربعاء', messages: 110, ai: 88 },
    { day: 'الخميس', messages: 158, ai: 134 },
    { day: 'الجمعة', messages: 89, ai: 72 },
  ];

  const intentsList = topIntents.length > 0 ? topIntents : [
    { name: 'استفسار عن منتج', count: 145, percentage: 35 },
    { name: 'سعر وميزانية', count: 98, percentage: 24 },
    { name: 'شكوى', count: 54, percentage: 13 },
    { name: 'طلب شراء', count: 120, percentage: 29 },
    { name: 'متابعة طلب', count: 42, percentage: 10 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" dir="rtl">
        <div className="text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">لوحة التحكم</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">نظرة عامة على أداء المساعد الذكي والمحادثات</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            الرسائل يومياً
          </h3>
          <div className="h-[300px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#888' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="messages" name="الرسائل" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorMessages)" />
                <Area type="monotone" dataKey="ai" name="معالجة بالذكاء الاصطناعي" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAi)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            معدل الاستقلالية
          </h3>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resolutionData}
                  cx="50%" cy="50%"
                  innerRadius={70} outerRadius={90}
                  paddingAngle={5} dataKey="value"
                  stroke="none"
                >
                  {resolutionData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-emerald-500">{resolutionData[0].value}%</span>
              <span className="text-xs text-muted-foreground mt-1">AI</span>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            {resolutionData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 font-medium">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          أهم النوايا
        </h3>
        <div className="space-y-3">
          {intentsList.map((intent, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <span className="w-6 text-sm font-bold text-muted-foreground">{idx + 1}</span>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{intent.name}</span>
                  <span className="text-xs text-muted-foreground">{intent.count} رسالة</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(intent.percentage ?? (intent.count / intentsList.reduce((a, b) => a + b.count, 0)) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-bold text-primary w-12 text-left">
                {intent.percentage ? `${intent.percentage}%` : `${Math.round(intent.count / intentsList.reduce((a, b) => a + b.count, 0) * 100)}%`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
