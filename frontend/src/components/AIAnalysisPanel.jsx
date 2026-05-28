import React from 'react';
import { Brain, Tag, AlertTriangle, BarChart3 } from 'lucide-react';
import { cn } from '../utils';

const SENTIMENT_COLORS = {
  positive: 'text-emerald-500 bg-emerald-500/10',
  negative: 'text-red-500 bg-red-500/10',
  neutral: 'text-gray-500 bg-gray-500/10',
};

export default function AIAnalysisPanel({ analysis }) {
  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
        <Brain className="w-10 h-10 mb-3 opacity-30" />
        <p className="text-sm font-medium">اختر رسالة لتحليلها</p>
        <p className="text-xs mt-1 opacity-60">سيظهر هنا تحليل الذكاء الاصطناعي</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="font-bold">تحليل الذكاء الاصطناعي</h3>
      </div>

      {analysis.intent && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Tag className="w-4 h-4" />
            <span className="font-medium">النية</span>
          </div>
          <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
            {analysis.intent}
          </span>
        </div>
      )}

      {analysis.sentiment && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Brain className="w-4 h-4" />
            <span className="font-medium">المشاعر</span>
          </div>
          <span className={cn(
            'inline-block px-3 py-1 rounded-full text-sm font-bold',
            SENTIMENT_COLORS[analysis.sentiment?.toLowerCase()] || 'text-gray-500 bg-gray-500/10'
          )}>
            {analysis.sentiment === 'positive' ? 'إيجابية' :
             analysis.sentiment === 'negative' ? 'سلبية' : 'محايدة'}
          </span>
        </div>
      )}

      {analysis.keywords?.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Tag className="w-4 h-4" />
            <span className="font-medium">الكلمات المفتاحية</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {analysis.keywords.map((kw, i) => (
              <span key={i} className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md text-xs font-medium">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {analysis.priority && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">الأولوية</span>
          </div>
          <span className={cn(
            'inline-block px-3 py-1 rounded-full text-sm font-bold',
            analysis.priority === 'high' ? 'bg-red-500/10 text-red-500' :
            analysis.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' :
            'bg-green-500/10 text-green-500'
          )}>
            {analysis.priority === 'high' ? 'عالية' :
             analysis.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
          </span>
        </div>
      )}

      {analysis.needsHumanHandoff && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-bold text-amber-600">يحتاج تدخل بشري</span>
        </div>
      )}

      {analysis.confidence != null && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <BarChart3 className="w-4 h-4" />
            <span className="font-medium">نسبة الثقة</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2.5">
            <div
              className={cn(
                'h-2.5 rounded-full transition-all',
                analysis.confidence > 70 ? 'bg-emerald-500' :
                analysis.confidence > 40 ? 'bg-amber-500' : 'bg-red-500'
              )}
              style={{ width: `${analysis.confidence}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground mt-1 block text-left">{analysis.confidence}%</span>
        </div>
      )}
    </div>
  );
}
