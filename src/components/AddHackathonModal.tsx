'use client';
import { useState } from 'react';
import { Member, Hackathon } from '@/lib/types';
import { X } from 'lucide-react';

interface Props {
    members: Member[];
    editingHackathon?: Hackathon | null;
    onSubmit: (data: Partial<Hackathon>) => void;
    onClose: () => void;
}

export default function AddHackathonModal({ members, editingHackathon: e, onSubmit, onClose }: Props) {
    const [form, setForm] = useState({
        name: e?.name || '', link: e?.link || '', description: e?.description || '',
        githubLink: e?.githubLink || '', deadline: e?.deadline?.split('T')[0] || '',
        startDate: e?.startDate?.split('T')[0] || '', endDate: e?.endDate?.split('T')[0] || '',
        teamName: e?.teamName || '', memberIds: e?.memberIds || [] as string[],
        priority: e?.priority || 'medium' as 'low' | 'medium' | 'high', tags: e?.tags?.join(', ') || '',
    });
    const u = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
    const toggle = (id: string) => setForm(f => ({
        ...f, memberIds: f.memberIds.includes(id) ? f.memberIds.filter(m => m !== id) : [...f.memberIds, id]
    }));
    const submit = (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!form.name || !form.startDate || !form.endDate || !form.deadline) return;
        onSubmit({
            name: form.name, link: form.link, description: form.description,
            githubLink: form.githubLink, deadline: new Date(form.deadline).toISOString(),
            startDate: new Date(form.startDate).toISOString(), endDate: new Date(form.endDate).toISOString(),
            teamName: form.teamName, memberIds: form.memberIds, priority: form.priority,
            tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        });
    };
    return (
        <div className="modal-overlay" onClick={ev => ev.target === ev.currentTarget && onClose()}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{e ? 'Edit Hackathon' : 'New Hackathon'}</h2>
                    <button onClick={onClose} className="modal-close"><X size={16} /></button>
                </div>
                <form onSubmit={submit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label className="form-label">Hackathon Name *</label>
                        <input type="text" required value={form.name} onChange={ev => u('name', ev.target.value)} placeholder="e.g. HackMIT 2026" />
                    </div>
                    <div className="form-grid-2">
                        <div><label className="form-label">Hackathon Link</label>
                            <input type="url" value={form.link} onChange={ev => u('link', ev.target.value)} placeholder="https://..." /></div>
                        <div><label className="form-label">GitHub Repository</label>
                            <input type="url" value={form.githubLink} onChange={ev => u('githubLink', ev.target.value)} placeholder="https://github.com/..." /></div>
                    </div>
                    <div><label className="form-label">Description</label>
                        <textarea value={form.description} onChange={ev => u('description', ev.target.value)} placeholder="What are you building?" rows={3} style={{ resize: 'vertical' }} /></div>
                    <div className="form-grid-3">
                        <div><label className="form-label">Start Date *</label><input type="date" required value={form.startDate} onChange={ev => u('startDate', ev.target.value)} /></div>
                        <div><label className="form-label">End Date *</label><input type="date" required value={form.endDate} onChange={ev => u('endDate', ev.target.value)} /></div>
                        <div><label className="form-label">Deadline *</label><input type="date" required value={form.deadline} onChange={ev => u('deadline', ev.target.value)} /></div>
                    </div>
                    <div className="form-grid-2">
                        <div><label className="form-label">Team Name</label><input type="text" value={form.teamName} onChange={ev => u('teamName', ev.target.value)} placeholder="Team Phoenix" /></div>
                        <div><label className="form-label">Priority</label>
                            <select value={form.priority} onChange={ev => u('priority', ev.target.value)}>
                                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                            </select></div>
                    </div>
                    <div><label className="form-label">Tags (comma-separated)</label>
                        <input type="text" value={form.tags} onChange={ev => u('tags', ev.target.value)} placeholder="AI, blockchain, healthcare" /></div>
                    {members.length > 0 && (
                        <div><label className="form-label">Assign Members</label>
                            <div style={{ border: '1px solid #e5e5e5', borderRadius: 8, padding: 8, maxHeight: 140, overflowY: 'auto' }}>
                                {members.map(m => (
                                    <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}
                                        onMouseEnter={ev => { ev.currentTarget.style.background = '#fafaf9'; }} onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; }}>
                                        <input type="checkbox" checked={form.memberIds.includes(m.id)} onChange={() => toggle(m.id)} style={{ width: 16, height: 16, accentColor: '#2563eb' }} />
                                        <div className="avatar avatar-sm">{m.name.charAt(0).toUpperCase()}</div>
                                        <span style={{ fontSize: 13 }}>{m.name}</span>
                                        <span style={{ fontSize: 12, color: '#a3a3a3', marginLeft: 'auto' }}>{m.role}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                        <button type="submit" className="btn btn-primary">{e ? 'Save Changes' : 'Create Hackathon'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
