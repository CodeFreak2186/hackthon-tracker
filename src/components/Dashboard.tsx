'use client';
import { useState, useMemo } from 'react';
import { Hackathon, Member, HackathonStatus } from '@/lib/types';
import { getStatus } from '@/lib/utils';
import HackathonCard from './HackathonCard';
import { Search, Trophy } from 'lucide-react';

interface Props {
    hackathons: Hackathon[];
    members: Member[];
    onSelect: (id: string) => void;
}

const TABS: Array<{ key: HackathonStatus | 'all'; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'ongoing', label: 'Ongoing' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
];

export default function Dashboard({ hackathons, members, onSelect }: Props) {
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState<HackathonStatus | 'all'>('all');

    const filtered = useMemo(() => {
        return hackathons
            .filter(h => {
                const s = getStatus(h.startDate, h.endDate);
                if (tab !== 'all' && s !== tab) return false;
                if (search) {
                    const q = search.toLowerCase();
                    return h.name.toLowerCase().includes(q) || h.description.toLowerCase().includes(q) ||
                        h.teamName.toLowerCase().includes(q) || h.tags.some(t => t.toLowerCase().includes(q));
                }
                return true;
            })
            .sort((a, b) => {
                const ord: Record<HackathonStatus, number> = { ongoing: 0, upcoming: 1, completed: 2 };
                const d = ord[getStatus(a.startDate, a.endDate)] - ord[getStatus(b.startDate, b.endDate)];
                return d !== 0 ? d : new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            });
    }, [hackathons, search, tab]);

    const counts = useMemo(() => {
        const c = { all: hackathons.length, upcoming: 0, ongoing: 0, completed: 0 };
        hackathons.forEach(h => { c[getStatus(h.startDate, h.endDate)]++; });
        return c;
    }, [hackathons]);

    return (
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Track and manage all your hackathons in one place</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-card-value">{counts.all}</div>
                    <div className="stat-card-label">Total</div>
                </div>
                <div className="stat-card stat-ongoing">
                    <div className="stat-card-value">{counts.ongoing}</div>
                    <div className="stat-card-label">Ongoing</div>
                </div>
                <div className="stat-card stat-upcoming">
                    <div className="stat-card-value">{counts.upcoming}</div>
                    <div className="stat-card-label">Upcoming</div>
                </div>
                <div className="stat-card stat-completed">
                    <div className="stat-card-value">{counts.completed}</div>
                    <div className="stat-card-label">Completed</div>
                </div>
            </div>

            {/* Search & Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div className="search-wrapper">
                    <Search size={15} />
                    <input
                        type="text"
                        placeholder="Search hackathons..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="filter-tabs">
                    {TABS.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`filter-tab ${tab === t.key ? 'active' : ''}`}
                        >
                            {t.label}
                            <span className="filter-tab-count">{counts[t.key]}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon"><Trophy size={24} /></div>
                    <h3>No hackathons found</h3>
                    <p>{search ? 'Try adjusting your search terms' : 'Click "New Hackathon" in the sidebar to get started'}</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    {filtered.map(h => (
                        <HackathonCard key={h.id} hackathon={h} members={members} onClick={() => onSelect(h.id)} />
                    ))}
                </div>
            )}
        </div>
    );
}
