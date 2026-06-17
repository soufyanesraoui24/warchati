import React, { useState, useEffect } from 'react';
import { Save, Bot, Globe, Clock, MessageCircle, AlertTriangle, ToggleLeft, ToggleRight, Timer, Send } from 'lucide-react';
import { cn } from '../utils';
import { getBotSettings, updateBotSettings } from '../api/botSettingsApi';

const LANGUAGE_STYLES = [
  { value: 'darija', label: 'الدارجة الجزائرية' },
  { value: 'fossha', label: 'الفصحى' },
  { value: 'mixed', label: 'مختلط (دارجة + فصحى)' },
];

export default function BotSettings() {
  const [settings, setSettings] = useState({
    botName: 'وردة',
    autoReplyEnabled: true,
    languageStyle: 'darija',
    requireApprovalBeforeSend: false,
    workingHours: { start: '09:00', end: '18:00', timezone: 'Africa/Algiers' },
    handoffOnNegative: true,
    welcomeMessage: 'السلام عليكم! أنا وردة، المساعدة الذكية للمتجر. كيف نقدر نخدمك؟',
    afterHoursMessage: 'السلام عليكم! وقت العمل الرسمي من 09:00 إلى 18:00. غدوا نردو عليك في أقرب وقت.',
    fallbackMessage: 'عفواً، ما فهمتش الرسالة. تقدر تعيد صياغتها؟',
    replyDelay: 2,
    followUpEnabled: false,
    followUpDelay: 30,
    followUpMessage: 'مرحباً، مازال مهتم بالمنتج؟ العرض لسة متوفر. نحن هنا لمساعدتك!',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBotSettings()
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
      await updateBotSettings(settings);
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

  const Toggle = ({ value, onChange, label, desc, color = 'primary' }) => (
    <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
      <div>
        <h4 className="font-bold text-sm">{label}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <button onClick={() => onChange(!value)}>
        {value ? (
          <ToggleRight className={`w-8 h-8 text-${color}`} />
        ) : (
          <ToggleLeft className="w-8 h-8 text-muted-foreground" />
        )}
      </button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="w-7 h-7 text-primary" />
            إعدادات البوت
          </h2>
          <p className="text-sm text-muted-foreground mt-1">تخصيص إعدادات المساعد الذكي</p>
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

        <Toggle
          value={settings.autoReplyEnabled}
          onChange={(v) => update('autoReplyEnabled', v)}
          label="الرد التلقائي"
          desc="تفعيل الرد التلقائي على رسائل العملاء"
        />

        <Toggle
          value={settings.requireApprovalBeforeSend}
          onChange={(v) => update('requireApprovalBeforeSend', v)}
          label="طلب الموافقة قبل الإرسال"
          desc="الموافقة اليدوية مطلوبة قبل إرسال رد البوت"
          color="amber-500"
        />

        <Toggle
          value={settings.handoffOnNegative}
          onChange={(v) => update('handoffOnNegative', v)}
          label="تحويل تلقائي عند المشاعر السلبية"
          desc="تحويل المحادثة لموظف بشري عند اكتشاف مشاعر سلبية"
        />

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

        <div>
          <label className="block text-sm font-medium mb-1.5">
            <Timer className="w-4 h-4 inline ml-1" />
            تأخير الرد (بالثواني)
          </label>
          <input
            type="range"
            min="0" max="60" step="1"
            value={settings.replyDelay}
            onChange={(e) => update('replyDelay', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{settings.replyDelay} ثانية</span>
            <span>0 - 60 ثانية</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">ساعات العمل</label>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <span className="text-xs text-muted-foreground">بداية</span>
              <input
                type="time"
                value={settings.workingHours?.start || '09:00'}
                onChange={(e) => update('workingHours', { ...settings.workingHours, start: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mt-1"
              />
            </div>
            <span className="text-muted-foreground pt-5">إلى</span>
            <div className="flex-1">
              <span className="text-xs text-muted-foreground">نهاية</span>
              <input
                type="time"
                value={settings.workingHours?.end || '18:00'}
                onChange={(e) => update('workingHours', { ...settings.workingHours, end: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mt-1"
              />
            </div>
          </div>
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

        <div>
          <label className="block text-sm font-medium mb-1.5">
            <MessageCircle className="w-4 h-4 inline ml-1" />
            رسالة عدم الفهم (fallback)
          </label>
          <textarea
            value={settings.fallbackMessage}
            onChange={(e) => update('fallbackMessage', e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-1">تُرسل عندما لا يفهم البوت رسالة الزبون</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          إعدادات المتابعة التلقائية
        </h3>
        <p className="text-sm text-muted-foreground">
          إرسال رسالة متابعة تلقائية للزبون إذا لم يرد بعد مدة
        </p>

        <Toggle
          value={settings.followUpEnabled}
          onChange={(v) => update('followUpEnabled', v)}
          label="تفعيل المتابعة التلقائية"
          desc="إرسال رسالة متابعة بعد مدة من عدم الرد"
        />

        {settings.followUpEnabled && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                <Timer className="w-4 h-4 inline ml-1" />
                مدة الانتظار قبل المتابعة (بالدقائق)
              </label>
              <input
                type="range"
                min="1" max="1440" step="5"
                value={settings.followUpDelay}
                onChange={(e) => update('followUpDelay', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{settings.followUpDelay} دقيقة</span>
                <span>1 دقيقة - 24 ساعة</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">نص رسالة المتابعة</label>
              <textarea
                value={settings.followUpMessage}
                onChange={(e) => update('followUpMessage', e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">تُرسل للزبون إذا لم يرد بعد المدة المحددة</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
