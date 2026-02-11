'use client';
import { useEffect, useState } from 'react';
import { getDaysUntil } from '@/lib/utils';

interface Props {
    deadline: string;
    compact?: boolean;
}

export default function CountdownTimer({ deadline, compact = false }: Props) {
    const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const tick = () => {
            const diff = new Date(deadline).getTime() - Date.now();
            if (diff <= 0) { setTime({ d: 0, h: 0, m: 0, s: 0 }); return; }
            setTime({
                d: Math.floor(diff / 86400000),
                h: Math.floor((diff % 86400000) / 3600000),
                m: Math.floor((diff % 3600000) / 60000),
                s: Math.floor((diff % 60000) / 1000),
            });
        };
        tick();
        const i = setInterval(tick, 1000);
        return () => clearInterval(i);
    }, [deadline]);

    if (!mounted) return null;

    const daysUntil = getDaysUntil(deadline);
    const isPast = daysUntil < 0;
    const isUrgent = daysUntil >= 0 && daysUntil <= 3;

    if (isPast) return <span style={{ color: '#a3a3a3', fontSize: compact ? 12 : 13 }}>Deadline passed</span>;

    if (compact) {
        return (
            <span className={`countdown-compact ${isUrgent ? 'urgent' : ''}`}>
                {time.d}d {time.h}h {time.m}m
            </span>
        );
    }

    const blocks = [
        { label: 'Days', val: time.d },
        { label: 'Hours', val: time.h },
        { label: 'Min', val: time.m },
        { label: 'Sec', val: time.s },
    ];

    return (
        <div style={{ display: 'flex', gap: 8 }}>
            {blocks.map(b => (
                <div key={b.label} className={`countdown-block ${isUrgent ? 'urgent' : ''}`}>
                    <span className="countdown-value">{String(b.val).padStart(2, '0')}</span>
                    <span className="countdown-label">{b.label}</span>
                </div>
            ))}
        </div>
    );
}
