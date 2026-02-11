'use client';
import { Hackathon, HackathonStatus, ViewType } from '@/lib/types';
import { getStatus } from '@/lib/utils';
import { LayoutDashboard, Settings, Plus, Zap, Clock, CheckCircle2, Trophy } from 'lucide-react';

interface Props {
    hackathons: Hackathon[];
    currentView: ViewType;
    onViewChange: (v: ViewType) => void;
    onNewHackathon: () => void;
    selectedId: string | null;
    onSelectHackathon: (id: string) => void;
}

export default function Sidebar({ hackathons, currentView, onViewChange, onNewHackathon, selectedId, onSelectHackathon }: Props) {
    const counts = hackathons.reduce(
        (acc, h) => { acc[getStatus(h.startDate, h.endDate)]++; return acc; },
        { upcoming: 0, ongoing: 0, completed: 0 } as Record<HackathonStatus, number>
    );

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon"><Trophy size={15} /></div>
                <span className="sidebar-logo-text">HackBoard</span>
            </div>

            <div style={{ padding: '0 12px', marginBottom: '8px' }}>
                <button onClick={onNewHackathon} className="btn btn-primary btn-block">
                    <Plus size={15} /> New Hackathon
                </button>
            </div>

            <nav style={{ padding: '0 8px', marginTop: '12px' }}>
                <div className="sidebar-section-label">Navigation</div>
                <button
                    onClick={() => onViewChange('dashboard')}
                    className={`sidebar-nav-btn ${currentView === 'dashboard' && !selectedId ? 'active' : ''}`}
                >
                    <LayoutDashboard size={16} style={{ opacity: 0.7 }} /> Dashboard
                </button>
                <button
                    onClick={() => onViewChange('settings')}
                    className={`sidebar-nav-btn ${currentView === 'settings' ? 'active' : ''}`}
                >
                    <Settings size={16} style={{ opacity: 0.7 }} /> Settings
                </button>
            </nav>

            <div style={{ padding: '0 8px', marginTop: '16px' }}>
                <div className="sidebar-section-label">Overview</div>
                <div className="sidebar-stat">
                    <Clock size={15} style={{ color: '#3b82f6' }} />
                    <span>Upcoming</span>
                    <span className="sidebar-stat-badge" style={{ background: '#eff6ff', color: '#2563eb' }}>{counts.upcoming}</span>
                </div>
                <div className="sidebar-stat">
                    <Zap size={15} style={{ color: '#10b981' }} />
                    <span>Ongoing</span>
                    <span className="sidebar-stat-badge" style={{ background: '#ecfdf5', color: '#059669' }}>{counts.ongoing}</span>
                </div>
                <div className="sidebar-stat">
                    <CheckCircle2 size={15} style={{ color: '#a3a3a3' }} />
                    <span>Completed</span>
                    <span className="sidebar-stat-badge" style={{ background: '#f5f5f4', color: '#737373' }}>{counts.completed}</span>
                </div>
            </div>

            <div style={{ padding: '0 8px', marginTop: '16px', flex: 1, overflowY: 'auto' }}>
                <div className="sidebar-section-label">Hackathons</div>
                {hackathons
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 20)
                    .map(h => {
                        const status = getStatus(h.startDate, h.endDate);
                        const dotColor = status === 'ongoing' ? '#10b981' : status === 'upcoming' ? '#3b82f6' : '#a3a3a3';
                        return (
                            <button key={h.id} onClick={() => onSelectHackathon(h.id)}
                                className={`sidebar-hack-btn ${selectedId === h.id ? 'active' : ''}`}>
                                <span className="sidebar-dot" style={{ background: dotColor }} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</span>
                            </button>
                        );
                    })}
            </div>
        </aside>
    );
}
