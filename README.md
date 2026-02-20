# 🏆 Hackathon Tracker

A modern hackathon management tool built with **Next.js**, **Upstash Redis**, and **Telegram Bot** notifications. Track deadlines, manage team members, and get automated reminders.

## Features

- 📋 **Dashboard** — Overview of all hackathons with status indicators
- ⏰ **Countdown Timers** — Live deadline countdowns
- 👥 **Team Management** — Add members and assign them to hackathons
- 🔔 **Telegram Notifications** — Automated deadline reminders via Telegram bot
- 📅 **Google Calendar** — One-click calendar event creation
- 🏷️ **Tags & Priority** — Organize hackathons with tags and priority levels
- 📎 **Resources** — Attach links, documents, and submissions to each hackathon
- ☁️ **Cloud Storage** — Data stored in Upstash Redis (no local database needed)
- 🚀 **Vercel Cron** — Automated daily notification checks

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Upstash Redis
- **Notifications:** Telegram Bot API
- **Styling:** Vanilla CSS
- **Deployment:** Vercel

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/hackathon-tracker.git
cd hackathon-tracker
npm install
```

### 2. Set Up Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | ✅ | Your Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | Your Upstash Redis REST token |
| `TELEGRAM_BOT_TOKEN` | ❌ | Telegram bot token (can also set in app Settings) |

**Get Upstash Redis (free):** [console.upstash.com](https://console.upstash.com)

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Telegram Notifications Setup

1. Create a bot via [@BotFather](https://t.me/BotFather) on Telegram
2. Copy the bot token → paste it in **Settings** page or `.env.local`
3. Each team member must:
   - Open the bot on Telegram and press **"Start"**
   - Get their Chat ID from [@userinfobot](https://t.me/userinfobot)
4. Add the Chat ID to each member's profile in **Settings → Team Members**
5. Use the **"Test"** button next to each member to verify it works

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo on [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy — Vercel cron runs daily at 9 AM UTC to send reminders

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/hackathons` | GET, POST | List/create hackathons |
| `/api/hackathons/[id]` | PUT, DELETE | Update/delete a hackathon |
| `/api/members` | GET, POST | List/add team members |
| `/api/members/[id]` | PUT, DELETE | Update/delete a member |
| `/api/settings` | GET, PUT | App settings |
| `/api/telegram` | GET, POST | Send notifications (GET for cron) |
| `/api/telegram/test` | POST | Test bot connection & member messages |

## License

MIT
