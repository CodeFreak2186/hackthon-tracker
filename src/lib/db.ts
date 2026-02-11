import { Redis } from '@upstash/redis';
import { Hackathon, Member, AppSettings } from './types';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const HACKATHONS_KEY = 'hq:hackathons';
const MEMBERS_KEY = 'hq:members';
const SETTINGS_KEY = 'hq:settings';

// ─── Hackathons ──────────────────────────────────────────────

export async function getHackathons(): Promise<Hackathon[]> {
    const data = await redis.get<Hackathon[]>(HACKATHONS_KEY);
    return data || [];
}

export async function saveHackathons(hackathons: Hackathon[]): Promise<void> {
    await redis.set(HACKATHONS_KEY, hackathons);
}

export async function getHackathon(id: string): Promise<Hackathon | null> {
    const hackathons = await getHackathons();
    return hackathons.find(h => h.id === id) || null;
}

export async function addHackathon(hackathon: Hackathon): Promise<void> {
    const hackathons = await getHackathons();
    hackathons.push(hackathon);
    await saveHackathons(hackathons);
}

export async function updateHackathon(id: string, data: Partial<Hackathon>): Promise<Hackathon | null> {
    const hackathons = await getHackathons();
    const index = hackathons.findIndex(h => h.id === id);
    if (index === -1) return null;
    hackathons[index] = { ...hackathons[index], ...data, updatedAt: new Date().toISOString() };
    await saveHackathons(hackathons);
    return hackathons[index];
}

export async function deleteHackathon(id: string): Promise<boolean> {
    const hackathons = await getHackathons();
    const filtered = hackathons.filter(h => h.id !== id);
    if (filtered.length === hackathons.length) return false;
    await saveHackathons(filtered);
    return true;
}

// ─── Members ─────────────────────────────────────────────────

export async function getMembers(): Promise<Member[]> {
    const data = await redis.get<Member[]>(MEMBERS_KEY);
    return data || [];
}

export async function saveMembers(members: Member[]): Promise<void> {
    await redis.set(MEMBERS_KEY, members);
}

export async function addMember(member: Member): Promise<void> {
    const members = await getMembers();
    members.push(member);
    await saveMembers(members);
}

export async function updateMember(id: string, data: Partial<Member>): Promise<Member | null> {
    const members = await getMembers();
    const index = members.findIndex(m => m.id === id);
    if (index === -1) return null;
    members[index] = { ...members[index], ...data };
    await saveMembers(members);
    return members[index];
}

export async function deleteMember(id: string): Promise<boolean> {
    const members = await getMembers();
    const filtered = members.filter(m => m.id !== id);
    if (filtered.length === members.length) return false;
    await saveMembers(filtered);
    return true;
}

// ─── Settings ────────────────────────────────────────────────

export async function getSettings(): Promise<AppSettings> {
    const data = await redis.get<AppSettings>(SETTINGS_KEY);
    return data || { telegramBotToken: '', notifyDaysBefore: 3 };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
    await redis.set(SETTINGS_KEY, settings);
}
