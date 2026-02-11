'use client';
import { useState } from 'react';
import { Member, AppSettings } from '@/lib/types';
import { Plus, Trash2, Save, Send, Users, Bot, Bell } from 'lucide-react';

interface Props {
    settings: AppSettings;
    members: Member[];
    onSaveSettings: (s: AppSettings) => void;
    onAddMember: (m: Omit<Member, 'id'>) => void;
    onDeleteMember: (id: string) => void;
    onTestNotify: () => void;
}

export default function SettingsPanel({ settings, members, onSaveSettings, onAddMember, onDeleteMember, onTestNotify }: Props) {
    const [token, setToken] = useState(settings.telegramBotToken);
    const [days, setDays] = useState(settings.notifyDaysBefore);
    const [showAdd, setShowAdd] = useState(false);
    const [nm, setNm] = useState({ name: '', telegramChatId: '', email: '', role: 'Member' });

    return (
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div className="page-header">
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Configure integrations and manage your team</p>
            </div>

            {/* Telegram */}
            <div className="detail-section" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Bot size={18} style={{ color: '#3b82f6' }} />
                    <h2 style={{ fontSize: 15, fontWeight: 600 }}>Telegram Bot</h2>
                </div>
                <p style={{ fontSize: 13, color: '#6b6b6b', marginBottom: 16, lineHeight: 1.6 }}>
                    Create a bot via <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-link">@BotFather</a> on Telegram.
                    Each member needs to message the bot first and share their Chat ID (use <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-link">@userinfobot</a>).
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div><label className="form-label">Bot Token</label>
                        <input type="text" value={token} onChange={e => setToken(e.target.value)} placeholder="123456:ABC-DEF1234..." /></div>
                    <div><label className="form-label">Notify Days Before Deadline</label>
                        <input type="number" min={1} max={14} value={days} onChange={e => setDays(Number(e.target.value))} /></div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => onSaveSettings({ telegramBotToken: token, notifyDaysBefore: days })} className="btn btn-primary"><Save size={14} />Save Settings</button>
                        <button onClick={onTestNotify} className="btn btn-secondary"><Send size={14} />Test Notifications</button>
                    </div>
                </div>
            </div>

            {/* Members */}
            <div className="detail-section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Users size={18} style={{ color: '#10b981' }} />
                        <h2 style={{ fontSize: 15, fontWeight: 600 }}>Team Members ({members.length})</h2>
                    </div>
                    <button onClick={() => setShowAdd(!showAdd)} className="btn btn-secondary btn-sm"><Plus size={13} />Add Member</button>
                </div>

                {showAdd && (
                    <div style={{ border: '1px solid #e5e5e5', borderRadius: 8, padding: 16, marginBottom: 16, background: '#fafaf9' }}>
                        <div className="form-grid-2" style={{ marginBottom: 12 }}>
                            <div><label className="form-label">Name *</label><input type="text" value={nm.name} onChange={e => setNm(m => ({ ...m, name: e.target.value }))} placeholder="John Doe" /></div>
                            <div><label className="form-label">Role</label><input type="text" value={nm.role} onChange={e => setNm(m => ({ ...m, role: e.target.value }))} placeholder="Developer" /></div>
                        </div>
                        <div className="form-grid-2" style={{ marginBottom: 12 }}>
                            <div><label className="form-label">Telegram Chat ID</label><input type="text" value={nm.telegramChatId} onChange={e => setNm(m => ({ ...m, telegramChatId: e.target.value }))} placeholder="123456789" /></div>
                            <div><label className="form-label">Email</label><input type="email" value={nm.email} onChange={e => setNm(m => ({ ...m, email: e.target.value }))} placeholder="john@example.com" /></div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => { if (!nm.name) return; onAddMember(nm); setNm({ name: '', telegramChatId: '', email: '', role: 'Member' }); setShowAdd(false); }} className="btn btn-primary btn-sm">Add Member</button>
                            <button onClick={() => setShowAdd(false)} className="btn btn-ghost btn-sm">Cancel</button>
                        </div>
                    </div>
                )}

                {members.length === 0 ? (
                    <p style={{ fontSize: 13, color: '#a3a3a3', textAlign: 'center', padding: '24px 0' }}>No team members yet. Add members to assign them to hackathons and send notifications.</p>
                ) : (
                    members.map(m => (
                        <div key={m.id} className="member-row">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div className="avatar avatar-lg">{m.name.charAt(0).toUpperCase()}</div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{m.name}</div>
                                    <div style={{ fontSize: 12, color: '#a3a3a3' }}>{m.role}{m.email ? ` · ${m.email}` : ''}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {m.telegramChatId && (
                                    <span style={{ fontSize: 11, fontWeight: 600, color: '#059669', background: '#ecfdf5', padding: '2px 10px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Bell size={10} />Telegram
                                    </span>
                                )}
                                <button onClick={() => { if (confirm(`Remove ${m.name}?`)) onDeleteMember(m.id); }} className="icon-btn icon-btn-danger delete-btn"><Trash2 size={13} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
