import type { CompetitionState } from '../api/types';

/** ₹1,500 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

/** 10 Aug 26 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
}

/** 10 Aug 26, 11:50 PM */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const day = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
  const time = date
    .toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    .toUpperCase();
  return `${day}, ${time}`;
}

export interface CountdownBreakdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  /** "01d : 06h : 28m : 32s" */
  label: string;
  /** true once the target has passed */
  elapsed: boolean;
}

const pad = (value: number): string => String(Math.max(0, value)).padStart(2, '0');

export function toCountdown(remainingMs: number): CountdownBreakdown {
  const total = Math.max(0, remainingMs);
  const days = Math.floor(total / 86_400_000);
  const hours = Math.floor((total % 86_400_000) / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = Math.floor((total % 60_000) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    totalMs: total,
    elapsed: total <= 0,
    label: `${pad(days)}d : ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`,
  };
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export const stateLabels: Record<CompetitionState, string> = {
  UPCOMING: 'Coming Soon',
  REGISTRATION_OPEN: 'Registration Open',
  FULL: 'Competition Full',
  REGISTRATION_CLOSED: 'Registration Closed',
  LIVE: 'Live Now',
  ENDED: 'Ended',
};

/** Short, user-facing copy for each state - used by the CTA and badges. */
export const stateTone: Record<CompetitionState, 'primary' | 'success' | 'warning' | 'danger' | 'neutral'> = {
  UPCOMING: 'warning',
  REGISTRATION_OPEN: 'success',
  FULL: 'danger',
  REGISTRATION_CLOSED: 'neutral',
  LIVE: 'primary',
  ENDED: 'neutral',
};

const milestoneLabels = {
  REGISTRATION_OPENS: 'Registration opens in',
  REGISTRATION_CLOSES: 'Registration closes in',
  STARTS: 'Competition starts in',
  ENDS: 'Competition ends in',
} as const;

export function milestoneLabel(type: keyof typeof milestoneLabels): string {
  return milestoneLabels[type];
}
