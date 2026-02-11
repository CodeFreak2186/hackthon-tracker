'use client';
import { useState, useEffect, useCallback } from 'react';
import { Hackathon, Member, AppSettings, ViewType } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import HackathonDetail from '@/components/HackathonDetail';
import AddHackathonModal from '@/components/AddHackathonModal';
import SettingsPanel from '@/components/SettingsPanel';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface Toast { message: string; type: 'success' | 'error'; id: number; }

export default function Home() {
  const [view, setView] = useState<ViewType>('dashboard');
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ telegramBotToken: '', notifyDaysBefore: 3 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editHack, setEditHack] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { message, type, id }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  const fetchData = useCallback(async () => {
    try {
      const [hR, mR, sR] = await Promise.all([fetch('/api/hackathons'), fetch('/api/members'), fetch('/api/settings')]);
      if (hR.ok) setHackathons(await hR.json());
      if (mR.ok) setMembers(await mR.json());
      if (sR.ok) setSettings(await sR.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const createHackathon = async (data: Partial<Hackathon>) => {
    const res = await fetch('/api/hackathons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (res.ok) { const h = await res.json(); setHackathons(p => [...p, h]); setShowModal(false); toast('Hackathon created'); }
    else toast('Failed to create', 'error');
  };

  const updateHackathon = async (id: string, data: Partial<Hackathon>) => {
    const res = await fetch(`/api/hackathons/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (res.ok) { const updated = await res.json(); setHackathons(p => p.map(h => h.id === id ? updated : h)); toast('Updated'); }
    else toast('Update failed', 'error');
  };

  const deleteHackathon = async (id: string) => {
    const res = await fetch(`/api/hackathons/${id}`, { method: 'DELETE' });
    if (res.ok) { setHackathons(p => p.filter(h => h.id !== id)); setSelectedId(null); setView('dashboard'); toast('Deleted'); }
    else toast('Delete failed', 'error');
  };

  const addMember = async (data: Omit<Member, 'id'>) => {
    const res = await fetch('/api/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (res.ok) { const m = await res.json(); setMembers(p => [...p, m]); toast('Member added'); }
    else toast('Failed', 'error');
  };

  const deleteMember = async (id: string) => {
    const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
    if (res.ok) { setMembers(p => p.filter(m => m.id !== id)); toast('Member removed'); }
  };

  const saveSettings = async (s: AppSettings) => {
    const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) });
    if (res.ok) { setSettings(s); toast('Settings saved'); } else toast('Failed', 'error');
  };

  const notifyTelegram = async (hackathonId?: string) => {
    const res = await fetch('/api/telegram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(hackathonId ? { hackathonId } : {}) });
    const data = await res.json();
    toast(res.ok ? data.message : (data.error || 'Failed'), res.ok ? 'success' : 'error');
  };

  const selectHack = (id: string) => { setSelectedId(id); setView('detail'); };
  const goTo = (v: ViewType) => { setView(v); setSelectedId(null); };
  const selected = hackathons.find(h => h.id === selectedId);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={28} style={{ color: '#2563eb', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar hackathons={hackathons} currentView={view} onViewChange={goTo}
        onNewHackathon={() => { setEditHack(null); setShowModal(true); }}
        selectedId={selectedId} onSelectHackathon={selectHack} />

      <main className="app-main">
        {view === 'dashboard' && !selectedId && <Dashboard hackathons={hackathons} members={members} onSelect={selectHack} />}
        {view === 'detail' && selected && (
          <HackathonDetail hackathon={selected} members={members} onBack={() => goTo('dashboard')}
            onUpdate={d => updateHackathon(selected.id, d)} onDelete={() => deleteHackathon(selected.id)}
            onNotify={() => notifyTelegram(selected.id)} />
        )}
        {view === 'settings' && (
          <SettingsPanel settings={settings} members={members} onSaveSettings={saveSettings}
            onAddMember={addMember} onDeleteMember={deleteMember} onTestNotify={() => notifyTelegram()} />
        )}
      </main>

      {showModal && (
        <AddHackathonModal members={members} editingHackathon={editHack}
          onSubmit={editHack ? d => { updateHackathon(editHack.id, d); setShowModal(false); } : createHackathon}
          onClose={() => setShowModal(false)} />
      )}

      {/* Toasts */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 200, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type === 'success' ? 'toast-success' : 'toast-error'}`}>
            {t.type === 'success' ? <CheckCircle size={15} /> : <XCircle size={15} />}
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
