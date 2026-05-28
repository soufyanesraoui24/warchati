import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
} from 'date-fns';
import { arDZ } from 'date-fns/locale';

export function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return format(d, 'HH:mm', { locale: arDZ });
}

export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isToday(d)) return 'اليوم';
  if (isYesterday(d)) return 'أمس';
  return format(d, 'dd/MM/yyyy', { locale: arDZ });
}

export function formatRelativeTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return formatDistanceToNow(d, { addSuffix: true, locale: arDZ });
}

export function formatMessageTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const time = format(d, 'HH:mm', { locale: arDZ });
  if (isToday(d)) return time;
  if (isYesterday(d)) return `أمس ${time}`;
  return format(d, 'dd/MM HH:mm', { locale: arDZ });
}
