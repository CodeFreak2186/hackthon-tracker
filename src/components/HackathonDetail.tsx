'use client';
import { useState, useEffect } from 'react';
import { Hackathon, Member, Resource } from '@/lib/types';
import { getStatus, formatDate, getDaysUntil, generateCalendarUrl, generateReminderCalendarUrl, RESOURCE_TYPES } from '@/lib/utils';
import CountdownTimer from './CountdownTimer';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, ExternalLink, Github, CalendarPlus, Bell, Trash2, Plus, X, Edit3, Save, Link2, FileText, Palette, Code2, Upload, MoreHorizontal, Users, Clock, Tag, AlertTriangle } from 'lucide-react';

interface Props {
    hackathon: Hackathon;
    members: Member[];
    onBack: () => void;
    onUpdate: (data: Partial<Hackathon>) => void;
    onDelete: () => void;
    onNotify: () => void;
}

const RES_ICONS: Record<string, React.ElementType> = {
    link: Link2, document: FileText, design: Palette, code: Code2, submission: Upload, other: MoreHorizontal,
};

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

export default function HackathonDetail({ hackathon, members, onBack, onUpdate, onDelete, onNotify }: Props) {
    const status = getStatus(hackathon.startDate, hackathon.endDate);
    const sc = STATUS_MAP[status]; const pc = PRIO_MAP[hackathon.priority] || PRIO_MAP.medium;
    const daysUntil = getDaysUntil(hackathon.deadline);

    const [editDesc, setEditDesc] = useState(false);
    const [desc, setDesc] = useState(hackathon.description || '');
    const [editNotes, setEditNotes] = useState(false);
    const [notes, setNotes] = useState(hackathon.notes || '');
    const [showResForm, setShowResForm] = useState(false);
    const [newRes, setNewRes] = useState({ name: '', url: '', type: 'link' as Resource['type'] });
    const [showMemSel, setShowMemSel] = useState(false);
    const [newTag, setNewTag] = useState('');

    useEffect(() => { setDesc(hackathon.description || ''); setNotes(hackathon.notes || ''); }, [hackathon]);

    const assigned = members.filter(m => hackathon.memberIds.includes(m.id));
    const unassigned = members.filter(m => !hackathon.memberIds.includes(m.id));

    const addRes = () => {
        if (!newRes.name || !newRes.url) return;
        onUpdate({ resources: [...hackathon.resources, { id: uuidv4(), ...newRes, addedAt: new Date().toISOString() }] });
        setNewRes({ name: '', url: '', type: 'link' }); setShowResForm(false);
    };

    const addTag = () => {
        if (!newTag.trim() || hackathon.tags.includes(newTag.trim())) return;
        onUpdate({ tags: [...hackathon.tags, newTag.trim()] }); setNewTag('');
    };

    const calUrl = generateCalendarUrl(hackathon.name, hackathon.startDate, hackathon.endDate, hackathon.description, hackathon.link);
    const remUrl = generateReminderCalendarUrl(hackathon.name, hackathon.deadline, hackathon.description, hackathon.link);

    return (
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
            {/* Back */}
            <button onClick={onBack} className="btn btn-ghost" style={{ marginBottom: 16, marginLeft: -8 }}>
                <ArrowLeft size={15} /> Back
            </button>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 28 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span className={`status-badge ${sc.cls}`}>
                            <span className="status-dot" style={{ background: sc.dot }} /> {sc.label}
                        </span>
                        <span className={`priority-badge ${pc.cls}`}>{pc.label} Priority</span>
                    </div>
                    <h1 className="page-title">{hackathon.name}</h1>
                    {hackathon.teamName && (
                        <p style={{ fontSize: 13, color: '#6b6b6b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Users size={14} /> Team: {hackathon.teamName}
                        </p>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {hackathon.link && <a href={hackathon.link} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm"><ExternalLink size={13} />Open</a>}
                    {hackathon.githubLink && <a href={hackathon.githubLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm"><Github size={13} />GitHub</a>}
                    <button onClick={() => { if (confirm('Delete this hackathon?')) onDelete(); }} className="btn btn-danger btn-sm"><Trash2 size={13} /></button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                {/* Left */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Countdown */}
                    {hackathon.deadline && status !== 'completed' && (
                        <div className="detail-section">
                            <div className="detail-section-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Clock size={15} style={{ color: '#6b6b6b' }} />
                                    <span className="detail-section-title">Deadline Countdown</span>
                                </div>
                                {daysUntil >= 0 && daysUntil <= 3 && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#dc2626', background: '#fef2f2', padding: '2px 10px', borderRadius: 999 }}>
                                        <AlertTriangle size={11} />Urgent
                                    </span>
                                )}
                            </div>
                            <CountdownTimer deadline={hackathon.deadline} />
                            <p style={{ fontSize: 12, color: '#a3a3a3', marginTop: 10 }}>Deadline: {formatDate(hackathon.deadline)}</p>
                        </div>
                    )}

                    {/* Description */}
                    <div className="detail-section">
                        <div className="detail-section-header">
                            <span className="detail-section-title">Description</span>
                            <button onClick={() => { if (editDesc) onUpdate({ description: desc }); setEditDesc(!editDesc); }} className="btn btn-ghost btn-sm">
                                {editDesc ? <><Save size={13} />Save</> : <><Edit3 size={13} />Edit</>}
                            </button>
                        </div>
                        {editDesc ? (
                            <textarea value={desc} onChange={e => setDesc(e.target.value)} style={{ minHeight: 100 }} placeholder="Add a description..." />
                        ) : (
                            <p style={{ fontSize: 13, color: '#6b6b6b', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                {hackathon.description || 'No description yet. Click Edit to add one.'}
                            </p>
                        )}
                    </div>

                    {/* Resources */}
                    <div className="detail-section">
                        <div className="detail-section-header">
                            <span className="detail-section-title">Resources ({hackathon.resources.length})</span>
                            <button onClick={() => setShowResForm(!showResForm)} className="btn btn-ghost btn-sm"><Plus size={13} />Add</button>
                        </div>

                        {showResForm && (
                            <div style={{ border: '1px solid #e5e5e5', borderRadius: 8, padding: 14, marginBottom: 14, background: '#fafaf9' }}>
                                <div className="form-grid-2" style={{ marginBottom: 8 }}>
                                    <input type="text" placeholder="Resource name" value={newRes.name} onChange={e => setNewRes(r => ({ ...r, name: e.target.value }))} />
                                    <select value={newRes.type} onChange={e => setNewRes(r => ({ ...r, type: e.target.value as Resource['type'] }))}>
                                        {RESOURCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <input type="url" placeholder="URL" value={newRes.url} onChange={e => setNewRes(r => ({ ...r, url: e.target.value }))} style={{ marginBottom: 8 }} />
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={addRes} className="btn btn-primary btn-sm">Add Resource</button>
                                    <button onClick={() => setShowResForm(false)} className="btn btn-ghost btn-sm">Cancel</button>
                                </div>
                            </div>
                        )}

                        {hackathon.resources.length === 0 ? (
                            <p style={{ fontSize: 13, color: '#a3a3a3', textAlign: 'center', padding: '16px 0' }}>No resources added yet</p>
                        ) : (
                            hackathon.resources.map(r => {
                                const Icon = RES_ICONS[r.type] || Link2;
                                return (
                                    <div key={r.id} className="resource-row">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <Icon size={14} style={{ color: '#a3a3a3' }} />
                                            <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-link" style={{ fontSize: 13 }}>{r.name}</a>
                                            <span style={{ fontSize: 11, color: '#a3a3a3', background: '#f5f5f4', padding: '1px 7px', borderRadius: 4 }}>{r.type}</span>
                                        </div>
                                        <button onClick={() => onUpdate({ resources: hackathon.resources.filter(x => x.id !== r.id) })} className="icon-btn icon-btn-danger delete-btn">
                                            <X size={12} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Notes */}
                    <div className="detail-section">
                        <div className="detail-section-header">
                            <span className="detail-section-title">Notes</span>
                            <button onClick={() => { if (editNotes) onUpdate({ notes }); setEditNotes(!editNotes); }} className="btn btn-ghost btn-sm">
                                {editNotes ? <><Save size={13} />Save</> : <><Edit3 size={13} />Edit</>}
                            </button>
                        </div>
                        {editNotes ? (
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ minHeight: 120 }} placeholder="Add notes, ideas, todos..." />
                        ) : (
                            <p style={{ fontSize: 13, color: '#6b6b6b', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                {hackathon.notes || 'No notes yet. Click Edit to add notes.'}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Actions */}
                    <div className="detail-section" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span className="detail-label">Actions</span>
                        <a href={calUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-block"><CalendarPlus size={14} />Add to Calendar</a>
                        {hackathon.deadline && <a href={remUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-block"><Bell size={14} />Add Reminder (3 day)</a>}
                        <button onClick={onNotify} className="btn btn-secondary btn-block"><Bell size={14} />Notify via Telegram</button>
                    </div>

                    {/* Dates */}
                    <div className="detail-section">
                        <span className="detail-label">Dates</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                            {[['Start', hackathon.startDate], ['End', hackathon.endDate], ['Deadline', hackathon.deadline]].map(([l, d]) => (
                                <div key={l} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6b6b6b' }}>{l}</span>
                                    <span style={{ fontWeight: 500, color: '#1a1a1a' }}>{formatDate(d)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Team */}
                    <div className="detail-section">
                        <div className="detail-section-header">
                            <span className="detail-label" style={{ marginBottom: 0 }}>Team ({assigned.length})</span>
                            <button onClick={() => setShowMemSel(!showMemSel)} className="btn btn-ghost btn-sm"><Plus size={12} /></button>
                        </div>
                        {showMemSel && unassigned.length > 0 && (
                            <div style={{ border: '1px solid #e5e5e5', borderRadius: 7, padding: 6, marginBottom: 10, background: '#fafaf9' }}>
                                {unassigned.map(m => (
                                    <button key={m.id} onClick={() => onUpdate({ memberIds: [...hackathon.memberIds, m.id] })}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 5, fontSize: 13, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', color: '#6b6b6b', textAlign: 'left' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#f0efee'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                                        <div className="avatar avatar-sm">{m.name.charAt(0).toUpperCase()}</div>
                                        {m.name}
                                    </button>
                                ))}
                            </div>
                        )}
                        {assigned.length === 0 ? (
                            <p style={{ fontSize: 12, color: '#a3a3a3', textAlign: 'center', padding: 8 }}>No members assigned</p>
                        ) : (
                            assigned.map(m => (
                                <div key={m.id} className="member-row">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div className="avatar avatar-md">{m.name.charAt(0).toUpperCase()}</div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{m.name}</div>
                                            <div style={{ fontSize: 11, color: '#a3a3a3' }}>{m.role}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => onUpdate({ memberIds: hackathon.memberIds.filter(id => id !== m.id) })} className="icon-btn icon-btn-danger delete-btn"><X size={11} /></button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Tags */}
                    <div className="detail-section">
                        <span className="detail-label">Tags</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                            {hackathon.tags.map(t => (
                                <span key={t} className="tag">
                                    <Tag size={10} /> {t}
                                    <button onClick={() => onUpdate({ tags: hackathon.tags.filter(x => x !== t) })} className="tag-remove"><X size={10} /></button>
                                </span>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <input type="text" placeholder="Add tag..." value={newTag} onChange={e => setNewTag(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addTag()} style={{ fontSize: 12, padding: '4px 8px' }} />
                            <button onClick={addTag} className="btn btn-ghost btn-sm"><Plus size={12} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
