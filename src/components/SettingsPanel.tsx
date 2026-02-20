'use client';
import { useState } from 'react';
import { Member, AppSettings } from '@/lib/types';
import { Plus, Trash2, Save, Send, Users, Bot, Bell, CheckCircle, XCircle, Loader2, Zap } from 'lucide-react';

interface Props {
    settings: AppSettings;
    members: Member[];
    onSaveSettings: (s: AppSettings) => void;
    onAddMember: (m: Omit<Member, 'id'>) => void;
    onDeleteMember: (id: string) => void;
    onUpdateMember: (id: string, data: Partial<Member>) => void;
    onTestNotify: () => void;
}

interface TestResult {
    success: boolean;
    message: string;
}

export default function SettingsPanel({ settings, members, onSaveSettings, onAddMember, onDeleteMember, onUpdateMember, onTestNotify }: Props) {
    const [token, setToken] = useState(settings.telegramBotToken);
    const [days, setDays] = useState(settings.notifyDaysBefore);
    const [showAdd, setShowAdd] = useState(false);
    const [nm, setNm] = useState({ name: '', telegramChatId: '', email: '', role: 'Member' });
    const [verifying, setVerifying] = useState(false);
    const [verifyResult, setVerifyResult] = useState<TestResult | null>(null);
    const [testingMember, setTestingMember] = useState<string | null>(null);
    const [memberTestResult, setMemberTestResult] = useState<Record<string, TestResult>>({});
    const [editingMember, setEditingMember] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<Member>>({});

    const verifyBot = async () => {
        setVerifying(true);
        setVerifyResult(null);
        try {
            // Save settings first to ensure the token is stored
            onSaveSettings({ telegramBotToken: token, notifyDaysBefore: days });

            const res = await fetch('/api/telegram/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'verify-token' }),
            });
            const data = await res.json();
            setVerifyResult({
                success: data.success,
                message: data.success ? data.message : (data.error || 'Verification failed'),
            });
        } catch {
            setVerifyResult({ success: false, message: 'Network error' });
        }
        setVerifying(false);
    };

    const testMember = async (memberId: string) => {
        setTestingMember(memberId);
        setMemberTestResult(prev => ({ ...prev, [memberId]: { success: false, message: 'Sending...' } }));
        try {
            const res = await fetch('/api/telegram/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'test-member', memberId }),
            });
            const data = await res.json();
            setMemberTestResult(prev => ({
                ...prev,
                [memberId]: { success: data.success, message: data.success ? data.message : (data.error || 'Failed') },
            }));
        } catch {
            setMemberTestResult(prev => ({
                ...prev,
                [memberId]: { success: false, message: 'Network error' },
            }));
        }
        setTestingMember(null);
    };

    const startEditing = (member: Member) => {
        setEditingMember(member.id);
        setEditData({ name: member.name, telegramChatId: member.telegramChatId, email: member.email, role: member.role });
    };

    const saveEdit = (id: string) => {
        onUpdateMember(id, editData);
        setEditingMember(null);
        setEditData({});
    };

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

                <div style={{ fontSize: 13, color: '#6b6b6b', marginBottom: 16, lineHeight: 1.8, background: '#f8f8f7', border: '1px solid #e5e5e5', borderRadius: 8, padding: 16 }}>
                    <strong style={{ color: '#1a1a1a' }}>Setup Instructions:</strong>
                    <ol style={{ margin: '8px 0 0 16px', padding: 0 }}>
                        <li>Create a bot via <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-link">@BotFather</a> on Telegram</li>
                        <li>Copy the bot token and paste it below</li>
                        <li>Each member must <strong>open the bot on Telegram and press &quot;Start&quot;</strong></li>
                        <li>Each member gets their Chat ID from <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-link">@userinfobot</a></li>
                        <li>Add the Chat ID to their member profile below</li>
                    </ol>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div><label className="form-label">Bot Token</label>
                        <input type="text" value={token} onChange={e => setToken(e.target.value)} placeholder="123456:ABC-DEF1234..." /></div>
                    <div><label className="form-label">Notify Days Before Deadline</label>
                        <input type="number" min={1} max={14} value={days} onChange={e => setDays(Number(e.target.value))} /></div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button onClick={() => onSaveSettings({ telegramBotToken: token, notifyDaysBefore: days })} className="btn btn-primary"><Save size={14} />Save Settings</button>
                        <button onClick={verifyBot} disabled={verifying || !token} className="btn btn-secondary">
                            {verifying ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={14} />}
                            Verify Bot
                        </button>
                        <button onClick={onTestNotify} className="btn btn-secondary"><Send size={14} />Send Notifications</button>
                    </div>

                    {verifyResult && (
                        <div style={{
                            padding: '10px 14px', borderRadius: 8, fontSize: 13, lineHeight: 1.5,
                            display: 'flex', alignItems: 'flex-start', gap: 8,
                            background: verifyResult.success ? '#ecfdf5' : '#fef2f2',
                            color: verifyResult.success ? '#065f46' : '#991b1b',
                            border: `1px solid ${verifyResult.success ? '#a7f3d0' : '#fecaca'}`,
                        }}>
                            {verifyResult.success ? <CheckCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} /> : <XCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} />}
                            <span>{verifyResult.message}</span>
                        </div>
                    )}
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
                        <div key={m.id} style={{ marginBottom: 8 }}>
                            <div className="member-row" style={{ flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                                    <div className="avatar avatar-lg">{m.name.charAt(0).toUpperCase()}</div>
                                    <div style={{ flex: 1 }}>
                                        {editingMember === m.id ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <div className="form-grid-2">
                                                    <div><label className="form-label">Name</label><input type="text" value={editData.name || ''} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} /></div>
                                                    <div><label className="form-label">Role</label><input type="text" value={editData.role || ''} onChange={e => setEditData(d => ({ ...d, role: e.target.value }))} /></div>
                                                </div>
                                                <div className="form-grid-2">
                                                    <div><label className="form-label">Telegram Chat ID</label><input type="text" value={editData.telegramChatId || ''} onChange={e => setEditData(d => ({ ...d, telegramChatId: e.target.value }))} placeholder="123456789" /></div>
                                                    <div><label className="form-label">Email</label><input type="email" value={editData.email || ''} onChange={e => setEditData(d => ({ ...d, email: e.target.value }))} /></div>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button onClick={() => saveEdit(m.id)} className="btn btn-primary btn-sm">Save</button>
                                                    <button onClick={() => { setEditingMember(null); setEditData({}); }} className="btn btn-ghost btn-sm">Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{m.name}</div>
                                                <div style={{ fontSize: 12, color: '#a3a3a3' }}>
                                                    {m.role}{m.email ? ` · ${m.email}` : ''}
                                                    {m.telegramChatId ? ` · ID: ${m.telegramChatId}` : ''}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {editingMember !== m.id && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                        {m.telegramChatId ? (
                                            <>
                                                <span style={{ fontSize: 11, fontWeight: 600, color: '#059669', background: '#ecfdf5', padding: '2px 10px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Bell size={10} />Telegram
                                                </span>
                                                <button
                                                    onClick={() => testMember(m.id)}
                                                    disabled={testingMember === m.id}
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ fontSize: 11, padding: '2px 8px' }}
                                                    title="Send test message to this member"
                                                >
                                                    {testingMember === m.id ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={11} />}
                                                    Test
                                                </button>
                                            </>
                                        ) : (
                                            <span style={{ fontSize: 11, color: '#d97706', background: '#fffbeb', padding: '2px 10px', borderRadius: 999 }}>
                                                No Chat ID
                                            </span>
                                        )}
                                        <button onClick={() => startEditing(m)} className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '2px 8px' }}>Edit</button>
                                        <button onClick={() => { if (confirm(`Remove ${m.name}?`)) onDeleteMember(m.id); }} className="icon-btn icon-btn-danger delete-btn"><Trash2 size={13} /></button>
                                    </div>
                                )}
                            </div>

                            {/* Per-member test result */}
                            {memberTestResult[m.id] && (
                                <div style={{
                                    padding: '8px 12px', borderRadius: 6, fontSize: 12, margin: '4px 0 8px 44px', lineHeight: 1.5,
                                    display: 'flex', alignItems: 'flex-start', gap: 6,
                                    background: memberTestResult[m.id].success ? '#ecfdf5' : '#fef2f2',
                                    color: memberTestResult[m.id].success ? '#065f46' : '#991b1b',
                                    border: `1px solid ${memberTestResult[m.id].success ? '#a7f3d0' : '#fecaca'}`,
                                }}>
                                    {memberTestResult[m.id].success
                                        ? <CheckCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                                        : <XCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />}
                                    <span>{memberTestResult[m.id].message}</span>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
