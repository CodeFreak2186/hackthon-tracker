import { HackathonStatus } from './types';

export function getStatus(startDate: string, endDate: string): HackathonStatus {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'upcoming';
    if (now > end) return 'completed';
    return 'ongoing';
}

export function formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function formatDateShort(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

export function getDaysUntil(date: string): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function generateCalendarUrl(
    name: string,
    startDate: string,
    endDate: string,
    description: string,
    link: string
): string {
    const fmtDate = (d: string) => {
        const dt = new Date(d);
        return dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const details = [description, '', `Hackathon: ${link}`].filter(Boolean).join('\n');

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: name,
        dates: `${fmtDate(startDate)}/${fmtDate(endDate)}`,
        details,
        sf: 'true',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateReminderCalendarUrl(
    name: string,
    deadlineDate: string,
    description: string,
    link: string
): string {
    const deadline = new Date(deadlineDate);
    const reminderStart = new Date(deadline);
    reminderStart.setDate(reminderStart.getDate() - 3);

    const fmtDate = (d: Date) => {
        return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const details = [
        `⚠️ DEADLINE: ${formatDate(deadlineDate)}`,
        '',
        description,
        '',
        `Link: ${link}`,
    ].join('\n');

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: `⏰ ${name} — Deadline Countdown`,
        dates: `${fmtDate(reminderStart)}/${fmtDate(deadline)}`,
        details,
        sf: 'true',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export const STATUS_CONFIG: Record<HackathonStatus, { label: string; color: string; bg: string; dot: string }> = {
    upcoming: { label: 'Upcoming', color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
    ongoing: { label: 'Ongoing', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
    completed: { label: 'Completed', color: 'text-stone-500', bg: 'bg-stone-100', dot: 'bg-stone-400' },
};

export const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    low: { label: 'Low', color: 'text-stone-600', bg: 'bg-stone-100' },
    medium: { label: 'Medium', color: 'text-amber-700', bg: 'bg-amber-50' },
    high: { label: 'High', color: 'text-red-700', bg: 'bg-red-50' },
};

export const RESOURCE_TYPES = [
    { value: 'link', label: 'Link' },
    { value: 'document', label: 'Document' },
    { value: 'design', label: 'Design' },
    { value: 'code', label: 'Code' },
    { value: 'submission', label: 'Submission' },
    { value: 'other', label: 'Other' },
] as const;
