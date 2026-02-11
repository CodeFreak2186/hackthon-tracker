import { NextRequest, NextResponse } from 'next/server';
import { getSettings, getHackathons, getMembers } from '@/lib/db';
import { getStatus, getDaysUntil, formatDate } from '@/lib/utils';

async function sendTelegramMessage(botToken: string, chatId: string, message: string) {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
    });
    return res.json();
}

async function handleNotify(body: { hackathonId?: string }) {
    const settings = await getSettings();
    const botToken = settings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
        return NextResponse.json({ error: 'Telegram bot token not configured.' }, { status: 400 });
    }

    const hackathons = await getHackathons();
    const members = await getMembers();
    const results: Array<{ hackathon: string; member: string; success: boolean; error?: string }> = [];

    let toNotify = hackathons;
    if (body.hackathonId) {
        toNotify = hackathons.filter(h => h.id === body.hackathonId);
    } else {
        toNotify = hackathons.filter(h => {
            if (getStatus(h.startDate, h.endDate) === 'completed') return false;
            const d = getDaysUntil(h.deadline);
            return d >= 0 && d <= (settings.notifyDaysBefore || 3);
        });
    }

    for (const hackathon of toNotify) {
        const daysLeft = getDaysUntil(hackathon.deadline);
        const status = getStatus(hackathon.startDate, hackathon.endDate);
        let urgency = '';
        if (daysLeft === 0) urgency = '🚨 TODAY IS THE DEADLINE!';
        else if (daysLeft === 1) urgency = '⚠️ TOMORROW is the deadline!';
        else if (daysLeft <= 3) urgency = `⏰ Only ${daysLeft} days left!`;
        else urgency = `📅 ${daysLeft} days until deadline`;

        const message = [
            `<b>🏆 ${hackathon.name}</b>`, '', urgency, '',
            `<b>Deadline:</b> ${formatDate(hackathon.deadline)}`,
            `<b>Status:</b> ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            hackathon.teamName ? `<b>Team:</b> ${hackathon.teamName}` : '',
            '', hackathon.link ? `<a href="${hackathon.link}">🔗 Hackathon Link</a>` : '',
            hackathon.githubLink ? `<a href="${hackathon.githubLink}">💻 GitHub Repo</a>` : '',
        ].filter(Boolean).join('\n');

        const targetIds = hackathon.memberIds.length > 0 ? hackathon.memberIds : members.map(m => m.id);
        const targets = members.filter(m => targetIds.includes(m.id) && m.telegramChatId);

        for (const member of targets) {
            try {
                const res = await sendTelegramMessage(botToken, member.telegramChatId, message);
                results.push({ hackathon: hackathon.name, member: member.name, success: res.ok === true, error: res.ok ? undefined : res.description });
            } catch (err) {
                results.push({ hackathon: hackathon.name, member: member.name, success: false, error: String(err) });
            }
        }
    }

    const ok = results.filter(r => r.success).length;
    const fail = results.filter(r => !r.success).length;
    return NextResponse.json({ message: `Sent ${ok} notifications (${fail} failed)`, hackathonsNotified: toNotify.length, results });
}

// GET — for Vercel cron job
export async function GET() {
    try { return await handleNotify({}); }
    catch (e) { console.error(e); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

// POST — manual trigger from UI
export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        return await handleNotify(body);
    } catch (e) { console.error(e); return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
