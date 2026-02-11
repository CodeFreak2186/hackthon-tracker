'use client';
import { Hackathon, Member } from '@/lib/types';
import { getStatus, formatDate, getDaysUntil } from '@/lib/utils';
import CountdownTimer from './CountdownTimer';
import { ExternalLink, Github, Calendar, Users, ArrowRight } from 'lucide-react';

interface Props {
    hackathon: Hackathon;
    members: Member[];
    onClick: () => void;
}

const STATUS_MAP: Record<string, { label: string; cls: string; dot: string }> = {
    upcoming: { label: 'Upcoming', cls: 'status-upcoming', dot: '#3b82f6' },
    ongoing: { label: 'Ongoing', cls: 'status-ongoing', dot: '#10b981' },
    completed: { label: 'Completed', cls: 'status-completed', dot: '#a3a3a3' },
};

const PRIO_MAP: Record<string, { label: string; cls: string }> = {
    low: { label: 'Low', cls: 'priority-low' },
    medium: { label: 'Medium', cls: 'priority-medium' },
    high: { label: 'High', cls: 'priority-high' },
};

export default function HackathonCard({ hackathon, members, onClick }: Props) {
    const status = getStatus(hackathon.startDate, hackathon.endDate);
    const sc = STATUS_MAP[status];
    const pc = PRIO_MAP[hackathon.priority] || PRIO_MAP.medium;
    const assigned = members.filter(m => hackathon.memberIds.includes(m.id));

    return (
        <div className="hack-card" onClick={onClick}>
            {/* Top */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <span className="hack-card-title">{hackathon.name}</span>
                <span className={`status-badge ${sc.cls}`}>
                    <span className="status-dot" style={{ background: sc.dot }} />
                    {sc.label}
                </span>
            </div>

            {/* Desc */}
            {hackathon.description && (
                <p className="hack-card-desc" style={{ marginBottom: 12 }}>{hackathon.description}</p>
            )}

            {/* Deadline */}
            {hackathon.deadline && status !== 'completed' && (
                <div className="hack-card-deadline" style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={13} style={{ color: '#a3a3a3' }} />
                        <span style={{ fontSize: 12, color: '#6b6b6b' }}>{formatDate(hackathon.deadline)}</span>
                    </div>
                    <CountdownTimer deadline={hackathon.deadline} compact />
                </div>
            )}

            {/* Meta */}
            <div className="hack-card-meta">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`priority-badge ${pc.cls}`}>{pc.label}</span>
                    {hackathon.teamName && (
                        <span style={{ fontSize: 11, color: '#a3a3a3', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Users size={11} /> {hackathon.teamName}
                        </span>
                    )}
                    {assigned.length > 0 && (
                        <div style={{ display: 'flex', marginLeft: 2 }}>
                            {assigned.slice(0, 3).map((m, i) => (
                                <div key={m.id} className="avatar avatar-sm" style={{ marginLeft: i > 0 ? -6 : 0 }} title={m.name}>
                                    {m.name.charAt(0).toUpperCase()}
                                </div>
                            ))}
                            {assigned.length > 3 && (
                                <div className="avatar avatar-sm" style={{ marginLeft: -6, background: '#f5f5f4', color: '#a3a3a3' }}>
                                    +{assigned.length - 3}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {hackathon.link && (
                        <a href={hackathon.link} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()} className="icon-btn" title="Hackathon link">
                            <ExternalLink size={13} />
                        </a>
                    )}
                    {hackathon.githubLink && (
                        <a href={hackathon.githubLink} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()} className="icon-btn" title="GitHub">
                            <Github size={13} />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
