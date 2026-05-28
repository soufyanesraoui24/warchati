import React, { useState, useEffect } from 'react';
import { Save, Bot, Globe, Clock, MessageCircle, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from '../utils';
import { getBotStatus } from '../api/aiApi';
import client from '../api/client';

const LANGUAGE_STYLES = [
  { value: 'darija', label: 'الدارجة الجزائرية' },
  { value: 'fossha', label: 'الفصحى' },
  { value: 'mixed', label: 'مختلط (دارجة + فصحى)' },
];

export default function BotSettings() {
  const [settings, setSettings] = useState({
    botName: 'وردة',
    autoReply: true,
    languageStyle: 'darija',
    requireApproval: false,
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
    handoffOnNegative: true,
    welcomeMessage: 'السلام عليكم! 🌸 أنا وردة، المساعد الذكي. كيف أقدر نعاونكم؟',
    afterHoursMessage: 'نعتذروا منكم، وقت العمل من 9 صباحاً إلى 6 مساءً. سنعود لكم في أقرب وقت.',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBotStatus()
      .then((data) => {
        if (data) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await client.put('/ai/bot-settings', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" dir="rtl">
        <div className="text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="w-7 h-7 text-primary" />
            إعدادات البوت
          </h2>
          <p className="text-sm text-muted-foreground mt-1">تخصيص إعدادات المساعد الذكي وردة</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            'flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl transition-all text-sm',
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-primary text-primary-foreground hover:opacity-90'
          )}
        >
          <Save className="w-4 h-4" />
          {saving ? 'جاري الحفظ...' : saved ? 'تم الحفظ ✓' : 'حفظ الإعدادات'}
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">اسم البوت</label>
          <input
            value={settings.botName}
            onChange={(e) => update('botName', e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="اسم البوت"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
          <div>
            <h4 className="font-bold text-sm">الرد التلقائي</h4>
            <p className="text-xs text-muted-foreground mt-0.5">تفعيل الرد التلقائي على رسائل العملاء</p>
          </div>
          <button onClick={() => update('autoReply', !settings.autoReply)}>
            {settings.autoReply ? (
              <ToggleRight className="w-8 h-8 text-primary" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-muted-foreground" />
            )}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">لغة الردود</label>
          <div className="flex gap-2">
            {LANGUAGE_STYLES.map((style) => (
              <button
                key={style.value}
                onClick={() => update('languageStyle', style.value)}
                className={cn(
                  'flex-1 p-3 rounded-xl border text-sm font-medium transition-all',
                  settings.languageStyle === style.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                )}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
          <div>
            <h4 className="font-bold text-sm">طلب الموافقة قبل الإرسال</h4>
            <p className="text-xs text-muted-foreground mt-0.5">الموافقة اليدوية مطلوبة قبل إرسال رد البوت</p>
          </div>
          <button onClick={() => update('requireApproval', !settings.requireApproval)}>
            {settings.requireApproval ? (
              <ToggleRight className="w-8 h-8 text-amber-500" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-muted-foreground" />
            )}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">ساعات العمل</label>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <span className="text-xs text-muted-foreground">بداية</span>
              <input
                type="time"
                value={settings.workingHoursStart}
                onChange={(e) => update('workingHoursStart', e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mt-1"
              />
            </div>
            <span className="text-muted-foreground pt-5">إلى</span>
            <div className="flex-1">
              <span className="text-xs text-muted-foreground">نهاية</span>
              <input
                type="time"
                value={settings.workingHoursEnd}
                onChange={(e) => update('workingHoursEnd', e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mt-1"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
          <div>
            <h4 className="font-bold text-sm">تحويل تلقائي عند المشاعر السلبية</h4>
            <p className="text-xs text-muted-foreground mt-0.5">تحويل المحادثة لموظف بشري عند اكتشاف مشاعر سلبية</p>
          </div>
          <button onClick={() => update('handoffOnNegative', !settings.handoffOnNegative)}>
            {settings.handoffOnNegative ? (
              <ToggleRight className="w-8 h-8 text-primary" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-muted-foreground" />
            )}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">رسالة الترحيب</label>
          <textarea
            value={settings.welcomeMessage}
            onChange={(e) => update('welcomeMessage', e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">رسالة خارج أوقات العمل</label>
          <textarea
            value={settings.afterHoursMessage}
            onChange={(e) => update('afterHoursMessage', e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
