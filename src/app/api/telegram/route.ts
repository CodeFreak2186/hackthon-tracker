import { NextRequest, NextResponse } from 'next/server';
import { getSettings, getHackathons, getMembers } from '@/lib/db';
import { getStatus, getDaysUntil, formatDate } from '@/lib/utils';

async function sendTelegramMessage(botToken: string, chatId: string, message: string) {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
        });
        return await res.json();
    } catch (err) {
        return { ok: false, description: `Network error: ${String(err)}` };
    }
}

async function verifyBotToken(botToken: string): Promise<{ valid: boolean; botName?: string; error?: string }> {
    try {
        const url = `https://api.telegram.org/bot${botToken}/getMe`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.ok) {
            return { valid: true, botName: `@${data.result.username}` };
        }
        return { valid: false, error: data.description || 'Invalid token' };
    } catch {
        return { valid: false, error: 'Could not reach Telegram API' };
    }
}

function getHumanReadableError(description: string, memberName: string, chatId: string, botName?: string): string {
    if (description.includes('chat not found')) {
        return `Chat ID "${chatId}" not found. ${memberName} must open ${botName || 'the bot'} on Telegram and press "Start" first, then use @userinfobot to get the correct Chat ID.`;
    }
    if (description.includes('bot was blocked by the user')) {
        return `${memberName} has blocked the bot on Telegram. They need to unblock it.`;
    }
    if (description.includes('user is deactivated')) {
        return `Telegram account for Chat ID "${chatId}" is deactivated.`;
    }
    if (description.includes('chat_id is empty')) {
        return `Chat ID is empty for ${memberName}. Please set a valid Chat ID.`;
    }
    return description;
}

async function handleNotify(body: { hackathonId?: string }) {
    const settings = await getSettings();
    const botToken = settings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
        return NextResponse.json({
            error: 'Telegram bot token not configured. Set it in Settings or as TELEGRAM_BOT_TOKEN environment variable.'
        }, { status: 400 });
    }

    // Verify bot token first
    const tokenCheck = await verifyBotToken(botToken);
    if (!tokenCheck.valid) {
        return NextResponse.json({
            error: `Invalid bot token: ${tokenCheck.error}. Please check your token in Settings.`
        }, { status: 400 });
    }

    const hackathons = await getHackathons();
    const members = await getMembers();
    const results: Array<{ hackathon: string; member: string; success: boolean; error?: string }> = [];

    let toNotify = hackathons;
    if (body.hackathonId) {
        toNotify = hackathons.filter(h => h.id === body.hackathonId);
        if (toNotify.length === 0) {
            return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
        }
    } else {
        toNotify = hackathons.filter(h => {
            if (getStatus(h.startDate, h.endDate) === 'completed') return false;
            const d = getDaysUntil(h.deadline);
            return d >= 0 && d <= (settings.notifyDaysBefore || 3);
        });
    }

    if (toNotify.length === 0) {
        return NextResponse.json({
            message: 'No hackathons need notifications right now.',
            hackathonsNotified: 0,
            results: [],
            info: body.hackathonId
                ? 'The specified hackathon was not found.'
                : `No hackathons have deadlines within ${settings.notifyDaysBefore || 3} days.`
        });
    }

    // Check if there are any members with Telegram configured
    const membersWithTelegram = members.filter(m => m.telegramChatId && m.telegramChatId.trim() !== '');
    if (membersWithTelegram.length === 0) {
        return NextResponse.json({
            message: 'No members have Telegram Chat IDs configured.',
            hackathonsNotified: toNotify.length,
            results: [],
            info: 'Add Telegram Chat IDs for team members in Settings → Team Members.'
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

        // Determine target members: hackathon-specific or all members
        const targetIds = hackathon.memberIds && hackathon.memberIds.length > 0
            ? hackathon.memberIds
            : members.map(m => m.id);
        const targets = members.filter(m =>
            targetIds.includes(m.id) && m.telegramChatId && m.telegramChatId.trim() !== ''
        );

        if (targets.length === 0) {
            results.push({
                hackathon: hackathon.name,
                member: '(none)',
                success: false,
                error: 'No assigned members have Telegram Chat IDs configured.'
            });
            continue;
        }

        for (const member of targets) {
            try {
                const res = await sendTelegramMessage(botToken, member.telegramChatId.trim(), message);
                if (res.ok === true) {
                    results.push({ hackathon: hackathon.name, member: member.name, success: true });
                } else {
                    const humanError = getHumanReadableError(
                        res.description || 'Unknown error',
                        member.name,
                        member.telegramChatId,
                        tokenCheck.botName
                    );
                    results.push({ hackathon: hackathon.name, member: member.name, success: false, error: humanError });
                }
            } catch (err) {
                results.push({ hackathon: hackathon.name, member: member.name, success: false, error: String(err) });
            }
        }
    }

    const ok = results.filter(r => r.success).length;
    const fail = results.filter(r => !r.success).length;

    return NextResponse.json({
        message: ok > 0
            ? `✅ Sent ${ok} notification${ok > 1 ? 's' : ''}${fail > 0 ? ` (${fail} failed)` : ''}`
            : `❌ All ${fail} notification${fail > 1 ? 's' : ''} failed`,
        hackathonsNotified: toNotify.length,
        results,
        botName: tokenCheck.botName,
    });
}

// GET — for Vercel cron job
export async function GET() {
    try {
        return await handleNotify({});
    } catch (e) {
        console.error('Telegram GET error:', e);
        return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
    }
}

// POST — manual trigger from UI
export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        return await handleNotify(body);
    } catch (e) {
        console.error('Telegram POST error:', e);
        return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
    }
}
