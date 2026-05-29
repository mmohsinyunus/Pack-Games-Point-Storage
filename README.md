# ♠ Pack Points — Card Game Score Tracker

A modern, glassmorphism-styled portal to track card/pack game points between friends. Data is persisted in Google Sheets.

## Features

- **Player Management** — Register players with custom avatar colours
- **Game Types** — Register game types (Rummy, Poker, Teen Patti, etc.), each assigned a card suit
- **Rounds** — Create rounds per game, record points per player, close rounds with auto-sum
- **Dashboard** — Overall leaderboard with filters by game and date range
- **Per-Game View** — Individual game leaderboard and round history
- **Player Profile** — Each player's score history and per-game breakdown
- **Dark / Light Mode** — Toggle with one click, persists across sessions
- **Card Pack Theme** — Floating ♠ ♥ ♦ ♣ decorations, glassmorphism UI, casino-green gradient background

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** with glassmorphism custom classes
- **Google Sheets API v4** — data stored in the configured spreadsheet
- **SWR** — client-side data fetching and cache invalidation
- **React Hook Form** — forms with validation
- **Recharts** — leaderboard bar charts
- **next-themes** — dark/light mode
- **Framer Motion** — page animations

## Setup

### 1. Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create a project
2. Enable the **Google Sheets API**
3. Create a **Service Account**, download the JSON key file
4. Share your Google Sheet with the service account email as **Editor**

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `GOOGLE_SHEET_ID` | The ID from the sheet URL (already set: `1--w_CMfE39FE_ru7OusPDDLgUnhVLUWEPKyYfLMIBgU`) |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Full JSON string from the service account key file |
| `GOOGLE_SERVICE_ACCOUNT_B64` | Alternative: base64-encoded JSON (use either, not both) |

To base64-encode the JSON file:
```bash
base64 -w 0 service-account-key.json
```

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Google Sheet Tabs

The app auto-creates these tabs with headers on first use:

| Tab | Columns |
|-----|---------|
| Players | id, name, email, avatarColor, totalPoints, createdAt |
| Games | id, name, description, suit, createdAt |
| Rounds | id, gameId, gameName, name, date, status, createdAt, closedAt |
| Points | id, roundId, playerId, gameId, points, recordedAt |

## Deployment (Vercel)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables in Vercel project settings
4. Deploy — no database needed, everything lives in your Google Sheet

## Workflow

```
Register Players → Register Games → Create Round → Enter Points → Close Round → View Leaderboard
```
