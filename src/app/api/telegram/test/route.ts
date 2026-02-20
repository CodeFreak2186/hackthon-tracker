import { NextRequest, NextResponse } from 'next/server';
import { getSettings, getMembers } from '@/lib/db';

async function sendTelegramMessage(botToken: string, chatId: string, message: string) {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
    });
    return res.json();
}

async function verifyBotToken(botToken: string) {
    const url = `https://api.telegram.org/bot${botToken}/getMe`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        return data;
    } catch {
        return { ok: false, description: 'Network error: could not reach Telegram API' };
    }
}

// POST — test connection or send test message to a specific member
export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const { action, memberId } = body;

        const settings = await getSettings();
        const botToken = settings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;

        if (!botToken) {
            return NextResponse.json({
                success: false,
                error: 'No bot token configured. Set it in Settings or in .env.local as TELEGRAM_BOT_TOKEN.'
            }, { status: 400 });
        }

        // Action 1: Verify bot token is valid
        if (action === 'verify-token') {
            const result = await verifyBotToken(botToken);
            if (result.ok) {
                return NextResponse.json({
                    success: true,
                    botName: result.result.first_name,
                    botUsername: result.result.username,
                    message: `✅ Bot "${result.result.first_name}" (@${result.result.username}) is connected and working!`
                });
            } else {
                return NextResponse.json({
                    success: false,
                    error: `❌ Invalid bot token: ${result.description || 'Unknown error'}`
                }, { status: 400 });
            }
        }

        // Action 2: Send a test message to a specific member
        if (action === 'test-member' && memberId) {
            const members = await getMembers();
            const member = members.find(m => m.id === memberId);
            if (!member) {
                return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
            }
            if (!member.telegramChatId) {
                return NextResponse.json({
                    success: false,
                    error: `${member.name} has no Telegram Chat ID configured. Please add their Chat ID first.`
                }, { status: 400 });
            }

            // First verify the token
            const tokenCheck = await verifyBotToken(botToken);
            if (!tokenCheck.ok) {
                return NextResponse.json({
                    success: false,
                    error: `Bot token is invalid: ${tokenCheck.description}`
                }, { status: 400 });
            }

            const testMessage = [
                `<b>🔔 Test Notification</b>`,
                ``,
                `Hey ${member.name}! This is a test message from Hackathon Tracker.`,
                ``,
                `✅ Your Telegram notifications are working correctly!`,
                `📱 Chat ID: <code>${member.telegramChatId}</code>`,
                `🤖 Bot: @${tokenCheck.result.username}`,
            ].join('\n');

            const res = await sendTelegramMessage(botToken, member.telegramChatId, testMessage);

            if (res.ok) {
                return NextResponse.json({
                    success: true,
                    message: `✅ Test message sent to ${member.name} successfully!`
                });
            } else {
                // Provide helpful error messages based on Telegram API error
                let helpText = '';
                const desc = res.description || '';

                if (desc.includes('chat not found')) {
                    helpText = `The Chat ID "${member.telegramChatId}" is invalid. ` +
                        `Make sure ${member.name} has started a conversation with the bot first by ` +
                        `opening @${tokenCheck.result.username} on Telegram and pressing "Start". ` +
                        `Then use @userinfobot to get the correct Chat ID.`;
                } else if (desc.includes('bot was blocked by the user')) {
                    helpText = `${member.name} has blocked the bot. They need to unblock @${tokenCheck.result.username} on Telegram.`;
                } else if (desc.includes('user is deactivated')) {
                    helpText = `The Telegram account associated with this Chat ID is deactivated.`;
                } else {
                    helpText = desc;
                }

                return NextResponse.json({
                    success: false,
                    error: `❌ Failed to send to ${member.name}: ${helpText}`
                }, { status: 400 });
            }
        }

        // Action 3: Send test to all configured members
        if (action === 'test-all') {
            const tokenCheck = await verifyBotToken(botToken);
            if (!tokenCheck.ok) {
                return NextResponse.json({
                    success: false,
                    error: `Bot token is invalid: ${tokenCheck.description}`
                }, { status: 400 });
            }

            const members = await getMembers();
            const configured = members.filter(m => m.telegramChatId);

            if (configured.length === 0) {
                return NextResponse.json({
                    success: false,
                    error: 'No members have Telegram Chat IDs configured. Add Chat IDs in Settings → Team Members.'
                }, { status: 400 });
            }

            const results: Array<{ name: string; success: boolean; error?: string }> = [];

            for (const member of configured) {
                const testMessage = [
                    `<b>🔔 Test Notification</b>`,
                    ``,
                    `Hey ${member.name}! This is a test from Hackathon Tracker.`,
                    `✅ Your notifications are working!`,
                ].join('\n');

                try {
                    const res = await sendTelegramMessage(botToken, member.telegramChatId, testMessage);
                    if (res.ok) {
                        results.push({ name: member.name, success: true });
                    } else {
                        let helpText = res.description || 'Unknown error';
                        if (helpText.includes('chat not found')) {
                            helpText = `Chat ID "${member.telegramChatId}" not found. Member must start the bot first (@${tokenCheck.result.username}).`;
                        } else if (helpText.includes('bot was blocked')) {
                            helpText = `Member blocked the bot.`;
                        }
                        results.push({ name: member.name, success: false, error: helpText });
                    }
                } catch (err) {
                    results.push({ name: member.name, success: false, error: String(err) });
                }
            }

            const succeeded = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;

            return NextResponse.json({
                success: failed === 0,
                message: `Sent ${succeeded}/${configured.length} test messages${failed > 0 ? ` (${failed} failed)` : ''}`,
                results,
                botUsername: tokenCheck.result.username,
            });
        }

        return NextResponse.json({ success: false, error: 'Invalid action. Use verify-token, test-member, or test-all.' }, { status: 400 });

    } catch (e) {
        console.error('Telegram test error:', e);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
