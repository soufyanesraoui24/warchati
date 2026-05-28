import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../utils';

export default function StatCard({ title, value, change, isUp, icon: Icon }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-sm border border-border hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start">
        <div className={cn('rounded-xl p-3', isUp ? 'bg-emerald-500/10' : 'bg-red-500/10')}>
          <Icon className={cn('h-6 w-6', isUp ? 'text-emerald-500' : 'text-red-500')} />
        </div>
        {change != null && (
          <span className={cn('flex items-center text-sm font-bold', isUp ? 'text-emerald-500' : 'text-red-500')}>
            {isUp ? <ArrowUpRight className="w-4 h-4 ml-1" /> : <ArrowDownRight className="w-4 h-4 ml-1" />}
            {change}
          </span>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-3xl font-bold text-foreground">{value}</h3>
        <p className="text-sm font-medium text-muted-foreground mt-1">{title}</p>
      </div>
    </div>
  );
}
